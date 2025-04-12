import SQLite, {SQLiteDatabase, Transaction} from 'react-native-sqlite-storage';
import {
  Task,
  SubTask,
  TaskStatus,
  TaskPriority,
  TaskCategory,
} from '../../models/Task';

SQLite.enablePromise(true);

export class DatabaseService {
  private database: SQLiteDatabase | null = null;
  private static instance: DatabaseService;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initDatabase(): Promise<void> {
    try {
      const db = await SQLite.openDatabase({
        name: 'ForgeDB.db',
        location: 'default',
      });
      this.database = db;
      await this.createTables();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async executeSql(query: string, params: any[] = []): Promise<any[]> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      return await this.database.executeSql(query, params);
    } catch (error) {
      console.error('Error executing SQL:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        category TEXT NOT NULL,
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
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (parentId) REFERENCES tasks (id) ON DELETE CASCADE
      )
    `;

    // Create indexes for performance optimization
    const createIndexes = [
      // Tasks indexes
      `CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks (category)`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status)`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks (priority)`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_createdAt ON tasks (createdAt)`,

      // Subtasks indexes
      `CREATE INDEX IF NOT EXISTS idx_subtasks_parentId ON subtasks (parentId)`,
      `CREATE INDEX IF NOT EXISTS idx_subtasks_status ON subtasks (status)`,
    ];

    try {
      await this.executeSql(createTasksTable);
      await this.executeSql(createSubtasksTable);

      // Create all indexes
      for (const indexQuery of createIndexes) {
        await this.executeSql(indexQuery);
      }
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  async addTask(task: Task): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const insertTask = `
      INSERT INTO tasks (
        id, title, description, status, priority, category,
        timeEstimate, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          task.timeEstimate || null,
          task.notes || null,
          task.createdAt,
          task.updatedAt,
        ]);

        // Insert subtasks if any
        if (task.subtasks.length > 0) {
          const insertSubtask = `
            INSERT INTO subtasks (
              id, parentId, title, status, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?)
          `;

          for (const subtask of task.subtasks) {
            await tx.executeSql(insertSubtask, [
              subtask.id,
              task.id,
              subtask.title,
              subtask.status,
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

  async getTasksByCategory(category: TaskCategory): Promise<Task[]> {
    if (!this.database) throw new Error('Database not initialized');

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
          subtasks,
        });
      }

      return tasks;
    } catch (error) {
      console.error('Error getting tasks by category:', error);
      throw error;
    }
  }

  private async getSubtasksByParentId(parentId: string): Promise<SubTask[]> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `
      SELECT * FROM subtasks WHERE parentId = ? ORDER BY createdAt ASC
    `;

    try {
      const [result] = await this.executeSql(query, [parentId]);
      const subtasks: SubTask[] = [];

      for (let i = 0; i < result.rows.length; i++) {
        subtasks.push(result.rows.item(i));
      }

      return subtasks;
    } catch (error) {
      console.error('Error getting subtasks:', error);
      throw error;
    }
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

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

  async updateSubtaskStatus(
    subtaskId: string,
    status: TaskStatus,
  ): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `
      UPDATE subtasks SET status = ?, updatedAt = ? WHERE id = ?
    `;

    try {
      await this.executeSql(query, [
        status,
        new Date().toISOString(),
        subtaskId,
      ]);
    } catch (error) {
      console.error('Error updating subtask status:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `DELETE FROM tasks WHERE id = ?`;

    try {
      await this.executeSql(query, [taskId]);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
}

export const databaseService = DatabaseService.getInstance();
