import express from 'express';
import serverless from 'serverless-http';

const app = express();
app.use(express.json());
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Express with TypeScript on Vercel!' });
});
module.exports = app;
module.exports.handler = serverless(app); 