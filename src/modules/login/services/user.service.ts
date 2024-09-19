import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { NewUserDto } from '../dtos/new-user.dto';
import { UserRepository } from '../repositories/user.repository';
import { EncryptionService } from './encryption.service';
import { IUser } from '../interfaces/user.interface';
import { AuthService } from '../../auth/services/auth.service';

@Injectable()
export class UserService {
  private readonly _logger = new Logger(UserService.name);
  constructor(
    @Inject() private readonly _userRepository: UserRepository,
    @Inject() private readonly _encryptionService: EncryptionService,
    @Inject() private readonly _authService: AuthService,
  ) {}
  async register(user: NewUserDto) {
    const hashedPassword = await this._encryptionService.hashPassword(
      user.password,
    );
    return this._userRepository.createUser({
      ...user,
      password: hashedPassword,
    });
  }

  async login(user: IUser) {
    const userFound = await this._userRepository.findByEmail(user.email);
    if (!userFound) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordCorrect = await this._encryptionService.comparePassword(
      user.password,
      userFound.password,
    );

    if (!isPasswordCorrect) {
      throw new BadRequestException('Invalid credentials');
    }
    const token = this._authService.generateToken(userFound.id, user.email);
    return { token };
  }

  async paginate(from: number, size: number, email?: string) {
    return this._userRepository.paginate(from, size, email);
  }
}
