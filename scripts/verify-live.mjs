const siteUrl = (process.env.LIVE_VERIFY_URL || '').replace(/\/+$/, '');
const expectedSha = (process.env.EXPECTED_COMMIT_SHA || '').slice(0, 7);

async function main() {
  if (!siteUrl) {
    console.log('LIVE_VERIFY_URL not set; skipping live smoke check.');
    return;
  }

  const infoUrl = `${siteUrl}/build-info.json`;
  const res = await fetch(infoUrl, { headers: { 'Cache-Control': 'no-cache' } });
  if (!res.ok) {
    throw new Error(`Live smoke check failed: ${infoUrl} returned HTTP ${res.status}`);
  }
  const data = await res.json();
  if (expectedSha && data.commitSha !== expectedSha) {
    throw new Error(`Live commitSha mismatch: expected ${expectedSha}, got ${data.commitSha}`);
  }
  console.log(`Live smoke check passed: ${infoUrl} -> commitSha=${data.commitSha}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
