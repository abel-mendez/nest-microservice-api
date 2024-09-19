import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserRepository } from '../../repositories/user.repository';
import { AuthService } from '../../../auth/services/auth.service';
import { EncryptionService } from '../encryption.service';
import { NewUserDto } from '../../dtos/new-user.dto';
import { IUser } from '../../interfaces/user.interface';
import { UserDocument } from '../../entities/user.entity';

describe('UserService unit tests', () => {
  let userServiceMocked: UserService;
  let userRepositoryMocked: UserRepository;
  let encryptionServiceMocked: EncryptionService;
  let authServiceMocked: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            createUser: jest.fn(),
            findByEmail: jest.fn(),
            paginate: jest.fn(),
          },
        },
        {
          provide: EncryptionService,
          useValue: {
            hashPassword: jest.fn(),
            comparePassword: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            generateToken: jest.fn(),
          },
        },
      ],
    }).compile();

    userServiceMocked = module.get<UserService>(UserService);
    userRepositoryMocked = module.get<UserRepository>(UserRepository);
    encryptionServiceMocked = module.get<EncryptionService>(EncryptionService);
    authServiceMocked = module.get<AuthService>(AuthService);
  });

  describe('register interactions', () => {
    it('should hash the user password and create the user', async () => {
      const newUserDto: NewUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword123';

      jest
        .spyOn(encryptionServiceMocked, 'hashPassword')
        .mockResolvedValue(hashedPassword);

      jest.spyOn(userRepositoryMocked, 'createUser').mockResolvedValue({
        ...newUserDto,
        password: hashedPassword,
      } as UserDocument);

      await userServiceMocked.register(newUserDto);

      expect(encryptionServiceMocked.hashPassword).toHaveBeenCalledWith(
        'password123',
      );
      expect(userRepositoryMocked.createUser).toHaveBeenCalledWith({
        ...newUserDto,
        password: hashedPassword,
      });
    });
  });

  describe('login interactions', () => {
    it('should return a token if credentials are valid', async () => {
      const user: IUser = {
        email: 'test@example.com',
        password: 'password123',
      };
      const userFound = {
        id: 1,
        email: user.email,
        password: 'hashedPassword',
      };

      jest
        .spyOn(userRepositoryMocked, 'findByEmail')
        .mockResolvedValue(userFound as UserDocument);
      jest
        .spyOn(encryptionServiceMocked, 'comparePassword')
        .mockResolvedValue(true);
      jest
        .spyOn(authServiceMocked, 'generateToken')
        .mockReturnValue('validToken');

      await userServiceMocked.login(user);

      expect(userRepositoryMocked.findByEmail).toHaveBeenCalledWith(user.email);
      expect(encryptionServiceMocked.comparePassword).toHaveBeenCalledWith(
        user.password,
        userFound.password,
      );
      expect(authServiceMocked.generateToken).toHaveBeenCalledWith(
        userFound.id,
        user.email,
      );
    });
  });

  describe('paginate interactions', () => {
    it('should call the repository to paginate users', async () => {
      const from = 0;
      const size = 10;
      const email = 'test@example.com';
      const paginatedUsers = [{ id: 1, email: 'user@example.com' }];

      jest
        .spyOn(userRepositoryMocked, 'paginate')
        .mockResolvedValue(paginatedUsers as UserDocument[]);

      await userServiceMocked.paginate(from, size, email);

      expect(userRepositoryMocked.paginate).toHaveBeenCalledWith(
        from,
        size,
        email,
      );
    });
  });
});
