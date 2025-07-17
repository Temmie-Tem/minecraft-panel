// test-sync.js
const { syncWithPanel } = require('./src/utils/syncUtils');
const config = require('./src/config/config');

async function test() {
  console.log('Testing synchronization...');
  const result = await syncWithPanel(config);
  console.log('Sync complete:', result.summary);
  process.exit(0);
}

test();
