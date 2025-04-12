import {EventEmitter} from 'events';
import {experienceService} from '../experience/ExperienceService';
import {feedbackService} from '../feedback/FeedbackService';

export enum TimerMode {
  FOCUS = 'FOCUS',
  REST = 'REST',
}

export enum TimerState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export interface TimerConfig {
  focusDuration: number; // in minutes
  restDuration: number; // in minutes
}

export interface TimerStatus {
  mode: TimerMode;
  state: TimerState;
  timeRemaining: number; // in seconds
  totalTime: number; // in seconds
  taskId?: string;
}

export class TimerService extends EventEmitter {
  private static instance: TimerService;
  private timer: NodeJS.Timeout | null = null;
  private status: TimerStatus = {
    mode: TimerMode.FOCUS,
    state: TimerState.IDLE,
    timeRemaining: 0,
    totalTime: 0,
  };

  private defaultConfig: TimerConfig = {
    focusDuration: 25, // 25 minutes
    restDuration: 5, // 5 minutes
  };

  private constructor() {
    super();
  }

  static getInstance(): TimerService {
    if (!TimerService.instance) {
      TimerService.instance = new TimerService();
    }
    return TimerService.instance;
  }

  getStatus(): TimerStatus {
    return {...this.status};
  }

  startFocus(taskId: string, duration?: number): void {
    this.cleanup();
    const focusDuration = duration || this.defaultConfig.focusDuration;

    this.status = {
      mode: TimerMode.FOCUS,
      state: TimerState.RUNNING,
      timeRemaining: focusDuration * 60,
      totalTime: focusDuration * 60,
      taskId,
    };

    this.startTimer();
    this.emit('timerStarted', this.status);
    feedbackService.timerStart();
  }

  startRest(duration?: number): void {
    this.cleanup();
    const restDuration = duration || this.defaultConfig.restDuration;

    this.status = {
      mode: TimerMode.REST,
      state: TimerState.RUNNING,
      timeRemaining: restDuration * 60,
      totalTime: restDuration * 60,
    };

    this.startTimer();
    this.emit('timerStarted', this.status);
    feedbackService.timerStart();
  }

  pause(): void {
    if (this.status.state !== TimerState.RUNNING) return;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.status.state = TimerState.PAUSED;
    feedbackService.vibrate([0, 100]);
    this.emit('timerPaused', this.status);
  }

  resume(): void {
    if (this.status.state !== TimerState.PAUSED) return;

    this.status.state = TimerState.RUNNING;
    this.startTimer();
    this.emit('timerResumed', this.status);
    feedbackService.vibrate([0, 100]);
  }

  stop(): void {
    this.cleanup();
    this.status.state = TimerState.IDLE;
    this.emit('timerStopped', this.status);
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      if (this.status.timeRemaining > 0) {
        this.status.timeRemaining--;
        this.emit('timerTick', this.status);
      } else {
        this.handleTimerComplete();
      }
    }, 1000);
  }

  private async handleTimerComplete(): Promise<void> {
    this.cleanup();
    this.status.state = TimerState.COMPLETED;

    // Award experience points for focus time
    if (this.status.mode === TimerMode.FOCUS) {
      const minutes = Math.floor(this.status.totalTime / 60);
      await experienceService.addFocusTimeExp(minutes);
      await feedbackService.timerEnd();
    } else {
      // Different sound for rest timer completion
      await feedbackService.timerEnd();
    }

    this.emit('timerCompleted', this.status);
  }

  private cleanup(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // Utility methods for time formatting
  static formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }

  static formatTimeVerbose(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
  }
}

export const timerService = TimerService.getInstance();
