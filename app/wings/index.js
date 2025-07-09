// apps/wings/index.js
const express = require('express');
const app = express();
const port = 8080; // Wings가 사용할 포트

app.get('/ping', (req, res) => {
  console.log("Panel로부터 'ping' 요청 수신!");
  res.json({ message: 'pong from wings' });
});

app.listen(port, () => {
  console.log(`Wings 데몬이 ${port}번 포트에서 대기 중...`);
});