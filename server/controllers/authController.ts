import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db.ts';
import { signToken, AuthRequest } from '../middleware/auth.ts';
import { UserRole } from '../../src/types/index.ts';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'staff', 'admin']).optional().default('student'),
  studentId: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export async function register(req: Request, res: Response) {
  try {
    const validated = registerSchema.parse(req.body);
    const existing = db.getUserByEmail(validated.email);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(validated.password, salt);

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: validated.name,
      email: validated.email.toLowerCase(),
      passwordHash,
      role: validated.role as UserRole,
      studentId: validated.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      department: validated.department || 'General Studies',
      phone: validated.phone || '9876543210',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.addUser(newUser);

    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    });

    const { passwordHash: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to CafeteriaAI!',
      data: {
        user: safeUser,
        token
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues[0]?.message || 'Validation failed',
        errors: error.issues
      });
    }
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.'
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const validated = loginSchema.parse(req.body);
    const user = db.getUserByEmail(validated.email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = bcrypt.compareSync(validated.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    const { passwordHash: _, ...safeUser } = user;

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        user: safeUser,
        token
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues[0]?.message || 'Validation failed',
        errors: error.issues
      });
    }
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const user = db.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { passwordHash: _, ...safeUser } = user;
  return res.json({
    success: true,
    data: safeUser
  });
}

export async function updateProfile(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const existing = db.getUserById(req.user.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { name, phone, department, studentId, avatar, preferences, walletRechargeAmount } = req.body;

  const updates: any = {};
  if (typeof name === 'string' && name.trim()) updates.name = name.trim();
  if (typeof phone === 'string') updates.phone = phone.trim();
  if (typeof department === 'string') updates.department = department.trim();
  if (typeof studentId === 'string') updates.studentId = studentId.trim();
  if (typeof avatar === 'string') updates.avatar = avatar;
  if (preferences && typeof preferences === 'object') {
    updates.preferences = {
      ...(existing.preferences || {}),
      ...preferences
    };
  }

  if (typeof walletRechargeAmount === 'number' && walletRechargeAmount > 0) {
    const currentBal = existing.walletBalance ?? 500;
    updates.walletBalance = currentBal + walletRechargeAmount;
  }

  const updatedUser = db.updateUser(req.user.id, updates);
  if (!updatedUser) {
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }

  const { passwordHash: _, ...safeUser } = updatedUser;
  return res.json({
    success: true,
    message: 'Profile settings updated successfully!',
    data: safeUser
  });
}

export async function changePassword(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long.'
    });
  }

  const user = db.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password does not match.'
    });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);

  db.updateUser(req.user.id, { passwordHash });

  return res.json({
    success: true,
    message: 'Password updated successfully!'
  });
}

export async function getDemoAccounts(req: Request, res: Response) {
  const users = db.getUsers().map(u => ({
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    defaultPassword: u.role === 'admin' ? 'Admin@123' : u.role === 'staff' ? 'Staff@123' : 'Student@123'
  }));

  return res.json({
    success: true,
    data: users
  });
}
