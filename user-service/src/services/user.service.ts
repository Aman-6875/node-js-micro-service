import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUserService, RegisterInput, LoginInput, AuthResponse, ProfileResponse } from '../interfaces/IUserService';
import { IUserRepository } from '../interfaces/IUserRepository';
import { publishEvent } from '../events/publisher';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const SALT_ROUNDS = 10;

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours


    const user = await this.userRepository.save({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt,
    });

    await publishEvent('user_registered', {
      id: user.id,
      name: user.name,
      email: user.email,
      verificationToken: user.verificationToken,
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async getProfile(userId: string): Promise<ProfileResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };  
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByVerificationToken(token);
    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
      throw new Error('Verification token has expired');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await this.userRepository.save(user);

    return { message: 'Email verified successfully' };
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isVerified) {
      throw new Error('Email is already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = verificationTokenExpiresAt;
    await this.userRepository.save(user);

    await publishEvent('verification_email_resent', {
      id: user.id,
      name: user.name,
      email: user.email,
      verificationToken: user.verificationToken,
    });
    return { message: 'Verification email resent successfully' };
  }
}
