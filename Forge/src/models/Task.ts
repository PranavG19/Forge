export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  NORTH_STAR = 'NORTH_STAR',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TaskCategory {
  TODAY = 'TODAY',
  UPCOMING = 'UPCOMING',
  SOMEDAY = 'SOMEDAY',
}

export interface SubTask {
  id: string;
  parentId: string;
  title: string;
  status: TaskStatus;
  checked: boolean; // For checklist functionality
  estimatedMinutes?: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  isNorthStar: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  projectId?: string; // Link to project
  tags: string[]; // For quick find/filtering
  dueDate?: string; // For calendar integration
  dueTime?: string; // For time-based reminders
  reminder?: string; // For notifications
  timeEstimate?: number; // in minutes
  subtasks: SubTask[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
