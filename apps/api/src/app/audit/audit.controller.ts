import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RolesAllowed, RolesGuard } from '@secure-task/auth';
import { User } from '../users/entities/user.entity';
import { UserRole } from '@secure-task/data';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RolesAllowed(UserRole.Owner, UserRole.Admin)
  async list(@CurrentUser() user: User) {
    const entries = await this.auditService.listForOrganization(
      user.organization.id,
    );
    return { entries };
  }
}

