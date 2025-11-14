import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskCategory, TaskStatus } from '@secure-task/data';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'text', default: TaskStatus.Backlog })
  status!: TaskStatus;

  @Column({ type: 'text', default: TaskCategory.Work })
  category!: TaskCategory;

  @Column({ type: 'datetime', nullable: true })
  dueDate?: Date | null;

  @ManyToOne(() => Organization, (org) => org.tasks, {
    eager: true,
    onDelete: 'CASCADE',
  })
  organization!: Organization;

  @ManyToOne(() => User, (user) => user.createdTasks, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  createdBy?: User | null;

  @ManyToOne(() => User, (user) => user.assignedTasks, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  assignee?: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

