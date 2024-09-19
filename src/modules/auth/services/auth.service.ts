import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly _logger = new Logger(AuthService.name);
  constructor(private readonly jwtService: JwtService) {}

  generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  validateToken(token: string): any {
    try {
      return this.jwtService.verify(token);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      this._logger.error(error.message);
      return null; //
    }
  }
}
