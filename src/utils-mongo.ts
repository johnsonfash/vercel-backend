import axios from 'axios';
import { NextFunction } from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { Collection, MongoClient } from 'mongodb';
import path from 'path';
import { FoodData, PAYSTACK_BASE, PAYSTACK_SECRET } from './data';

const uri = process.env.DATABASE_URL as string;
let client: MongoClient;
let users: Collection<User>;

export interface User {
  _id?: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
}

const connectToDatabase = async () => {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    users = client.db('bigbite').collection('users');
  }
  return { client, users };
}


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

export const getUser = async (search: string, type: 'email' | 'phone' = 'email'): Promise<Partial<User> | null> => {
  try {
    const { users } = await connectToDatabase();
    return await users.findOne({ [type]: search })
  } catch (error: any) {
    return null
  }
}

export const addUser = async (user: Omit<User, 'id'>): Promise<User | null> => {
  try {
    const { users } = await connectToDatabase();
    const result = await users.insertOne(user);
    return { ...user, _id: result.insertedId }
  } catch (error: any) {
    return null
  }
}

export const editUser = async (email: string, user: Partial<User>): Promise<Partial<User> | null> => {
  try {
    const { users } = await connectToDatabase();
    const result = await users.updateOne({ email }, { $set: user });
    return result.modifiedCount ? user : null
  } catch (error: any) {
    return null
  }
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
  type Food = typeof FoodData[number] & { image: string }
  const Food: Food[] = [];
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