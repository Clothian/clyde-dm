import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { User } from '../db';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const router = express.Router();

// Use a default JWT secret if one is not provided
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret12345';

// @route   POST api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userByEmail = db.get('users').find({ email }).value();
    if (userByEmail) {
      return res.status(400).json({ errors: [{ msg: 'User with this email already exists' }] });
    }
    
    const userByUsername = db.get('users').find({ username }).value();
    if (userByUsername) {
      return res.status(400).json({ errors: [{ msg: 'User with this username already exists' }] });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const id = uuidv4();
    const user: User = {
      id,
      username,
      email,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    // Add user to the database
    db.get('users').push(user).write();

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '5h' }, // Token expires in 5 hours
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = db.get('users').find({ email }).value();
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/me
// @desc    Get current user's information
// @access  Private (will require token)
router.get('/me', (req: Request, res: Response) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { user: { id: string } };
    const user = db.get('users').find({ id: decoded.user.id }).value();
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Return user without the password hash
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
});

export default router; 