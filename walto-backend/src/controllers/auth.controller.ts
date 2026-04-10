import { Request, Response } from 'express';
import userService from '../services/user.service';

export class AuthController {
  /**
   * Register new user
   */
  async register(req: Request, res: Response) {
    try {
      const { phone, password, email } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ error: 'Phone and password required' });
      }

      const existingUser = await userService.findUserByPhone(phone);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const user = await userService.createUser(phone, password, email);
      const token = userService.generateToken(user.id);

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          plan: user.plan,
        },
        token,
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response) {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ error: 'Phone and password required' });
      }

      const user = await userService.findUserByPhone(phone);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await userService.verifyPassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = userService.generateToken(user.id);

      res.json({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          plan: user.plan,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  /**
   * Upgrade user to premium
   */
  async upgradePlan(req: Request & { userId?: string }, res: Response) {
    try {
      const userId = (req as any).userId!;
      await userService.upgradeToPremium(userId);
      res.json({ success: true, plan: 'premium' });
    } catch (error) {
      console.error('Upgrade error:', error);
      res.status(500).json({ error: 'Upgrade failed' });
    }
  }
}

export default new AuthController();
