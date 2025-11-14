import { Controller, Get, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, RolesAllowed } from '@secure-task/auth';
import { UserRole } from '@secure-task/data';
import { toOrganizationDto } from '../common/mappers';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @RolesAllowed(UserRole.Owner, UserRole.Admin)
  async list() {
    const organizations = await this.organizationsService.findAll();
    return { organizations: organizations.map(toOrganizationDto) };
  }
}

