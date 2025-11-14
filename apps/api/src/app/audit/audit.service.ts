import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditAction } from '@secure-task/data';
import { User } from '../users/entities/user.entity';
import { toAuditEntry } from '../common/mappers';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async logAction(
    actor: User,
    action: AuditAction,
    context: Record<string, unknown> = {},
  ): Promise<void> {
    await this.auditRepo.save(
      this.auditRepo.create({
        actor,
        organization: actor.organization,
        action,
        context,
      }),
    );
    this.logger.log(
      `${action} by ${actor.email} (${actor.organization.name})`,
      AuditService.name,
    );
  }

  async listForOrganization(orgId: string) {
    const entries = await this.auditRepo.find({
      where: { organization: { id: orgId } },
      order: { createdAt: 'DESC' },
      take: 200,
    });
    return entries.map(toAuditEntry);
  }
}

