import { User } from '../models/user.model';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: Partial<User>): Promise<User>;
  findByVerificationToken(token: string): Promise<User | null>;
}
