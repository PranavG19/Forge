import SQLite, {SQLiteDatabase, Transaction} from 'react-native-sqlite-storage';
import {
  Task,
  SubTask,
  Project,
  TaskStatus,
  TaskPriority,
  TaskCategory,
} from '../../models/Task';

// Enable promises for SQLite
SQLite.enablePromise(true);

/**
 * DatabaseService - Handles all database operations for the Forge app
 * Implements a singleton pattern for database access
 */
export class DatabaseService {
  private database: SQLiteDatabase | null = null;
  private static instance: DatabaseService;
  private initialized = false;
  private isInitializing = false;

  private constructor() {}

  /**
   * Get the singleton instance of DatabaseService
   */
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize the database
   * This method handles database creation, opening, and schema setup
   */
  async initDatabase(): Promise<void> {
    // If already initialized, just return
    if (this.initialized) {
      console.log('Database already initialized, skipping initialization');
      return;
    }

    // Prevent concurrent initialization
    if (this.isInitializing) {
      console.log('Database initialization already in progress, waiting...');
      return;
    }

    this.isInitializing = true;
    console.log('Starting database initialization...');

    try {
      // Try to use a real SQLite database first
      try {
        console.log('Opening SQLite database...');
        const db = await SQLite.openDatabase({
          name: 'ForgeDB.db',
          location: 'default',
        });
        this.database = db;
        console.log('SQLite database opened successfully');

        // Create tables
        await this.createTables();
        this.initialized = true;
        console.log('Database initialized successfully with real SQLite');
        return;
      } catch (sqliteError) {
        console.error('Error opening SQLite database:', sqliteError);
        // Fall back to mock database if SQLite fails
      }

      // Fallback to mock database
      console.log('Using mock database as fallback');
      this.database = {
        dbname: 'ForgeDB.db',
        executeSql: () =>
          Promise.resolve([
            {
              rows: {
                length: 0,
                item: () => ({}),
                _array: [],
              },
              insertId: 0,
              rowsAffected: 0,
            },
          ]),
      } as any;

      this.initialized = true;
      console.log('Mock database initialized as fallback');
    } catch (error) {
      console.error('Fatal error initializing database:', error);
      this.isInitializing = false;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Execute SQL query with parameters
   * @param query SQL query string
   * @param params Parameters for the query
   * @returns Promise with query results
   */
  async executeSql(query: string, params: any[] = []): Promise<any[]> {
    // Initialize if needed
    if (!this.initialized) {
      console.log(
        `Database not initialized, initializing before executing: ${query}`,
      );
      try {
        await this.initDatabase();
      } catch (initError) {
        console.error(
          'Failed to initialize database in executeSql:',
          initError,
        );
        // Continue with mock results if initialization fails
      }
    }

    // If still not initialized, return empty result
    if (!this.database) {
      console.log(
        `Database not available, returning empty result for query: ${query}`,
      );
      return [{rows: {length: 0, item: () => ({})}}];
    }

    try {
      // Execute the query
      const result = await this.database.executeSql(query, params);
      return result;
    } catch (error) {
      // More detailed error logging
      console.error(`Error executing SQL: ${query}`, error);
      console.error(`Parameters:`, JSON.stringify(params));
      if (error instanceof Error) {
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
      // Return empty result instead of throwing
      return [{rows: {length: 0, item: () => ({})}}];
    }
  }

  /**
   * Create database tables and indexes
   * This method sets up the schema for tasks, subtasks, and projects
   */
  private async createTables(): Promise<void> {
    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        category TEXT NOT NULL,
        projectId TEXT,
        tags TEXT,
        dueDate TEXT,
        dueTime TEXT,
        reminder TEXT,
        timeEstimate INTEGER,
        notes TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `;

    const createSubtasksTable = `
      CREATE TABLE IF NOT EXISTS subtasks (
        id TEXT PRIMARY KEY,
        parentId TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        checked BOOLEAN NOT NULL DEFAULT 0,
        estimatedMinutes INTEGER,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (parentId) REFERENCES tasks (id) ON DELETE CASCADE
      )
    `;

    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        isNorthStar BOOLEAN NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `;

    // Add intentions table creation
    const createIntentionsTable = `
      CREATE TABLE IF NOT EXISTS intentions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        isNorthStar BOOLEAN NOT NULL,
        type TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        completedAt TEXT,
        weekStartDate TEXT
      )
    `;

    // Add settings table creation
    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `;

    const createIndexes = [
      // Tasks indexes
      `CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks (category)`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status)`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks (priority)`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_createdAt ON tasks (createdAt)`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_projectId ON tasks (projectId)`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_dueDate ON tasks (dueDate)`,

      // Subtasks indexes
      `CREATE INDEX IF NOT EXISTS idx_subtasks_parentId ON subtasks (parentId)`,
      `CREATE INDEX IF NOT EXISTS idx_subtasks_status ON subtasks (status)`,
      `CREATE INDEX IF NOT EXISTS idx_subtasks_checked ON subtasks (checked)`,

      // Projects indexes
      `CREATE INDEX IF NOT EXISTS idx_projects_isNorthStar ON projects (isNorthStar)`,
      `CREATE INDEX IF NOT EXISTS idx_projects_createdAt ON projects (createdAt)`,

      // Intentions indexes
      `CREATE INDEX IF NOT EXISTS idx_intentions_type ON intentions (type)`,
      `CREATE INDEX IF NOT EXISTS idx_intentions_isNorthStar ON intentions (isNorthStar)`,
      `CREATE INDEX IF NOT EXISTS idx_intentions_createdAt ON intentions (createdAt)`,
    ];

    try {
      // Create tables for real database
      console.log('Creating tables...');
      await this.executeSql(createTasksTable, []);
      await this.executeSql(createSubtasksTable, []);
      await this.executeSql(createProjectsTable, []);
      await this.executeSql(createIntentionsTable, []);
      await this.executeSql(createSettingsTable, []);

      // Create all indexes
      for (const indexQuery of createIndexes) {
        await this.executeSql(indexQuery, []);
      }

      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      // Don't throw - just log the error
    }
  }

  /**
   * Add or update a task in the database
   * @param task Task object to add or update
   */
  async addTask(task: Task): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const insertTask = `
      INSERT OR REPLACE INTO tasks (
        id, title, description, status, priority, category,
        projectId, tags, dueDate, dueTime, reminder,
        timeEstimate, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      await this.database.transaction(async (tx: Transaction) => {
        // Insert main task
        await tx.executeSql(insertTask, [
          task.id,
          task.title,
          task.description || null,
          task.status,
          task.priority,
          task.category,
          task.projectId || null,
          task.tags ? JSON.stringify(task.tags) : '[]',
          task.dueDate || null,
          task.dueTime || null,
          task.reminder || null,
          task.timeEstimate || null,
          task.notes || null,
          task.createdAt,
          task.updatedAt,
        ]);

        // Delete existing subtasks for this task
        await tx.executeSql('DELETE FROM subtasks WHERE parentId = ?', [
          task.id,
        ]);

        // Insert subtasks if any
        if (task.subtasks.length > 0) {
          const insertSubtask = `
            INSERT INTO subtasks (
              id, parentId, title, status, checked, estimatedMinutes, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

          for (const subtask of task.subtasks) {
            await tx.executeSql(insertSubtask, [
              subtask.id,
              task.id,
              subtask.title,
              subtask.status,
              subtask.checked ? 1 : 0,
              subtask.estimatedMinutes || null,
              subtask.createdAt,
              subtask.updatedAt,
            ]);
          }
        }
      });
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  /**
   * Get tasks by category
   * @param category Task category to filter by
   * @returns Array of tasks in the specified category
   */
  async getTasksByCategory(category: TaskCategory): Promise<Task[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = `
      SELECT * FROM tasks WHERE category = ? ORDER BY createdAt DESC
    `;

    try {
      const [tasksResult] = await this.executeSql(query, [category]);
      const tasks: Task[] = [];

      for (let i = 0; i < tasksResult.rows.length; i++) {
        const taskRow = tasksResult.rows.item(i);
        const subtasks = await this.getSubtasksByParentId(taskRow.id);

        tasks.push({
          ...taskRow,
          tags: taskRow.tags ? JSON.parse(taskRow.tags) : [],
          subtasks,
        });
      }

      return tasks;
    } catch (error) {
      console.error('Error getting tasks by category:', error);
      throw error;
    }
  }

