import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { TaskCategory, TaskStatus } from '@secure-task/data';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  title?: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
  dueDate?: string;
  assigneeId?: string;
}

