import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditAction } from '@secure-task/data';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.auditEntries, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  actor?: User | null;

  @ManyToOne(() => Organization, {
    eager: true,
    onDelete: 'CASCADE',
  })
  organization!: Organization;

  @Column({ type: 'text' })
  action!: AuditAction;

  @Column({ type: 'simple-json', nullable: true })
  context?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;
}

