import {
  Task,
  SubTask,
  TaskStatus,
  TaskPriority,
  TaskCategory,
} from '../../models/Task';
import {databaseService} from '../storage/DatabaseService';
import {experienceService} from '../experience/ExperienceService';
import {feedbackService} from '../feedback/FeedbackService';
import {v4 as uuidv4} from 'uuid';

class TaskService {
  private static instance: TaskService;
  private initialized = false;

  private constructor() {}

  static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      try {
        await databaseService.initDatabase();
        this.initialized = true;
      } catch (error) {
        console.error('Failed to initialize database:', error);
        throw new Error('Database initialization failed');
      }
    }
  }

  private async withDB<T>(operation: () => Promise<T>): Promise<T> {
    await this.ensureInitialized();
    try {
      return await operation();
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }

  async createTask(
    title: string,
    category: TaskCategory,
    priority: TaskPriority = TaskPriority.MEDIUM,
    description?: string,
    timeEstimate?: number,
    notes?: string,
  ): Promise<Task> {
    return this.withDB(async () => {
      const now = new Date().toISOString();
      const task: Task = {
        id: uuidv4(),
        title,
        description,
        status: TaskStatus.TODO,
        priority,
        category,
        timeEstimate,
        notes,
        subtasks: [],
        createdAt: now,
        updatedAt: now,
      };

      await databaseService.addTask(task);
      return task;
    });
  }

  async addSubtask(parentId: string, title: string): Promise<SubTask> {
    return this.withDB(async () => {
      const now = new Date().toISOString();
      const subtask: SubTask = {
        id: uuidv4(),
        parentId,
        title,
        status: TaskStatus.TODO,
        createdAt: now,
        updatedAt: now,
      };

      const task = await this.getTask(parentId);
      task.subtasks.push(subtask);
      await databaseService.addTask(task); // Update the task with new subtask
      return subtask;
    });
  }

  async getTasksByCategory(category: TaskCategory): Promise<Task[]> {
    return this.withDB(() => databaseService.getTasksByCategory(category));
  }

  async getTask(taskId: string): Promise<Task> {
    return this.withDB(async () => {
      // Search in all categories since we don't know which category the task belongs to
      const allTasks = await Promise.all([
        databaseService.getTasksByCategory(TaskCategory.TODAY),
        databaseService.getTasksByCategory(TaskCategory.NEXT),
        databaseService.getTasksByCategory(TaskCategory.LATER),
      ]);

      const task = allTasks.flat().find(t => t.id === taskId);
      if (!task) {
        throw new Error(`Task with id ${taskId} not found`);
      }
      return task;
    });
  }

  async completeTask(taskId: string): Promise<void> {
    return this.withDB(async () => {
      const task = await this.getTask(taskId);
      await databaseService.updateTaskStatus(taskId, TaskStatus.COMPLETED);
      await experienceService.addTaskCompletionExp(
        task.priority === TaskPriority.NORTH_STAR,
      );
      await feedbackService.taskComplete();
    });
  }

  async completeSubtask(subtaskId: string): Promise<void> {
    return this.withDB(async () => {
      await databaseService.updateSubtaskStatus(
        subtaskId,
        TaskStatus.COMPLETED,
      );
      // Award half the normal task completion exp for subtasks
      await experienceService.addTaskCompletionExp(false);
      await feedbackService.taskComplete();
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    return this.withDB(() => databaseService.deleteTask(taskId));
  }

  calculateTaskProgress(task: Task): number {
    if (task.subtasks.length === 0) {
      return task.status === TaskStatus.COMPLETED ? 100 : 0;
    }

    const completedSubtasks = task.subtasks.filter(
      subtask => subtask.status === TaskStatus.COMPLETED,
    ).length;

    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  }
}

export const taskService = TaskService.getInstance();
