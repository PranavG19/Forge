import {
  Task,
  SubTask,
  Project,
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
        console.log('TaskService: Initializing database...');
        await databaseService.initDatabase();
        this.initialized = true;
        console.log('TaskService: Database initialized successfully');
      } catch (error) {
        console.error('TaskService: Failed to initialize database:', error);
        throw new Error('Database initialization failed');
      }
    }
  }

  private async withDB<T>(operation: () => Promise<T>): Promise<T> {
    try {
      await this.ensureInitialized();
      return await operation();
    } catch (error: any) {
      console.error('TaskService: Database operation failed:', error);
      // If the error is related to database initialization, try to initialize again
      if (
        error.message &&
        typeof error.message === 'string' &&
        error.message.includes('not initialized')
      ) {
        console.log('TaskService: Attempting to reinitialize database...');
        this.initialized = false;
        await this.ensureInitialized();
        return await operation();
      }
      throw error;
    }
  }

  async createTask(
    title: string,
    category: TaskCategory,
    priority: TaskPriority = TaskPriority.MEDIUM,
    description?: string,
    projectId?: string,
    tags: string[] = [],
    dueDate?: string,
    dueTime?: string,
    reminder?: string,
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
        projectId,
        tags,
        dueDate,
        dueTime,
        reminder,
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

  async createProject(
    title: string,
    description?: string,
    isNorthStar: boolean = false,
  ): Promise<Project> {
    return this.withDB(async () => {
      const now = new Date().toISOString();
      const project: Project = {
        id: uuidv4(),
        title,
        description,
        isNorthStar,
        createdAt: now,
        updatedAt: now,
      };

      await databaseService.addProject(project);
      return project;
    });
  }

  async getProjects(): Promise<Project[]> {
    return this.withDB(() => databaseService.getProjects());
  }

  async getProject(projectId: string): Promise<Project> {
    return this.withDB(async () => {
      const project = await databaseService.getProject(projectId);
      if (!project) {
        throw new Error(`Project with id ${projectId} not found`);
      }
      return project;
    });
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return this.withDB(() => databaseService.getTasksByProject(projectId));
  }

  async addSubtask(parentId: string, title: string): Promise<SubTask> {
    return this.withDB(async () => {
      const now = new Date().toISOString();
      const subtask: SubTask = {
        id: uuidv4(),
        parentId,
        title,
        status: TaskStatus.TODO,
        checked: false,
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

  async getTasksByDueDate(date: string): Promise<Task[]> {
    return this.withDB(() => databaseService.getTasksByDueDate(date));
  }

  async getTasksByTag(tag: string): Promise<Task[]> {
    return this.withDB(() => databaseService.getTasksByTag(tag));
  }

  // New method to categorize tasks based on due dates
  async categorizeTasks(): Promise<{
    today: Task[];
    upcoming: Task[];
    someday: Task[];
  }> {
    return this.withDB(async () => {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      const [todayTasks, upcomingTasks, somedayTasks] = await Promise.all([
        databaseService.getTasksByCategory(TaskCategory.TODAY),
        databaseService.getTasksByCategory(TaskCategory.UPCOMING),
        databaseService.getTasksByCategory(TaskCategory.SOMEDAY),
      ]);

      // Further filter by due date
      const todayWithDueDate = todayTasks.filter(
        task => !task.dueDate || task.dueDate === today,
      );
      const upcomingWithDueDate = upcomingTasks.filter(
        task =>
          task.dueDate && task.dueDate > today && task.dueDate <= nextWeekStr,
      );
      const somedayWithDueDate = somedayTasks.filter(
        task => !task.dueDate || task.dueDate > nextWeekStr,
      );

      return {
        today: todayWithDueDate,
        upcoming: upcomingWithDueDate,
        someday: somedayWithDueDate,
      };
    });
  }

  async getTask(taskId: string): Promise<Task> {
    return this.withDB(async () => {
      // Search in all categories since we don't know which category the task belongs to
      const allTasks = await Promise.all([
        databaseService.getTasksByCategory(TaskCategory.TODAY),
        databaseService.getTasksByCategory(TaskCategory.UPCOMING),
        databaseService.getTasksByCategory(TaskCategory.SOMEDAY),
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

      // Update the checked status
      const parentTask = await this.getTaskBySubtaskId(subtaskId);
      if (parentTask) {
        const subtaskIndex = parentTask.subtasks.findIndex(
          s => s.id === subtaskId,
        );
        if (subtaskIndex !== -1) {
          parentTask.subtasks[subtaskIndex].checked = true;
          await databaseService.addTask(parentTask);
        }
      }

      // Award half the normal task completion exp for subtasks
      await experienceService.addTaskCompletionExp(false);
      await feedbackService.taskComplete();
    });
  }

  async getTaskBySubtaskId(subtaskId: string): Promise<Task | null> {
    return this.withDB(async () => {
      const allTasks = await Promise.all([
        databaseService.getTasksByCategory(TaskCategory.TODAY),
        databaseService.getTasksByCategory(TaskCategory.UPCOMING),
        databaseService.getTasksByCategory(TaskCategory.SOMEDAY),
      ]);

      const flatTasks = allTasks.flat();
      return (
        flatTasks.find(task =>
          task.subtasks.some(subtask => subtask.id === subtaskId),
        ) || null
      );
    });
  }

  async uncompleteSubtask(subtaskId: string): Promise<void> {
    return this.withDB(async () => {
      await databaseService.updateSubtaskStatus(subtaskId, TaskStatus.TODO);

      // Update the checked status
      const parentTask = await this.getTaskBySubtaskId(subtaskId);
      if (parentTask) {
        const subtaskIndex = parentTask.subtasks.findIndex(
          s => s.id === subtaskId,
        );
        if (subtaskIndex !== -1) {
          parentTask.subtasks[subtaskIndex].checked = false;
          await databaseService.addTask(parentTask);
        }
      }
    });
  }

  async updateSubtasks(taskId: string, subtasks: SubTask[]): Promise<void> {
    return this.withDB(async () => {
      const task = await this.getTask(taskId);
      task.subtasks = subtasks;
      task.updatedAt = new Date().toISOString();
      await databaseService.addTask(task); // Update the task with modified subtasks
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
      subtask => subtask.checked,
    ).length;

    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  }

  // Method to parse natural language dates (for Jump Start feature)
  parseNaturalLanguageDate(input: string): {
    dueDate?: string;
    dueTime?: string;
  } {
    try {
      // This is a placeholder - in a real implementation, we would use a library like chrono-node
      // For now, we'll handle a few simple patterns
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let dueDate: string | undefined;
      let dueTime: string | undefined;

      const lowerInput = input.toLowerCase();

      if (lowerInput.includes('today')) {
        dueDate = today.toISOString().split('T')[0];
      } else if (lowerInput.includes('tomorrow')) {
        dueDate = tomorrow.toISOString().split('T')[0];
      }

      // Extract time if present (e.g., "at 5pm")
      const timeMatch = lowerInput.match(/at (\d+)(?::(\d+))?\s*(am|pm)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const period = timeMatch[3]?.toLowerCase();

        if (period === 'pm' && hours < 12) {
          hours += 12;
        } else if (period === 'am' && hours === 12) {
          hours = 0;
        }

        dueTime = `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}`;
      }

      return {dueDate, dueTime};
    } catch (error) {
      console.error('Error parsing natural language date:', error);
      return {};
    }
  }
}

export const taskService = TaskService.getInstance();
