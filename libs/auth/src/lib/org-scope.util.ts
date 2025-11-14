import { ForbiddenException } from '@nestjs/common';

export const assertOrganizationScope = (
  actorOrgId: string,
  resourceOrgId: string,
) => {
  if (actorOrgId !== resourceOrgId) {
    throw new ForbiddenException(
      'Resource does not belong to your organization',
    );
  }
};