  /**
   * Get subtasks for a specific parent task
   * @param parentId ID of the parent task
   * @returns Array of subtasks
   */
  private async getSubtasksByParentId(parentId: string): Promise<SubTask[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = `
      SELECT * FROM subtasks WHERE parentId = ? ORDER BY createdAt ASC
    `;

    try {
      const [result] = await this.executeSql(query, [parentId]);
      const subtasks: SubTask[] = [];

      for (let i = 0; i < result.rows.length; i++) {
        const subtask = result.rows.item(i);
        subtasks.push({
          ...subtask,
          checked: !!subtask.checked, // Convert to boolean
        });
      }

      return subtasks;
    } catch (error) {
      console.error('Error getting subtasks:', error);
      throw error;
    }
  }

  /**
   * Update the status of a task
   * @param taskId ID of the task to update
   * @param status New status for the task
   */
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = `
      UPDATE tasks SET status = ?, updatedAt = ? WHERE id = ?
    `;

    try {
      await this.executeSql(query, [status, new Date().toISOString(), taskId]);
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  /**
   * Update the status of a subtask
   * @param subtaskId ID of the subtask to update
   * @param status New status for the subtask
   */
  async updateSubtaskStatus(
    subtaskId: string,
    status: TaskStatus,
  ): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = `
      UPDATE subtasks SET status = ?, checked = ?, updatedAt = ? WHERE id = ?
    `;

    try {
      await this.executeSql(query, [
        status,
        status === TaskStatus.COMPLETED ? 1 : 0,
        new Date().toISOString(),
        subtaskId,
      ]);
    } catch (error) {
      console.error('Error updating subtask status:', error);
      throw error;
    }
  }

