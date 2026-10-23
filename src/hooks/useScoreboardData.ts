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
  localChannel,
  setActiveRealtimeChannel,
  broadcastScoreboardEvent
} from '../services/supabaseService';

export function useScoreboardData() {
  const [teams, setTeams] = useState<Team[]>(getLocalTeams);
  const [stageConfig, setStageConfig] = useState<StageConfig>(getLocalStageConfig);
  const [history, setHistory] = useState<ScoreHistoryItem[]>(getLocalHistory);
  const [deltas, setDeltas] = useState<Record<string, { value: number; timestamp: number }>>({});
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'local_simulation' | 'error'>(() => {
    return getSupabaseClient() ? 'connecting' : 'local_simulation';
  });

  // Keep refs of teams and config to calculate score changes accurately and avoid stale closures
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

  // Helper to handle incoming team changes with delta animations
  const applyIncomingTeams = useCallback(
    (incoming: Team[]) => {
      incoming.forEach((newT) => {
        const oldT = teamsRef.current.find((t) => t.id === newT.id);
        if (oldT && oldT.score !== newT.score) {
          triggerDelta(newT.id, newT.score - oldT.score);
        }
      });
      setTeams(incoming);
      saveLocalTeams(incoming);
    },
    [triggerDelta]
  );

  // Helper to handle incoming config changes
  const applyIncomingConfig = useCallback(
    (incoming: StageConfig) => {
      if (incoming.confetti_ts && incoming.confetti_ts > lastConfettiRef.current) {
        lastConfettiRef.current = incoming.confetti_ts;
        fireConfetti();
      }
      setStageConfig(incoming);
      saveLocalStageConfig(incoming);
    },
    [fireConfetti]
  );

  // 1. ALWAYS ACTIVE: Cross-tab & local storage synchronization (0ms latency for same browser)
  useEffect(() => {
    const handleBroadcast = (e: MessageEvent) => {
      if (!e.data) return;
      if ((e.data.type === 'TEAMS_UPDATED' || e.data.type === 'TEAMS_UPDATE') && Array.isArray(e.data.teams || e.data.data)) {
        const list = (e.data.teams || e.data.data) as Team[];
        applyIncomingTeams(list);
      } else if ((e.data.type === 'CONFIG_UPDATED' || e.data.type === 'CONFIG_UPDATE') && (e.data.config || e.data.data)) {
        const cfg = (e.data.config || e.data.data) as StageConfig;
        applyIncomingConfig(cfg);
      } else if (e.data.type === 'RESET') {
        const resetTeams = teamsRef.current.map((t) => ({ ...t, score: 0 }));
        setTeams(resetTeams);
        setHistory([]);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'lcc_2026_teams' && e.newValue) {
        try {
          const incoming: Team[] = JSON.parse(e.newValue);
          applyIncomingTeams(incoming);
        } catch {
          // ignore
        }
      } else if (e.key === 'lcc_2026_config' && e.newValue) {
        try {
          const newConfig: StageConfig = JSON.parse(e.newValue);
          applyIncomingConfig(newConfig);
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
  }, [applyIncomingTeams, applyIncomingConfig]);

  // 2. SUPABASE REALTIME (WebSockets Broadcast + Postgres Changes) + BACKGROUND HEARTBEAT POLLING
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setConnectionStatus('local_simulation');
      return;
    }

    setConnectionStatus('connecting');

    // Silent background fetch to ensure state parity
    async function fetchFromCloud(isInitial = false) {
      if (!supabase) return;
      try {
        const [teamsRes, configRes, histRes] = await Promise.all([
          supabase.from('teams').select('*').order('id'),
          supabase.from('stage_config').select('*').eq('id', 1).single(),
          supabase.from('score_history').select('*').order('timestamp', { ascending: false }).limit(50)
        ]);

        if (teamsRes.error) {
          console.warn('Supabase fetch error:', teamsRes.error);
          return;
        }

        if (teamsRes.data && teamsRes.data.length > 0) {
          const cloudTeams = teamsRes.data as Team[];
          // Compare with ref
          let hasTeamDiff = isInitial;
          if (!hasTeamDiff) {
            hasTeamDiff = cloudTeams.some((ct) => {
              const current = teamsRef.current.find((t) => t.id === ct.id);
              return !current || current.score !== ct.score || current.team_name !== ct.team_name;
            });
          }
          if (hasTeamDiff) {
            applyIncomingTeams(cloudTeams);
          }
        }

        if (configRes.data) {
          const cloudConfig = configRes.data as StageConfig;
          let hasConfigDiff = isInitial;
          if (!hasConfigDiff) {
            const cur = stageConfigRef.current;
            hasConfigDiff =
              cur.active_category_view !== cloudConfig.active_category_view ||
              cur.presentation_mode !== cloudConfig.presentation_mode ||
              cur.sort_mode !== cloudConfig.sort_mode ||
              cur.current_round_title !== cloudConfig.current_round_title ||
              cur.confetti_ts !== cloudConfig.confetti_ts;
          }
          if (hasConfigDiff) {
            applyIncomingConfig(cloudConfig);
          }
        }

        if (histRes.data && (isInitial || histRes.data.length > 0)) {
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
        }

        setConnectionStatus('connected');
      } catch (err) {
        console.error('Error fetching Supabase data:', err);
      }
    }

    // Initial load
    fetchFromCloud(true);

    // Setup Supabase Realtime channel with Peer Broadcast & Postgres Changes
    const channel = supabase.channel('realtime_lcc_scoreboard', {
      config: {
        broadcast: { ack: false, self: false }
      }
    });

    // A. Ultra-low latency (< 50ms) direct WebSocket broadcast across devices
    channel.on('broadcast', { event: 'LCC_SYNC' }, (payload: any) => {
      const data = payload?.payload;
      if (!data) return;

      if ((data.type === 'TEAMS_UPDATE' || data.type === 'TEAMS_UPDATED') && Array.isArray(data.data)) {
        applyIncomingTeams(data.data as Team[]);
      } else if ((data.type === 'CONFIG_UPDATE' || data.type === 'CONFIG_UPDATED') && data.data) {
        applyIncomingConfig(data.data as StageConfig);
      } else if (data.type === 'RESET') {
        const resetTeams = teamsRef.current.map((t) => ({ ...t, score: 0 }));
        setTeams(resetTeams);
        setHistory([]);
      }
    });

    // B. Postgres Changes subscription
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, (payload) => {
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
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stage_config' }, (payload) => {
        if (payload.new) {
          applyIncomingConfig(payload.new as StageConfig);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'score_history' }, (payload) => {
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
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          setActiveRealtimeChannel(channel);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.warn(`Supabase channel ${status}, will poll as backup`);
          setActiveRealtimeChannel(null);
        }
      });

    // C. Fail-safe Polling Heartbeat every 2.5 seconds
    const pollInterval = setInterval(() => {
      fetchFromCloud(false);
    }, 2500);

    return () => {
      clearInterval(pollInterval);
      setActiveRealtimeChannel(null);
      supabase.removeChannel(channel);
    };
  }, [applyIncomingTeams, applyIncomingConfig, triggerDelta]);

  // Actions
  const updateScore = useCallback(
    async (teamId: string, delta: number) => {
      const targetTeam = teamsRef.current.find((t) => t.id === teamId);
      if (!targetTeam) return;

      const previousScore = targetTeam.score;
      const newScore = previousScore + delta;

      // 1. Create history item
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

      // 2. Local optimistic update
      const nextTeams = teamsRef.current.map((t) =>
        t.id === teamId ? { ...t, score: newScore } : t
      );
      setTeams(nextTeams);
      saveLocalTeams(nextTeams);

      // 3. Instant Peer & Cross-tab Broadcast
      broadcastScoreboardEvent('TEAMS_UPDATE', nextTeams);

      // 4. Cloud DB Persist
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

      broadcastScoreboardEvent('TEAMS_UPDATE', nextTeams);

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

    broadcastScoreboardEvent('TEAMS_UPDATE', nextTeams);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await Promise.all([
          supabase.from('teams').update({ score: lastItem.previousScore }).eq('id', lastItem.teamId),
          supabase.from('score_history').delete().eq('id', lastItem.id)
        ]);
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

      broadcastScoreboardEvent('TEAMS_UPDATE', nextTeams);

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
      const nextConfig = { ...stageConfigRef.current, ...updates };
      setStageConfig(nextConfig);
      saveLocalStageConfig(nextConfig);

      // Instant Broadcast to Stage
      broadcastScoreboardEvent('CONFIG_UPDATE', nextConfig);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('stage_config').update(updates).eq('id', 1);
        } catch (err) {
          console.error('Failed to sync stage config:', err);
        }
      }
    },
    []
  );

  const triggerConfettiRemote = useCallback(async () => {
    const timestamp = Date.now();
    fireConfetti();
    lastConfettiRef.current = timestamp;

    const nextConfig = { ...stageConfigRef.current, confetti_ts: timestamp };
    setStageConfig(nextConfig);
    saveLocalStageConfig(nextConfig);

    broadcastScoreboardEvent('CONFIG_UPDATE', nextConfig);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('stage_config').update({ confetti_ts: timestamp }).eq('id', 1);
      } catch (err) {
        console.error('Failed to trigger confetti in Supabase:', err);
      }
    }
  }, [fireConfetti]);

  const resetAllScores = useCallback(async () => {
    const nextTeams = teamsRef.current.map((t) => ({ ...t, score: 0 }));
    setTeams(nextTeams);
    saveLocalTeams(nextTeams);
    setHistory([]);
    saveLocalHistory([]);

    broadcastScoreboardEvent('RESET', null);

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
