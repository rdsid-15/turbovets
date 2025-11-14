import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { UserRole } from '@secure-task/data';
import { Task } from '../../tasks/entities/task.entity';
import { AuditLog } from '../../audit/entities/audit-log.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  displayName!: string;

  @Column({ type: 'text' })
  role!: UserRole;

  @ManyToOne(() => Organization, (org) => org.users, {
    eager: true,
    onDelete: 'CASCADE',
  })
  organization!: Organization;

  @OneToMany(() => Task, (task) => task.createdBy)
  createdTasks?: Task[];

  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks?: Task[];

  @OneToMany(() => AuditLog, (audit) => audit.actor)
  auditEntries?: AuditLog[];

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