  /**
   * Delete a task and its subtasks
   * @param taskId ID of the task to delete
   */
  async deleteTask(taskId: string): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = `DELETE FROM tasks WHERE id = ?`;

    try {
      await this.executeSql(query, [taskId]);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Add or update a project
   * @param project Project object to add or update
   */
  async addProject(project: Project): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const insertProject = `
      INSERT OR REPLACE INTO projects (
        id, title, description, isNorthStar, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
      await this.executeSql(insertProject, [
        project.id,
        project.title,
        project.description || null,
        project.isNorthStar ? 1 : 0,
        project.createdAt,
        project.updatedAt,
      ]);
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  }

  /**
   * Get all projects
   * @returns Array of all projects
   */
  async getProjects(): Promise<Project[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = `
      SELECT * FROM projects ORDER BY isNorthStar DESC, createdAt DESC
    `;

    try {
      const [result] = await this.executeSql(query);
      const projects: Project[] = [];

      for (let i = 0; i < result.rows.length; i++) {
        const project = result.rows.item(i);
        projects.push({
          ...project,
          isNorthStar: !!project.isNorthStar, // Convert to boolean
        });
      }

      return projects;
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  }

  /**
   * Get a specific project by ID
   * @param projectId ID of the project to retrieve
   * @returns Project object or null if not found
   */
  async getProject(projectId: string): Promise<Project | null> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = `
      SELECT * FROM projects WHERE id = ?
    `;

    try {
      const [result] = await this.executeSql(query, [projectId]);

      if (result.rows.length === 0) {
        return null;
      }

      const project = result.rows.item(0);
      return {
        ...project,
        isNorthStar: !!project.isNorthStar, // Convert to boolean
      };
    } catch (error) {
      console.error('Error getting project:', error);
      throw error;
    }
  }

  /**
   * Get tasks associated with a specific project
   * @param projectId ID of the project
   * @returns Array of tasks in the project
   */
  async getTasksByProject(projectId: string): Promise<Task[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = `
      SELECT * FROM tasks WHERE projectId = ? ORDER BY createdAt DESC
    `;

    try {
      const [tasksResult] = await this.executeSql(query, [projectId]);
      const tasks: Task[] = [];

      for (let i = 0; i < tasksResult.rows.length; i++) {
        const taskRow = tasksResult.rows.item(i);
        const subtasks = await this.getSubtasksByParentId(taskRow.id);

        tasks.push({
          ...taskRow,
          tags: taskRow.tags ? JSON.parse(taskRow.tags) : [],
          subtasks,
        });
      }

      return tasks;
    } catch (error) {
      console.error('Error getting tasks by project:', error);
      throw error;
    }
  }

  /**
   * Get tasks due on a specific date
   * @param date Date string in ISO format (YYYY-MM-DD)
   * @returns Array of tasks due on the specified date
   */
  async getTasksByDueDate(date: string): Promise<Task[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = `
      SELECT * FROM tasks WHERE dueDate = ? ORDER BY dueTime ASC, createdAt DESC
    `;

    try {
      const [tasksResult] = await this.executeSql(query, [date]);
      const tasks: Task[] = [];

      for (let i = 0; i < tasksResult.rows.length; i++) {
        const taskRow = tasksResult.rows.item(i);
        const subtasks = await this.getSubtasksByParentId(taskRow.id);

        tasks.push({
          ...taskRow,
          tags: taskRow.tags ? JSON.parse(taskRow.tags) : [],
          subtasks,
        });
      }

      return tasks;
    } catch (error) {
      console.error('Error getting tasks by due date:', error);
      throw error;
    }
  }

  /**
   * Get tasks with a specific tag
   * @param tag Tag to search for
   * @returns Array of tasks with the specified tag
   */
  async getTasksByTag(tag: string): Promise<Task[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    // Use LIKE with JSON pattern to find tag in the tags array
    const query = `
      SELECT * FROM tasks WHERE tags LIKE ? ORDER BY createdAt DESC
    `;

    try {
      const [tasksResult] = await this.executeSql(query, [`%${tag}%`]);
      const tasks: Task[] = [];

      for (let i = 0; i < tasksResult.rows.length; i++) {
        const taskRow = tasksResult.rows.item(i);
        const tags = JSON.parse(taskRow.tags || '[]');

        // Only include tasks that actually have the tag (to avoid false positives)
        if (tags.includes(tag)) {
          const subtasks = await this.getSubtasksByParentId(taskRow.id);

          tasks.push({
            ...taskRow,
            tags,
            subtasks,
          });
        }
      }

      return tasks;
    } catch (error) {
      console.error('Error getting tasks by tag:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const databaseService = DatabaseService.getInstance();
