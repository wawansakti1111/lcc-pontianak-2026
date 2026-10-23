import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { StageConfig, Team, ScoreHistoryItem } from '../types';
import {
  getSupabaseClient,
  getLocalTeams,
  saveLocalTeams,
  getLocalStageConfig,
  saveLocalStageConfig,
  getLocalHistory,
  saveLocalHistory,
  localChannel
} from '../services/supabaseService';

export function useScoreboardData() {
  const [teams, setTeams] = useState<Team[]>(getLocalTeams);
  const [stageConfig, setStageConfig] = useState<StageConfig>(getLocalStageConfig);
  const [history, setHistory] = useState<ScoreHistoryItem[]>(getLocalHistory);
  const [deltas, setDeltas] = useState<Record<string, { value: number; timestamp: number }>>({});
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'local_simulation' | 'error'>(() => {
    return getSupabaseClient() ? 'connecting' : 'local_simulation';
  });

  // Keep a ref of teams to calculate score changes accurately
  const teamsRef = useRef<Team[]>(teams);
  useEffect(() => {
    teamsRef.current = teams;
  }, [teams]);

  const stageConfigRef = useRef<StageConfig>(stageConfig);
  useEffect(() => {
    stageConfigRef.current = stageConfig;
  }, [stageConfig]);

  // Last handled confetti timestamp
  const lastConfettiRef = useRef<number>(stageConfig.confetti_ts || 0);

  // Trigger floating delta badge for 2.5 seconds
  const triggerDelta = useCallback((teamId: string, value: number) => {
    const timestamp = Date.now();
    setDeltas((prev) => ({
      ...prev,
      [teamId]: { value, timestamp }
    }));

    setTimeout(() => {
      setDeltas((prev) => {
        if (prev[teamId]?.timestamp === timestamp) {
          const next = { ...prev };
          delete next[teamId];
          return next;
        }
        return prev;
      });
    }, 2500);
  }, []);

  // Fire celebratory fireworks confetti
  const fireConfetti = useCallback(() => {
    try {
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#00F0FF', '#FFE600', '#FF4D94', '#34D399', '#C084FC', '#FFFFFF'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.8 },
          colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.8 },
          colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch (e) {
      console.warn('Canvas confetti error:', e);
    }
  }, []);

  // Sync with Supabase Realtime or Local Mode
  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setConnectionStatus('local_simulation');

      // Local cross-tab broadcast channel listener
      const handleBroadcast = (e: MessageEvent) => {
        if (!e.data) return;
        if (e.data.type === 'TEAMS_UPDATED' && Array.isArray(e.data.teams)) {
          // Compare score changes for delta animations
          const incoming: Team[] = e.data.teams;
          incoming.forEach((newT) => {
            const oldT = teamsRef.current.find((t) => t.id === newT.id);
            if (oldT && oldT.score !== newT.score) {
              triggerDelta(newT.id, newT.score - oldT.score);
            }
          });
          setTeams(incoming);
        } else if (e.data.type === 'CONFIG_UPDATED' && e.data.config) {
          const newConfetti = e.data.config.confetti_ts;
          if (newConfetti && newConfetti > lastConfettiRef.current) {
            lastConfettiRef.current = newConfetti;
            fireConfetti();
          }
          setStageConfig(e.data.config);
        }
      };

      // Native browser storage event listener for cross-tab sync
      const handleStorage = (e: StorageEvent) => {
        if (e.key === 'lcc_2026_teams' && e.newValue) {
          try {
            const incoming: Team[] = JSON.parse(e.newValue);
            incoming.forEach((newT) => {
              const oldT = teamsRef.current.find((t) => t.id === newT.id);
              if (oldT && oldT.score !== newT.score) {
                triggerDelta(newT.id, newT.score - oldT.score);
              }
            });
            setTeams(incoming);
          } catch {
            // ignore
          }
        } else if (e.key === 'lcc_2026_config' && e.newValue) {
          try {
            const newConfig: StageConfig = JSON.parse(e.newValue);
            setStageConfig(newConfig);
          } catch {
            // ignore
          }
        } else if (e.key === 'lcc_2026_history' && e.newValue) {
          try {
            const newHistory: ScoreHistoryItem[] = JSON.parse(e.newValue);
            setHistory(newHistory);
          } catch {
            // ignore
          }
        }
      };

      localChannel?.addEventListener('message', handleBroadcast);
      window.addEventListener('storage', handleStorage);
      return () => {
        localChannel?.removeEventListener('message', handleBroadcast);
        window.removeEventListener('storage', handleStorage);
      };
    }

    setConnectionStatus('connecting');

    // Fetch initial data from Supabase
    async function fetchInitial() {
      if (!supabase) return;
      try {
        const [teamsRes, configRes, histRes] = await Promise.all([
          supabase.from('teams').select('*').order('id'),
          supabase.from('stage_config').select('*').eq('id', 1).single(),
          supabase.from('score_history').select('*').order('timestamp', { ascending: false }).limit(50)
        ]);

        if (teamsRes.error) {
          console.error('Supabase fetch error:', teamsRes.error);
          setConnectionStatus('local_simulation');
          return;
        }

        if (teamsRes.data && teamsRes.data.length > 0) {
          setTeams(teamsRes.data as Team[]);
          saveLocalTeams(teamsRes.data as Team[]);
        }
        if (configRes.data) {
          setStageConfig(configRes.data as StageConfig);
          saveLocalStageConfig(configRes.data as StageConfig);
          if (configRes.data.confetti_ts) {
            lastConfettiRef.current = configRes.data.confetti_ts;
          }
        }
        if (histRes.data && histRes.data.length > 0) {
          const mapped: ScoreHistoryItem[] = (histRes.data as any[]).map((row) => ({
            id: row.id,
            teamId: row.team_id,
            regu: row.regu,
            category: row.category,
            teamName: row.team_name,
            roundTitle: row.round_title,
            previousScore: row.previous_score,
            delta: row.delta,
            newScore: row.new_score,
            timestamp: Number(row.timestamp)
          }));
          setHistory(mapped);
          saveLocalHistory(mapped);
        } else if (histRes.data && histRes.data.length === 0) {
          setHistory([]);
          saveLocalHistory([]);
        }
        setConnectionStatus('connected');
      } catch (err) {
        console.error('Error fetching Supabase data:', err);
        setConnectionStatus('local_simulation');
      }
    }

    fetchInitial();

    // Setup Supabase Realtime subscription
    const channel = supabase
      .channel('realtime_lcc_scoreboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedTeam = payload.new as Team;
            setTeams((prev) => {
              const prevTeam = prev.find((t) => t.id === updatedTeam.id);
              if (prevTeam && prevTeam.score !== updatedTeam.score) {
                triggerDelta(updatedTeam.id, updatedTeam.score - prevTeam.score);
              }
              const next = prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t));
              saveLocalTeams(next);
              return next;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stage_config' },
        (payload) => {
          if (payload.new) {
            const newConfig = payload.new as StageConfig;
            if (newConfig.confetti_ts && newConfig.confetti_ts > lastConfettiRef.current) {
              lastConfettiRef.current = newConfig.confetti_ts;
              fireConfetti();
            }
            setStageConfig(newConfig);
            saveLocalStageConfig(newConfig);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'score_history' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const row = payload.new as any;
            const item: ScoreHistoryItem = {
              id: row.id,
              teamId: row.team_id,
              regu: row.regu,
              category: row.category,
              teamName: row.team_name,
              roundTitle: row.round_title,
              previousScore: row.previous_score,
              delta: row.delta,
              newScore: row.new_score,
              timestamp: Number(row.timestamp)
            };
            setHistory((prev) => {
              if (prev.some((h) => h.id === item.id)) return prev;
              const next = [item, ...prev].slice(0, 50);
              saveLocalHistory(next);
              return next;
            });
          } else if (payload.eventType === 'DELETE') {
            if (payload.old && (payload.old as any).id) {
              setHistory((prev) => {
                const next = prev.filter((h) => h.id !== (payload.old as any).id);
                saveLocalHistory(next);
                return next;
              });
            } else {
              setHistory([]);
              saveLocalHistory([]);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('error');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [triggerDelta, fireConfetti]);

  // Actions
  const updateScore = useCallback(
    async (teamId: string, delta: number) => {
      const targetTeam = teamsRef.current.find((t) => t.id === teamId);
      if (!targetTeam) return;

      const previousScore = targetTeam.score;
      const newScore = previousScore + delta;

      // Create history item for undo
      const historyItem: ScoreHistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        teamId,
        regu: targetTeam.regu,
        category: targetTeam.category,
        teamName: targetTeam.team_name,
        roundTitle: stageConfigRef.current.current_round_title || 'GRAND FINAL',
        previousScore,
        delta,
        newScore,
        timestamp: Date.now()
      };

      const nextHistory = [historyItem, ...history];
      setHistory(nextHistory);
      saveLocalHistory(nextHistory);

      triggerDelta(teamId, delta);

      // Local optimistic update
      const nextTeams = teamsRef.current.map((t) =>
        t.id === teamId ? { ...t, score: newScore } : t
      );
      setTeams(nextTeams);
      saveLocalTeams(nextTeams);

      // Cloud sync
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await Promise.all([
            supabase.from('teams').update({ score: newScore }).eq('id', teamId),
            supabase.from('score_history').insert({
              id: historyItem.id,
              team_id: historyItem.teamId,
              regu: historyItem.regu,
              category: historyItem.category,
              team_name: historyItem.teamName,
              round_title: historyItem.roundTitle,
              previous_score: historyItem.previousScore,
              delta: historyItem.delta,
              new_score: historyItem.newScore,
              timestamp: historyItem.timestamp
            })
          ]);
        } catch (err) {
          console.error('Failed to sync score to Supabase:', err);
        }
      }
    },
    [history, triggerDelta]
  );

  const setCustomScore = useCallback(
    async (teamId: string, score: number) => {
      const targetTeam = teamsRef.current.find((t) => t.id === teamId);
      if (!targetTeam) return;

      const delta = score - targetTeam.score;
      if (delta !== 0) {
        triggerDelta(teamId, delta);
      }

      const historyItem: ScoreHistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        teamId,
        regu: targetTeam.regu,
        category: targetTeam.category,
        teamName: targetTeam.team_name,
        roundTitle: stageConfigRef.current.current_round_title || 'GRAND FINAL',
        previousScore: targetTeam.score,
        delta,
        newScore: score,
        timestamp: Date.now()
      };

      const nextHistory = [historyItem, ...history];
      setHistory(nextHistory);
      saveLocalHistory(nextHistory);

      const nextTeams = teamsRef.current.map((t) =>
        t.id === teamId ? { ...t, score } : t
      );
      setTeams(nextTeams);
      saveLocalTeams(nextTeams);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await Promise.all([
            supabase.from('teams').update({ score }).eq('id', teamId),
            supabase.from('score_history').insert({
              id: historyItem.id,
              team_id: historyItem.teamId,
              regu: historyItem.regu,
              category: historyItem.category,
              team_name: historyItem.teamName,
              round_title: historyItem.roundTitle,
              previous_score: historyItem.previousScore,
              delta: historyItem.delta,
              new_score: historyItem.newScore,
              timestamp: historyItem.timestamp
            })
          ]);
        } catch (err) {
          console.error('Failed to sync custom score:', err);
        }
      }
    },
    [history, triggerDelta]
  );

  const undoLastAction = useCallback(async () => {
    if (history.length === 0) return;
    const [lastItem, ...restHistory] = history;

    // Revert target team's score to previousScore
    const nextTeams = teamsRef.current.map((t) =>
      t.id === lastItem.teamId ? { ...t, score: lastItem.previousScore } : t
    );

    triggerDelta(lastItem.teamId, -lastItem.delta);

    setTeams(nextTeams);
    saveLocalTeams(nextTeams);

    setHistory(restHistory);
    saveLocalHistory(restHistory);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('teams')
          .update({ score: lastItem.previousScore })
          .eq('id', lastItem.teamId);
      } catch (err) {
        console.error('Failed to undo score in Supabase:', err);
      }
    }
  }, [history, triggerDelta]);

  const updateTeamIdentity = useCallback(
    async (teamId: string, updates: Partial<Team>) => {
      const nextTeams = teamsRef.current.map((t) =>
        t.id === teamId ? { ...t, ...updates } : t
      );
      setTeams(nextTeams);
      saveLocalTeams(nextTeams);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('teams').update(updates).eq('id', teamId);
        } catch (err) {
          console.error('Failed to sync team update:', err);
        }
      }
    },
    []
  );

  const updateStageConfig = useCallback(
    async (updates: Partial<StageConfig>) => {
      const nextConfig = { ...stageConfig, ...updates };
      setStageConfig(nextConfig);
      saveLocalStageConfig(nextConfig);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('stage_config').update(updates).eq('id', 1);
        } catch (err) {
          console.error('Failed to sync stage config:', err);
        }
      }
    },
    [stageConfig]
  );

  const triggerConfettiRemote = useCallback(async () => {
    const timestamp = Date.now();
    fireConfetti();
    lastConfettiRef.current = timestamp;

    const nextConfig = { ...stageConfig, confetti_ts: timestamp };
    setStageConfig(nextConfig);
    saveLocalStageConfig(nextConfig);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('stage_config').update({ confetti_ts: timestamp }).eq('id', 1);
      } catch (err) {
        console.error('Failed to trigger confetti in Supabase:', err);
      }
    }
  }, [fireConfetti, stageConfig]);

  const resetAllScores = useCallback(async () => {
    const nextTeams = teamsRef.current.map((t) => ({ ...t, score: 0 }));
    setTeams(nextTeams);
    saveLocalTeams(nextTeams);
    setHistory([]);
    saveLocalHistory([]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await Promise.all([
          ...nextTeams.map((t) => supabase.from('teams').update({ score: 0 }).eq('id', t.id)),
          supabase.from('score_history').delete().neq('id', '')
        ]);
      } catch (err) {
        console.error('Failed to reset scores:', err);
      }
    }
  }, []);

  return {
    teams,
    stageConfig,
    history,
    deltas,
    connectionStatus,
    updateScore,
    setCustomScore,
    undoLastAction,
    updateTeamIdentity,
    updateStageConfig,
    triggerConfetti: triggerConfettiRemote,
    resetAllScores
  };
}
