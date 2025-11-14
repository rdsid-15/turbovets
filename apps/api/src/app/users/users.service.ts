import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction, UserRole } from '@secure-task/data';
import { hashPassword, verifyPassword } from '../common/password.util';
import { toUserProfile } from '../common/mappers';
import { UserProfile } from '@secure-task/data';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly organizationsService: OrganizationsService,
    private readonly auditService: AuditService,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
  }

  async listForOrganization(orgId: string): Promise<UserProfile[]> {
    const users = await this.usersRepo.find({
      where: { organization: { id: orgId } },
      order: { displayName: 'ASC' },
    });
    return users.map(toUserProfile);
  }

  private ensureActorCanAssignRole(actor: User, requestedRole: UserRole) {
    if (actor.role === UserRole.Viewer) {
      throw new UnauthorizedException('Viewers cannot manage users');
    }
    if (actor.role === UserRole.Admin && requestedRole === UserRole.Owner) {
      throw new UnauthorizedException('Admins cannot create owners');
    }
  }

  async createUser(dto: CreateUserDto, actor?: User) {
    if (actor) {
      this.ensureActorCanAssignRole(actor, dto.role);
      if (actor.organization.id !== dto.organizationId) {
        throw new UnauthorizedException('Cross-organization user creation denied');
      }
    }
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const organization = await this.organizationsService.findById(
      dto.organizationId,
    );
    const user = this.usersRepo.create({
      email: dto.email.toLowerCase(),
      displayName: dto.displayName,
      password: await hashPassword(dto.password),
      role: dto.role,
      organization,
    });
    const saved = await this.usersRepo.save(user);
    if (actor) {
      await this.auditService.logAction(actor, AuditAction.CreateUser, {
        targetUserId: saved.id,
        role: dto.role,
      });
    }
    return toUserProfile(saved);
  }

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const match = await verifyPassword(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepo.update(userId, { lastLoginAt: new Date() });
  }

  async ensureSeedUser(): Promise<void> {
    const existing = await this.usersRepo.count();
    if (existing > 0) {
      return;
    }
    const org = await this.organizationsService.ensureRootOrganization(
      'TurboVets HQ',
    );
    await this.createUser(
      {
        email: 'owner@securetask.dev',
        displayName: 'Org Owner',
        password: 'ChangeMe123!',
        role: UserRole.Owner,
        organizationId: org.id,
      },
      undefined,
    );
  }
}

