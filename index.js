import express from 'express';
import WebSocket from 'ws';

const app = express();
const PORT = process.env.PORT || 3000;

let latestPrice = null;
let startTime = null;
let lastLoggedTime = 0;

// --- WebSocket Setup ---
const socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

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
    latestPrice = trade.p;
    console.log(`💰 BTC/USDT Price: $${latestPrice}`);
    lastLoggedTime = now;
  }
});

socket.on('close', () => {
  console.log('❌ Disconnected from Binance WebSocket');
});

socket.on('error', (err) => {
  console.error('❗ WebSocket error:', err);
});

// --- API Routes ---
app.get('/', (req, res) => {
  res.send('🟢 Binance WebSocket API is live.');
});

app.get('/price', (req, res) => {
  if (latestPrice) {
    res.json({ price: latestPrice });
  } else {
    res.status(503).json({ error: 'Price data not ready yet.' });
  }
});

// --- Start Express Server ---
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});
