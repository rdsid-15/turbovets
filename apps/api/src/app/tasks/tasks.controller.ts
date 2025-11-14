import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RolesAllowed, RolesGuard } from '@secure-task/auth';
import { User } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserRole } from '@secure-task/data';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async list(@CurrentUser() user: User) {
    const tasks = await this.tasksService.listForUser(user);
    return { tasks };
  }

  @Post()
  @RolesAllowed(UserRole.Owner, UserRole.Admin)
  async create(@Body() dto: CreateTaskDto, @CurrentUser() user: User) {
    const task = await this.tasksService.create(dto, user);
    return { task };
  }

  @Put(':id')
  @RolesAllowed(UserRole.Owner, UserRole.Admin)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: User,
  ) {
    const task = await this.tasksService.update(id, dto, user);
    return { task };
  }

  @Delete(':id')
  @RolesAllowed(UserRole.Owner, UserRole.Admin)
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.tasksService.remove(id, user);
    return { success: true };
  }
}

