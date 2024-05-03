import { NextFunction, Request, Response } from 'express';
import { generateResetToken, loginUser } from '../services/authService';
import { check, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import { User } from '@prisma/client';
import { hashPassword } from '../utils/hashPassword';
import { prisma } from '../../prisma/client';
import bcrypt from 'bcrypt';



export const validateRegister = [
  check('email').isEmail().withMessage('Must be a valid email'),
  check('password').isLength({ min: 6 }).withMessage('Must be at least 6 chars long'),
  check('name').exists().withMessage('Name is required'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateLogin = [
  check('email').exists().withMessage('Email is required'),
  check('password').exists().withMessage('Password is required'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];
export const register = async (req: Request, res: Response) => {
  try {
    // Hash the password
    const hashedPassword = await hashPassword(req.body.password);

    // Create the user
    const user: User = await prisma.user.create({
      data: {
        email: req.body.email,
        password: hashedPassword,
        name: req.body.name,
        resetPassword: null,
      },
    });

    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Welcome to Lotus App',
      text: `Hi ${user.name}, welcome to Lotus app! We're glad you're here. Enjoy your stay!`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(201).json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await loginUser(req.body.email, req.body.password);
    res.status(200).json({ user, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const resetToken = await generateResetToken(email);

    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `Your reset token is: ${resetToken}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.json({ message: 'Password reset successful', resetToken });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
  // Send an email to the user with the reset token
  // ...
  export const updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { email, newPassword, resetToken } = req.body;
  
      // Find the user with the provided email and reset token
      const user = await prisma.user.findUnique({
        where: { email, resetToken },
      });
  
      // If the user was not found, send an error response
      if (!user) {
        return res.status(400).json({ error: 'Invalid reset token' });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password in the database
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
  
      res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };