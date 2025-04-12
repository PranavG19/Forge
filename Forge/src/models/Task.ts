export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  NORTH_STAR = "NORTH_STAR",
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum TaskCategory {
  TODAY = "TODAY",
  NEXT = "NEXT",
  LATER = "LATER",
}

export interface SubTask {
  id: string;
  parentId: string;
  title: string;
  status: TaskStatus;
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
  timeEstimate?: number; // in minutes
  subtasks: SubTask[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
