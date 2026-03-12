import { Request, Response } from 'express';
import { IUserService } from '../interfaces/IUserService';
import { ApiResponse } from '../utils/response';

export class UserController {
  constructor(private userService: IUserService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.register(req.body);
      return ApiResponse.success(res, result, 201, 'User registered successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      return ApiResponse.error(res, message);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.login(req.body);
      return ApiResponse.success(res, result, 200, 'Login successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return ApiResponse.error(res, message);
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
     const result = await this.userService.getProfile(req.user!.id);
      return ApiResponse.success(res, result, 200, 'Profile fetched successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch profile';
      return ApiResponse.error(res, message);
    }
  };

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.verifyEmail(req.params.token);
      return ApiResponse.success(res, result, 200, 'Email verified successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Email verification failed';
      return ApiResponse.error(res, message);
    }
  }

  resendVerification = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.resendVerification(req.body.email);
      return ApiResponse.success(res, result, 200, 'Verification email resent successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend verification email';
      return ApiResponse.error(res, message);
    }
  };
}
