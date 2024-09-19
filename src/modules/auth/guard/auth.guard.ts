import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly _logger = new Logger(AuthGuard.name);

  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() === 'http') {
      return this.validateHttpRequest(context);
    } else if (context.getType() === 'rpc') {
      console.log('rpc');
      return this.validateRpcMessage(context);
    }
    return false;
  }

  // Validación para peticiones HTTP
  private async validateHttpRequest(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      this._logger.error('Token is missing');
      throw new UnauthorizedException('Token is missing');
    }

    const payload = await this.authService.validateToken(token);

    if (!payload) {
      this._logger.error('Invalid token');
      throw new UnauthorizedException('Invalid token');
    }

    request.user = payload;
    return true;
  }

  // Validación para microservicios (TCP/RPC)
  private async validateRpcMessage(
    context: ExecutionContext,
  ): Promise<boolean> {
    const data = context.switchToRpc().getData();
    const token = data.token?.split(' ')[1];
    if (!token) {
      this._logger.error('Token is missing in RPC message');
      throw new UnauthorizedException('Token is missing');
    }

    const payload = await this.authService.validateToken(token);

    if (!payload) {
      this._logger.error('Invalid token in RPC message');
      throw new UnauthorizedException('Invalid token');
    }

    data.user = payload;
    return true;
  }
}
