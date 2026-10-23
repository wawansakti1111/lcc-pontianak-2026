import { createClient } from '@supabase/supabase-js';
import { execFile } from 'child_process';

const url = 'https://kdipssewqkwvxqkiqubz.supabase.co';
const key = 'sb_publishable_ICZ4LrEFyENXIVaxpGlfBw_6Kl7h3At';
const sb = createClient(url, key);
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const shotRaise = 'C:\\Users\\VICTUS\\.gemini\\antigravity\\brain\\e299fda5-095f-4090-8a5d-7807dcdce6f5\\stage_raised_bar_test.png';

async function testRaise() {
  console.log('Setting category mahasiswa_umum and raising Regu A to 200, Regu B to 100...');
  await sb.from('stage_config').update({ active_category_view: 'mahasiswa_umum' }).eq('id', 1);
  await sb.from('teams').update({ score: 200 }).eq('id', 'mhs_a');
  await sb.from('teams').update({ score: 100 }).eq('id', 'mhs_b');

  await new Promise(r => setTimeout(r, 2000));
  await new Promise(r => execFile(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--virtual-time-budget=3000',
    '--window-size=1920,1080',
    '--screenshot=' + shotRaise,
    'http://localhost:5173/'
  ], r));
  console.log('Captured raised bar screenshot!');

  // Reset back to 0 cleanly!
  await sb.from('teams').update({ score: 0 }).eq('id', 'mhs_a');
  await sb.from('teams').update({ score: 0 }).eq('id', 'mhs_b');
  console.log('Cleaned back to 0!');
}

testRaise();
