export type UserRole = 'public' | 'member' | 'executive' | 'oc';

export type User = {
  id: string;
  role: UserRole;
  email: string;
};
