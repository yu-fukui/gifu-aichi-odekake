// GitHub の機械から読めない巡回先を、送り方を変えて試す（API は使わない）。2026-10-15 開発・ぎふあいち
import { execFileSync } from 'node:child_process';
const 先 = [
  'https://www.pref.aichi.jp/rss/10/list1.xml',
  'https://www.city.kasugai.lg.jp/rss.rss',
  'https://www.city.okazaki.lg.jp/news.rss',
  'https://www.city.toyohashi.lg.jp/services/rdf/rss10/11280.xml',
  'https://www.city.gamagori.lg.jp/rss/10/list6.xml',
  'https://inuyama.gr.jp/event/',
  'https://www.hida-kankou.jp/event',
  'https://www.littleworld.jp/news/',
  'https://www.taharakankou.gr.jp/event/index.php',
  'https://www.toyokawa-map.net/',
  'https://www.higashiaichi.co.jp/',
  'https://nishiokanko.com/feed/',
];
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const ACC = 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/html;q=0.8, */*;q=0.5';
function curl(url, extra = []) {
  try {
    const out = execFileSync('curl', ['-s', '-o', '/dev/null', '-L', '--max-redirs', '8', '--max-time', '40',
      '-w', '%{http_code} 転送%{num_redirects}回 %{time_total}s 最後=%{url_effective}', '-A', UA, ...extra, url], { encoding: 'utf8' });
    return out;
  } catch (e) { return 'エラー ' + String(e.stdout || e.message).slice(0, 120); }
}
function chain(url) {
  try {
    return execFileSync('curl', ['-s', '-I', '--max-time', '20', '-A', UA, url], { encoding: 'utf8' })
      .split('\n').filter((l) => /^(HTTP|location|set-cookie)/i.test(l)).slice(0, 6).map((l) => l.trim().slice(0, 140)).join(' | ');
  } catch (e) { return 'エラー'; }
}
for (const u of 先) {
  console.log(`\n== ${u}`);
  console.log('  1回目の返事: ' + chain(u));
  console.log('  curl（Cookie なし）  : ' + curl(u, ['-H', `Accept: ${ACC}`]));
  console.log('  curl（Cookie あり）  : ' + curl(u, ['-c', '/tmp/c.txt', '-b', '/tmp/c.txt', '-H', `Accept: ${ACC}`]));
  console.log('  curl（日本語・HTML） : ' + curl(u, ['-c', '/tmp/c2.txt', '-b', '/tmp/c2.txt', '-H', 'Accept: text/html,*/*', '-H', 'Accept-Language: ja,en;q=0.8']));
  try {
    const t0 = Date.now();
    const r = await fetch(u, { headers: { 'user-agent': UA, accept: ACC, 'accept-language': 'ja,en;q=0.8' }, signal: AbortSignal.timeout(40000) });
    console.log(`  node fetch（巡回と同じ）: ${r.status} ${Date.now() - t0}ms 最後=${r.url}`);
  } catch (e) { console.log(`  node fetch（巡回と同じ）: 失敗 ${e.cause?.code ?? ''} ${e.message}`); }
}
