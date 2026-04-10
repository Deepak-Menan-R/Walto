import pool from '../config/database';
import { User, UserPlan } from '../types/transaction.types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  /**
   * Create a new user (default plan: free)
   */
  async createUser(
    phone: string,
    password: string,
    email?: string,
    plan: UserPlan = 'free'
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const result = await pool.query(
      `INSERT INTO users (id, phone, email, password_hash, plan)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, phone, email, plan, created_at`,
      [userId, phone, email, hashedPassword, plan]
    );

    return result.rows[0];
  }

  /**
   * Find user by phone
   */
  async findUserByPhone(phone: string): Promise<any> {
    const result = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );
    return result.rows[0];
  }

  /**
   * Get user's plan
   */
  async getUserPlan(userId: string): Promise<UserPlan> {
    const result = await pool.query(
      'SELECT plan FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0]?.plan ?? 'free';
  }

  /**
   * Upgrade user to premium
   */
  async upgradeToPremium(userId: string): Promise<void> {
    await pool.query(
      "UPDATE users SET plan = 'premium' WHERE id = $1",
      [userId]
    );
  }

  /**
   * Verify password
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Generate JWT token
   */
  generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: '30d',
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { userId: string } {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  }
}

export default new UserService();
