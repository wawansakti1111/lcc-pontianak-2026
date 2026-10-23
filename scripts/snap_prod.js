import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\VICTUS\\.gemini\\antigravity\\brain\\e299fda5-095f-4090-8a5d-7807dcdce6f5';

async function snapProd() {
  const adminPath = `${artifactDir}\\live_prod_admin.png`;
  const stagePath = `${artifactDir}\\live_prod_stage.png`;

  console.log('Snapping live production admin...');
  await execFileAsync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--virtual-time-budget=3000',
    '--window-size=1366,768',
    `--screenshot=${adminPath}`,
    'https://cloud-live-scoreboard.vercel.app/admin'
  ]);

  console.log('Snapping live production stage...');
  await execFileAsync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--virtual-time-budget=3000',
    '--window-size=1920,1080',
    `--screenshot=${stagePath}`,
    'https://cloud-live-scoreboard.vercel.app/'
  ]);

  console.log('Done live prod snaps!');
}

snapProd().catch(console.error);
