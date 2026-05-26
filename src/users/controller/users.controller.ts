import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';;
import { UserService } from '../service/users.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('usuario')
export class UserController {

  constructor(
    private readonly userService: UserService,
  ) {}

  @Post('create')
  login(
    @Body() dto: CreateUserDto,
  ) {
    return this.userService.createUsuario(dto);
  }
}