import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Path to the rumors file
const rumorsPath = path.resolve(process.cwd(), 'src/data/transfers/rumors.ts');

// Helper to serialize rumors array as TypeScript
function serializeRumors(rumors: any[]): string {
  return `import { Transfer } from '@/types/transfer';\n\nexport const latestRumors: Transfer[] = ${JSON.stringify(rumors, null, 2)};\n`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { newRumors } = req.body;
    if (!Array.isArray(newRumors)) {
      return res.status(400).json({ error: 'Invalid rumors array' });
    }
    // Write new rumors to rumors.ts
    const fileContent = serializeRumors(newRumors);
    fs.writeFileSync(rumorsPath, fileContent, 'utf8');
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e?.toString?.() || 'Unknown error' });
  }
}
