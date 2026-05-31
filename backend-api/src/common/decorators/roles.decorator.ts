import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  PLAYER = 'PLAYER',
  CAPTAIN = 'CAPTAIN',
  ORGANIZER = 'ORGANIZER',
  ADMIN = 'ADMIN',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
