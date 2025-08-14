
import { type Database } from './services/database.types';

export enum Sender {
  User = 'user',
  Bot = 'bot',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: string;
}

export type User = Database['public']['Tables']['cleazy_users']['Row'];
export type NewUser = Database['public']['Tables']['cleazy_users']['Insert'];
