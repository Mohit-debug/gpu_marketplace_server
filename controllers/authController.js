import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

// User Registration
export const UserRegister = async (req, res, next) => {
  try {
    const { email, password, username, role } = req.body;
    console.log("Request Body:", req.body);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashedPassword ,role});
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully', user: { email: newUser.email, username: newUser.username, role: newUser.role } });
  } catch (error) {
    next(error);
  }
};

// User Login
export const UserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("Login Body:", req.body);
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT, { expiresIn: '9999 years' });
    console.log("token", token);
    res.status(200).json({ message: 'Login successful', token, role: user.role });
  } catch (error) {
    next(error);
  }
};
