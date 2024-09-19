import { Controller, Inject, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from '../../login/services/user.service';
import { AuthGuard } from '../../auth/guard/auth.guard';

@Controller()
export class BusinessController {
  constructor(@Inject() private readonly _userService: UserService) {}

  @UseGuards(AuthGuard)
  @MessagePattern({ cmd: 'list_users' })
  listUsers(@Payload() data: { from: number; size: number; email?: string }) {
    const { from = 0, size = 10, email } = data;
    return this._userService.paginate(from, size, email);
  }
}
