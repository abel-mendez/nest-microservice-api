import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepository } from '../user.repository';
import { User } from '../../entities/user.entity';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let userModel: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getModelToken(User.name),
          useValue: {
            // Deja los métodos como funciones mockeables
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should call findOne with correct email', async () => {
      const email = 'test@example.com';
      const userFound = { email, password: 'hashedPassword', _id: '1' };

      const findOneSpy = jest
        .spyOn(userModel, 'findOne')
        .mockResolvedValue(userFound);

      const result = await userRepository.findByEmail(email);

      // Verifica que se llamó findOne con el email correcto
      expect(findOneSpy).toHaveBeenCalledWith({ email });
      expect(result).toEqual(userFound);
    });
  });
});
