import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
  ) {}

  findAll(): Promise<Organization[]> {
    return this.organizationRepo.find({
      relations: ['parent'],
      order: { createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<Organization> {
    const org = await this.organizationRepo.findOne({
      where: { id },
      relations: ['parent'],
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async ensureRootOrganization(name: string): Promise<Organization> {
    const existing = await this.organizationRepo.findOne({ where: { name } });
    if (existing) {
      return existing;
    }
    const entity = this.organizationRepo.create({ name });
    return this.organizationRepo.save(entity);
  }

  count(): Promise<number> {
    return this.organizationRepo.count();
  }
}

