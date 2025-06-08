import Constants from 'expo-constants';
import * as Device from 'expo-device';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  userId?: string;
  sessionId: string;
  deviceInfo: {
    platform: string;
    version: string;
    model?: string;
    brand?: string;
  };
  appInfo: {
    version: string;
    buildNumber?: string;
    environment: string;
  };
  stackTrace?: string;
}

class Logger {
  private sessionId: string;
  private userId?: string;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 1000;
  private minLogLevel: LogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.INFO;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeLogger();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeLogger() {
    try {
      // Log app startup
      this.info('Logger', 'Application started', {
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        deviceInfo: await this.getDeviceInfo(),
        appInfo: this.getAppInfo()
      });
    } catch (error) {
      console.error('Failed to initialize logger:', error);
    }
  }

  private async getDeviceInfo() {
    return {
      platform: Device.osName || 'unknown',
      version: Device.osVersion || 'unknown',
      model: Device.modelName,
      brand: Device.brand,
      isDevice: Device.isDevice,
      totalMemory: Device.totalMemory
    };
  }

  private getAppInfo() {
    return {
      version: Constants.expoConfig?.version || '1.0.0',
      buildNumber: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode?.toString(),
      environment: __DEV__ ? 'development' : 'production',
      platform: Constants.platform?.web ? 'web' : 'native'
    };
  }

  setUserId(userId: string) {
    this.userId = userId;
    this.info('Logger', 'User ID set', { userId });
  }

  private async createLogEntry(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    error?: Error
  ): Promise<LogEntry> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      userId: this.userId,
      sessionId: this.sessionId,
      deviceInfo: {
        platform: Device.osName || 'unknown',
        version: Device.osVersion || 'unknown',
        model: Device.modelName,
        brand: Device.brand
      },
      appInfo: this.getAppInfo()
    };

    if (error) {
      entry.stackTrace = error.stack;
      entry.data = {
        ...entry.data,
        errorName: error.name,
        errorMessage: error.message
      };
    }

    return entry;
  }

  private async log(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    error?: Error
  ) {
    if (level < this.minLogLevel) return;

    const entry = await this.createLogEntry(level, category, message, data, error);
    
    // Add to buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Console output with formatting
    const levelName = LogLevel[level];
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [${levelName}] [${category}]`;
    
    switch (level) {
      case LogLevel.DEBUG:
        console.log(`${prefix} ${message}`, data || '');
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${message}`, data || '');
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${message}`, data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(`${prefix} ${message}`, data || '', error || '');
        break;
    }

    // In production, you would send logs to your logging service here
    if (!__DEV__ && level >= LogLevel.ERROR) {
      this.sendToLoggingService(entry);
    }
  }

  private async sendToLoggingService(entry: LogEntry) {
    try {
      // Replace with your actual logging service endpoint
      // await fetch('https://your-logging-service.com/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    } catch (error) {
      console.error('Failed to send log to service:', error);
    }
  }

  debug(category: string, message: string, data?: any) {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: any) {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, data?: any, error?: Error) {
    this.log(LogLevel.ERROR, category, message, data, error);
  }

  fatal(category: string, message: string, data?: any, error?: Error) {
    this.log(LogLevel.FATAL, category, message, data, error);
  }

  // Performance logging
  startTimer(name: string): () => void {
    const startTime = Date.now();
    this.debug('Performance', `Timer started: ${name}`);
    
    return () => {
      const duration = Date.now() - startTime;
      this.info('Performance', `Timer completed: ${name}`, { duration });
    };
  }

  // User action logging
  logUserAction(action: string, screen: string, data?: any) {
    this.info('UserAction', `${action} on ${screen}`, data);
  }

  // Navigation logging
  logNavigation(from: string, to: string, params?: any) {
    this.info('Navigation', `${from} -> ${to}`, params);
  }

  // API call logging
  logApiCall(method: string, url: string, status?: number, duration?: number, error?: Error) {
    const level = error ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, 'API', `${method} ${url}`, { status, duration }, error);
  }

  // Get logs for debugging
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logBuffer.filter(entry => entry.level >= level);
    }
    return [...this.logBuffer];
  }

  // Clear logs
  clearLogs() {
    this.logBuffer = [];
    this.info('Logger', 'Logs cleared');
  }

  // Export logs as JSON string
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }
}

export const logger = new Logger();