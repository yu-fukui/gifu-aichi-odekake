// 巡回だけを試す（API は使わない）。2026-10-15 開発・ぎふあいち
import { readFileSync } from 'node:fs';
import { 巡回 } from './巡回.mjs';
const r = await 巡回(JSON.parse(readFileSync('neta/巡回先.json', 'utf8')));
console.log(`取れた ${r.取れた.length} ／ 取れなかった ${r.取れなかった.length} ／ 候補 ${r.候補.length}`);
console.log(r.取れた.join('\n'));
console.log('--- 取れなかった ---\n' + r.取れなかった.join('\n'));
