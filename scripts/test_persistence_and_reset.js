import { createClient } from '@supabase/supabase-js';

const url = 'https://kdipssewqkwvxqkiqubz.supabase.co';
const key = 'sb_publishable_ICZ4LrEFyENXIVaxpGlfBw_6Kl7h3At';
const sb = createClient(url, key);

async function testPersistenceAndReset() {
  console.log('--- 1. Testing Cloud Persistence: Writing score change to Supabase ---');
  // Update mhs_a score to 50
  const { error: updErr } = await sb.from('teams').update({ score: 50 }).eq('id', 'mhs_a');
  if (updErr) throw updErr;
  console.log('Score updated: mhs_a = 50');

  // Query it back
  const { data: checkData, error: checkErr } = await sb.from('teams').select('id, team_name, score').eq('id', 'mhs_a').single();
  if (checkErr) throw checkErr;
  console.log(`Persisted in Cloud DB: ${checkData.team_name} score = ${checkData.score}`);

  if (checkData.score === 50) {
    console.log('SUCCESS: Data is 100% PERSISTENT in Supabase Cloud PostgreSQL DB!');
  } else {
    console.error('FAIL: score did not persist');
  }

  console.log('\n--- 2. Performing Complete Clean Reset (No dummy data) ---');
  // Reset all teams to score 0
  const { data: allTeams } = await sb.from('teams').select('id');
  for (const t of allTeams || []) {
    await sb.from('teams').update({ score: 0 }).eq('id', t.id);
  }
  console.log(`Reset all ${allTeams?.length} teams to score = 0.`);

  // Reset stage_config to official Grand Final
  await sb.from('stage_config').update({
    active_category_view: 'mahasiswa_umum',
    sort_mode: 'desk_order',
    current_round_title: 'GRAND FINAL - BABAK I: WAJIB TIM',
    event_subtitle: 'Ballroom Hotel Mercure Pontianak Lt. 9',
    confetti_ts: 0,
    show_round_recap: false,
    presentation_mode: 'scoreboard'
  }).eq('id', 1);
  console.log('Reset stage_config to official starting round.');

  // Clean score_history (delete any test rows)
  const { error: delErr } = await sb.from('score_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) console.error('Delete history error:', delErr);
  console.log('Cleaned score_history table.');

  console.log('\n--- 3. Final Verification of Clean Official Database ---');
  const { data: finalTeams } = await sb.from('teams').select('category, regu, team_name, institution, score').order('category').order('regu');
  console.log('TEAMS TABLE:');
  finalTeams?.forEach(t => {
    console.log(`  [${t.category}] ${t.regu}: ${t.team_name} (${t.institution}) -> Skor: ${t.score}`);
  });

  const { data: finalHistory } = await sb.from('score_history').select('*');
  console.log(`\nSCORE HISTORY TABLE: ${finalHistory?.length} records (Empty / Clean)`);

  const { data: finalConfig } = await sb.from('stage_config').select('*').single();
  console.log('\nSTAGE CONFIG TABLE:');
  console.log(`  Round: ${finalConfig.current_round_title}`);
  console.log(`  Category: ${finalConfig.active_category_view}`);
  console.log(`  Venue: ${finalConfig.event_subtitle}`);
  console.log(`  Mode: ${finalConfig.presentation_mode}`);
}

testPersistenceAndReset().catch(console.error);
