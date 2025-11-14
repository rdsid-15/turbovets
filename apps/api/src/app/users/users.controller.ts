import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RolesAllowed, RolesGuard } from '@secure-task/auth';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserRole } from '@secure-task/data';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list(@CurrentUser() user: User) {
    const users = await this.usersService.listForOrganization(
      user.organization.id,
    );
    return { users };
  }

  @Post()
  @RolesAllowed(UserRole.Owner, UserRole.Admin)
  async create(@Body() dto: CreateUserDto, @CurrentUser() actor: User) {
    const user = await this.usersService.createUser(dto, actor);
    return { user };
  }
}

