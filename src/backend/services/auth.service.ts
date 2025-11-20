import { UserRepository } from '../repositories/user.repository';
import { comparePassword, generateToken } from '../lib/auth';
import { UnauthorizedError } from '../lib/errors';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(data: { email: string; password: string }) {
    // Find user
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check password
    const validPassword = await comparePassword(data.password, user.password);
    if (!validPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        wallet: user.wallet,
      },
    };
  }
}

