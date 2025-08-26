import * as fs from 'fs';
import * as path from 'path';
import { Request, Response } from 'express';

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

// Colors for console output
const COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[37m', // White
  RESET: '\x1b[0m'   // Reset
} as const;

interface LoggerOptions {
  level?: string;
  logToFile?: boolean;
  logDir?: string;
  maxFileSize?: number;
}

interface LogMeta {
  [key: string]: any;
}

class Logger {
  private level: number;
  private logToFile: boolean;
  private logDir: string;
  private maxFileSize: number;

  constructor(options: LoggerOptions = {}) {
    this.level = LOG_LEVELS[options.level as LogLevel] || LOG_LEVELS.INFO;
    this.logToFile = options.logToFile || false;
    this.logDir = options.logDir || path.join(__dirname, '../logs');
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    
    if (this.logToFile) {
      this.ensureLogDirectory();
    }
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatMessage(level: string, message: string, meta: LogMeta = {}): string {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  private writeToFile(level: string, formattedMessage: string): void {
    if (!this.logToFile) return;

    const logFile = path.join(this.logDir, `${level.toLowerCase()}.log`);
    const allLogFile = path.join(this.logDir, 'all.log');

    try {
      // Check file size and rotate if necessary
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        if (stats.size > this.maxFileSize) {
          const backupFile = `${logFile}.${Date.now()}`;
          fs.renameSync(logFile, backupFile);
        }
      }

      // Write to specific level file
      fs.appendFileSync(logFile, formattedMessage + '\n');
      
      // Write to all.log
      fs.appendFileSync(allLogFile, formattedMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  log(level: LogLevel, message: string, meta: LogMeta = {}): void {
    const levelValue = LOG_LEVELS[level];
    
    if (levelValue <= this.level) {
      const formattedMessage = this.formatMessage(level, message, meta);
      
      // Console output with colors
      const color = COLORS[level] || COLORS.RESET;
      console.log(`${color}${formattedMessage}${COLORS.RESET}`);
      
      // File output
      this.writeToFile(level, formattedMessage);
    }
  }

  error(message: string, meta: LogMeta = {}): void {
    this.log('ERROR', message, meta);
  }

  warn(message: string, meta: LogMeta = {}): void {
    this.log('WARN', message, meta);
  }

  info(message: string, meta: LogMeta = {}): void {
    this.log('INFO', message, meta);
  }

  debug(message: string, meta: LogMeta = {}): void {
    this.log('DEBUG', message, meta);
  }

  // HTTP request logging
  logRequest(req: Request, res: Response, responseTime: number): void {
    const { method, url, ip, headers } = req;
    const { statusCode } = res;
    
    const logData = {
      method,
      url,
      ip: ip || headers['x-forwarded-for'] || 'unknown',
      userAgent: headers['user-agent'],
      statusCode,
      responseTime: `${responseTime}ms`
    };

    const level: LogLevel = statusCode >= 400 ? 'ERROR' : 'INFO';
    this.log(level, `${method} ${url} ${statusCode}`, logData);
  }

  // API error logging
  logApiError(error: Error, req: Partial<Request> = {}): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers
    };

    this.error('API Error', errorData);
  }
}

// Create default logger instance
const logger = new Logger({
  level: process.env.LOG_LEVEL || 'INFO',
  logToFile: process.env.LOG_TO_FILE === 'true',
  logDir: process.env.LOG_DIR
});

export {
  Logger,
  logger,
  LOG_LEVELS,
  LogLevel,
  LoggerOptions,
  LogMeta
};