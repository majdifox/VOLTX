export const ROLES = {
  USER: 'USER',
  EXPLORER: 'EXPLORER',
  CHALLENGER: 'CHALLENGER',
  MARSHAL: 'MARSHAL',
  CAPTAIN: 'CAPTAIN',
  ADMIN: 'ADMIN',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
