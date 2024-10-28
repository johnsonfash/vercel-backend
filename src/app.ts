import express from 'express';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'This is the staring page!' });
});

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Express with TypeScript on Vercel!' });
});

export default app;