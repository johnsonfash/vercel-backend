import axios from 'axios';
import { NextFunction } from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { FoodData, PAYSTACK_BASE, PAYSTACK_SECRET } from './data';

export interface User {
  id?: number
  email: string
  password?: string
  first_name: string
  last_name: string
  phone: string
}

export interface FoodData {
  id: string;
  title: string;
  image: string;
  prevPrice: number;
  currPrice: number;
  starRating: number;
  duration: string;
}

const userJson = path.join(__dirname, 'user.json');
export const createToken = (email: string) => jwt.sign({ email }, PAYSTACK_SECRET, { expiresIn: '3d' });
export const verifyToken = (token: string) => jwt.verify(token, PAYSTACK_SECRET);

export const authMiddleware = (req: any, res: any, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: false, message: 'Access token is missing', data: null });
  }

  jwt.verify(token, PAYSTACK_SECRET, (err: any, user: any) => {
    if (err || !user?.email) {
      return res.status(403).json({ status: false, message: 'Invalid access token', data: null });
    }
    req.user = user;
    next();
  });
};

export const getUser = (email: string, type: 'email' | 'phone' = 'email'): Promise<User | null> => {
  return new Promise((resolve) => {
    fs.readFile(userJson, 'utf-8', (_, data) => {
      const users = JSON.parse(data) as User[];
      resolve(email ? users.find(u => u[type]?.toLowerCase()?.trim() == email.toLowerCase()?.trim()) ?? null : null);
    })
  })
}

export const addUser = (user: User) => {
  return new Promise((resolve) => {
    fs.readFile(userJson, 'utf-8', (_, data) => {
      const users = JSON.parse(data)
      users.push({ ...user, id: users.length + 1 });
      fs.writeFile(userJson, JSON.stringify(users, null, 2), 'utf-8', () => {
        resolve(user);
      })
    })
  })
}

export const editUser = (email: string, user: Partial<User>): Promise<Partial<User>> => {
  return new Promise((resolve) => {
    fs.readFile(userJson, 'utf-8', (_, data) => {
      const users = JSON.parse(data) as User[];
      const index = users.findIndex(u => u.email == email);
      delete user.email
      users[index] = { ...users[index], ...user };
      fs.writeFile(userJson, JSON.stringify(users, null, 2), 'utf-8', () => {
        resolve(user);
      })
    })
  })
}

export const createCharge = async (email: string, amount: string | number) => {
  try {
    const res = await axios.post(PAYSTACK_BASE + '/transaction/initialize', {
      email: email,
      amount: amount + '00',
      channels: ['card']
      // channels: ['card', 'ussd', 'bank_transfer']
    }, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": 'application/json'
      }
    });
    return res.data;
  } catch (error: any) {
    return { status: false, message: error?.message, data: null }
  }
}

export const getAllFood = () => new Promise((resolve) => {
  const Food: FoodData[] = [];
  fs.readdir(path.join(__dirname, 'images'), (err, files) => {
    if (err) {
      resolve([]);
    }
    files.forEach((file, idx) => {
      if (!file.includes('DS_Store') && FoodData[idx]) {
        Food.push({
          ...FoodData[idx],
          image: file
        })
      }
    });
    resolve(Food);
  });
})