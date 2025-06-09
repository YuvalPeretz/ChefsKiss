export type AuthProviderType = 'Google' | 'PhoneNumber' | 'Anonymous' | 'default';

export interface User {
  uuid: string;
  name: string | null;
  email?: string;
  phone?: string;
  isAnonymous: boolean;
  providerType: AuthProviderType;
  recipes: string[]; // IDs of recipes created by the user
}
