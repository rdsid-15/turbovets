import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { Organization } from './organizations/entities/organization.entity';
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { AuditLog } from './audit/entities/audit-log.entity';
import { SeedService } from './bootstrap/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'sqlite',
        database: config.get<string>('DB_PATH') ?? 'secure-task.sqlite',
        entities: [Organization, User, Task, AuditLog],
        synchronize: true,
      }),
    }),
    OrganizationsModule,
    UsersModule,
    TasksModule,
    AuthModule,
    AuditModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
