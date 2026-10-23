import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\VICTUS\\.gemini\\antigravity\\brain\\e299fda5-095f-4090-8a5d-7807dcdce6f5';

async function snap() {
  const adminPath = `${artifactDir}\\verified_admin_cloud.png`;
  const stagePath = `${artifactDir}\\verified_stage_cloud.png`;

  console.log('Snapping admin...');
  await execFileAsync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--virtual-time-budget=2000',
    '--window-size=1366,768',
    `--screenshot=${adminPath}`,
    'http://localhost:5173/admin'
  ]);

  console.log('Snapping stage...');
  await execFileAsync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--virtual-time-budget=2000',
    '--window-size=1920,1080',
    `--screenshot=${stagePath}`,
    'http://localhost:5173/'
  ]);

  console.log('Done!');
}

snap().catch(console.error);
