import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should call jwtService.sign with correct payload', () => {
      const userId = '123';
      const email = 'test@example.com';
      const token = 'signedToken';

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = authService.generateToken(userId, email);

      expect(jwtService.sign).toHaveBeenCalledWith({ sub: userId, email });
      expect(result).toBe(token);
    });
  });

  describe('validateToken', () => {
    it('should return the decoded token if valid', () => {
      const token = 'validToken';
      const decodedToken = { sub: '123', email: 'test@example.com' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(decodedToken);

      const result = authService.validateToken(token);

      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(result).toBe(decodedToken);
    });

    it('should return null if token is invalid', () => {
      const token = 'invalidToken';
      const errorMessage = 'Invalid token';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error(errorMessage);
      });

      const loggerSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      const result = authService.validateToken(token);

      expect(jwtService.verify).toHaveBeenCalledWith(token);

      expect(loggerSpy).toHaveBeenCalledWith(errorMessage);
      expect(result).toBeNull();
    });
  });
});
