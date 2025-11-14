import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { toUserProfile } from '../common/mappers';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@secure-task/data';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.validateCredentials(
      dto.email,
      dto.password,
    );
    await this.usersService.updateLastLogin(user.id);
    await this.auditService.logAction(user, AuditAction.Login, {});
    const payload = {
      sub: user.id,
      role: user.role,
      orgId: user.organization.id,
    };
    const token = await this.jwtService.signAsync(payload);
    return {
      token,
      user: toUserProfile(user),
    };
  }
}

