export interface AppAction {
  _id?: string;
  description: string;
  type: 'note' | 'task' | 'reminder';
  metadata?: any;
  completedAt?: string;
}
