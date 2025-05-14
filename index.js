import WebSocket from 'ws';

const socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

let startTime = null;
let lastLoggedTime = 0;

socket.on('open', () => {
  startTime = Date.now();
  console.log('✅ Connected to Binance WebSocket');

  // Ping every 25 minutes to keep alive
  setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.ping();
      console.log('📡 Ping sent to keep connection alive');
    }
  }, 25 * 60 * 1000);

  // Timer print every 10 seconds
  setInterval(() => {
    const now = Date.now();
    const duration = now - startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    console.log(`⏱️ Connected for: ${minutes}m ${seconds}s`);
  }, 10000);
});

socket.on('message', (data) => {
  const now = Date.now();
  if (now - lastLoggedTime >= 1000) {
    const trade = JSON.parse(data);
    const price = trade.p;
    console.log(`💰 BTC/USDT Price: $${price}`);
    lastLoggedTime = now;
  }
});

socket.on('close', () => {
  console.log('❌ Disconnected from Binance WebSocket');
});

socket.on('error', (err) => {
  console.error('❗ WebSocket error:', err);
});
