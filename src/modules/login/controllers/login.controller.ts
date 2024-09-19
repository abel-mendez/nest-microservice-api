import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { NewUserDto } from '../dtos/new-user.dto';
import { IUser } from '../interfaces/user.interface';
import { AuthGuard } from '../../auth/guard/auth.guard';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class LoginController {
  constructor(
    @Inject() private readonly _loginService: UserService,
    @Inject('BUSINESS_MICROSERVICE')
    private readonly _businessMicroService: ClientProxy,
  ) {}

  @Post('/register')
  async register(@Body() user: NewUserDto) {
    return this._loginService.register(user);
  }

  @Post('/login')
  async login(@Body() user: IUser) {
    return this._loginService.login(user);
  }

  @UseGuards(AuthGuard)
  @Get('/list')
  async list(
    @Headers('authorization') token: string,
    @Query('email') email?: string,
    @Query('from') from: number = 0,
    @Query('size') size: number = 10,
  ) {
    if (from < 0) {
      throw new BadRequestException('Invalid value for from parameter');
    }
    if (size <= 0 || size > 100) {
      throw new BadRequestException(
        'Invalid value for size parameter. Must be between 1 and 100.',
      );
    }
    const pattern = { cmd: 'list_users' };
    const payload = { from, size, email, token };
    //call to business microservice
    return this._businessMicroService.send(pattern, payload);
  }
}
