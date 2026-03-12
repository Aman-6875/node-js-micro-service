export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface ProfileResponse{
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  createdAt?: Date;
}

export interface IUserService {
  register(input: RegisterInput): Promise<AuthResponse>;
  login(input: LoginInput): Promise<AuthResponse>;
  getProfile(userId: string): Promise<ProfileResponse>;
  verifyEmail(token: string): Promise<{ message: string }>;
  resendVerification(email: string): Promise<{ message: string }>;
}
