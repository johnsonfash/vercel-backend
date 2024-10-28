import express from 'express';
import path from 'path';

// const __filename = path.join(process.cwd());
// const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express with TypeScript on Vercel!', __filename, __dirname });
});

export default app;