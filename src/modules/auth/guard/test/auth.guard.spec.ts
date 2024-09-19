import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import {
  UnauthorizedException,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { AuthService } from '../../services/auth.service';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: {
            validateToken: jest.fn(),
          },
        },
        Reflector,
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate (HTTP requests)', () => {
    it('should return true if the token is valid', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer validToken',
        },
        user: {},
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getType: () => 'http',
      } as ExecutionContext;

      const validPayload = { userId: '123', email: 'test@example.com' };
      jest.spyOn(authService, 'validateToken').mockResolvedValue(validPayload);

      const result = await authGuard.canActivate(mockContext);

      expect(authService.validateToken).toHaveBeenCalledWith('validToken');
      expect(mockRequest.user).toBe(validPayload);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if token is missing', async () => {
      const mockRequest = {
        headers: {},
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getType: () => 'http',
      } as ExecutionContext;

      const loggerSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException('Token is missing'),
      );

      expect(loggerSpy).toHaveBeenCalledWith('Token is missing');
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalidToken',
        },
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getType: () => 'http',
      } as ExecutionContext;

      jest.spyOn(authService, 'validateToken').mockResolvedValue(null);
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException('Invalid token'),
      );

      expect(authService.validateToken).toHaveBeenCalledWith('invalidToken');
      expect(loggerSpy).toHaveBeenCalledWith('Invalid token');
    });
  });

  describe('canActivate (RPC requests)', () => {
    it('should return true if token is valid in RPC request', async () => {
      const mockData = {
        token: 'Bearer validRpcToken',
        user: {},
      };
      const mockContext = {
        switchToRpc: () => ({
          getData: () => mockData,
        }),
        getType: () => 'rpc',
      } as ExecutionContext;

      const validPayload = { userId: '456', email: 'rpc@example.com' };
      jest.spyOn(authService, 'validateToken').mockResolvedValue(validPayload);

      const result = await authGuard.canActivate(mockContext);

      expect(authService.validateToken).toHaveBeenCalledWith('validRpcToken');
      expect(mockData.user).toBe(validPayload);
      expect(result).toBe(true);
    });
  });
});
