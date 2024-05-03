import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { sendEmail } from './emailService';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
  await sendEmail(email, 'Welcome to Our App', 'Thank you for registering!');
  res.json(user);
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new Error('Invalid password');

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  return { user, token };
};

export const generateResetToken = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  const resetToken = crypto.randomBytes(20).toString('hex');
  await prisma.user.update({
    where: { email },
    data: { resetToken },
  });

  return resetToken;
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const resetToken = await generateResetToken(email);
    await sendEmail(email, 'Password Reset', `Your reset token is: ${resetToken}`);
    res.json({ message: 'Reset token sent to email' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


export const updatePassword = async (email: string, newPassword: string) => {
  // Hash the new password using bcrypt
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password in the database using Prisma
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  // Return the updated user
  return user;
};
