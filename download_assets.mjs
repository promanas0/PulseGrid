import fs from 'fs';
import path from 'path';

const baseUrl = 'https://agent-ai.nextjsshop-preview.workers.dev';
const images = [
  'hero-bg.png',
  'video-poster.png',
  'logo.svg',
  'images/dashboard-data.png',
  'images/dashboard-tools.png',
  'images/dashboard-agent.png',
  'images/dashboard-governance.png',
  'images/how-it-works/step-1.png',
  'images/how-it-works/step-2.png',
  'images/how-it-works/step-3.png',
  'images/capabilities/native-access.png',
  'images/capabilities/integrations.png',
  'images/capabilities/unified-data.png',
  'images/capabilities/audit-logs.png',
  'images/compliance/aicpa-soc.png',
  'images/compliance/sso-saml.png'
];

async function downloadAll() {
  for (const rel of images) {
    const url = `${baseUrl}/${rel}`;
    const dest = path.join(process.cwd(), rel);
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    try {
      console.log(`Downloading ${url}...`);
      const res = await fetch(url);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(dest, Buffer.from(buffer));
        console.log(`Saved ${dest} (${buffer.byteLength} bytes)`);
      } else {
        console.error(`Failed ${url}: ${res.status}`);
      }
    } catch (e) {
      console.error(`Error downloading ${url}:`, e.message);
    }
  }
}

downloadAll();
