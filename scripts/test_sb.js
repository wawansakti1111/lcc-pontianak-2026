import { createClient } from '@supabase/supabase-js';

const url = 'https://kdipssewqkwvxqkiqubz.supabase.co';
const key = 'sb_publishable_ICZ4LrEFyENXIVaxpGlfBw_6Kl7h3At';

const sb = createClient(url, key);

async function check() {
  const t = await sb.from('teams').select('*');
  const c = await sb.from('stage_config').select('*');
  const h = await sb.from('score_history').select('*');
  console.log('TEAMS COUNT:', t.data?.length, 'ERROR:', t.error?.message);
  if (t.data) {
    console.log('TEAMS SAMPLE:', t.data.slice(0, 3).map(x => `${x.category} - ${x.regu} - ${x.team_name}: ${x.score}`));
  }
  console.log('CONFIG:', c.data, 'ERROR:', c.error?.message);
  console.log('HISTORY COUNT:', h.data?.length, 'ERROR:', h.error?.message);
}

check();
