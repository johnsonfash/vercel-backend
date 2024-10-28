import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { addUser, authMiddleware, createCharge, createToken, editUser, getAllFood, getUser } from './utils';

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/food', async (_, res) => {
  res.json({ status: true, message: 'ok', data: await getAllFood() })
});

app.get('/profile', authMiddleware, async (req: any, res) => {
  const user = await getUser(req.user?.email);
  delete user?.password;
  res.json({ status: true, message: 'ok', data: user })
});

app.post('/profile', authMiddleware, async (req: any, res) => {
  const user = await editUser(req.user?.email, req.body);
  delete user?.password;
  res.json({ status: true, message: 'ok', data: user })
});


app.post('/signup', async (req, res) => {
  const { email, first_name, last_name, password, phone } = req.body;
  if (!email || !first_name || !last_name || !password) {
    res.status(403).json({ status: false, message: 'One or more fields is missing', data: null })
  } else {
    const user = await getUser(email);
    if (user) {
      res.status(405).json({ status: false, message: 'Email adddress is already taken', data: null })
    } else {
      await addUser({ email, first_name, last_name, password, phone })
      res.status(201).json({ status: true, message: 'ok', data: { email, first_name, last_name, phone } })
    }
  }
});

app.post('/login', async (req, res) => {
  const { email, phone, password } = req.body;
  if ((!email && !phone) || !password) {
    res.status(403).json({ status: false, message: 'Email or phone and password field is required', data: null })
  } else {
    const user = await getUser(email, email ? 'email' : 'phone');
    if (user) {
      if ((user.password != password) && (email && password != 'google')) {
        res.status(405).json({ status: false, message: 'Password is not correct', data: null })
      } else {
        delete user.password;
        res.status(200).json({ status: true, message: 'Ok', data: { user, access_token: createToken(email) } })
      }
    } else {
      res.status(400).json({ status: false, message: 'User not found', data: null })
    }
  }
})

app.post('/charge', authMiddleware, async (req: any, res) => {
  if (!req.body.amount || !req.user.email) {
    res.status(405).json({ status: false, message: !req.user.email ? 'Authentication error' : 'Amount required', data: false })
  } else {
    res.json(await createCharge(req.user.email, req.body.amount));
  }
});

app.get('/', (_, res) => {
  res.json({ message: 'Hello from Express with TypeScript on Vercel!', __filename, __dirname });
});

export default app;