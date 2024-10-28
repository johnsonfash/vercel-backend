import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express with TypeScript on Vercel!', __filename, __dirname });
});

export default app;