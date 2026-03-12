import { AppDataSource } from '../config/db';
import { User } from '../models/user.model';
import { IUserRepository } from '../interfaces/IUserRepository';

export class UserRepository implements IUserRepository {
  private repo = AppDataSource.getRepository(User);

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async save(user: Partial<User>): Promise<User> {
    const newUser = this.repo.create(user);
    return this.repo.save(newUser);
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.repo.findOne({ where: { verificationToken: token } });
  }
}
