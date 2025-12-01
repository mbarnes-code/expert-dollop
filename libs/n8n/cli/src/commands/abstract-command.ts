/**
 * Abstract base class for CLI commands
 * Provides common functionality for all n8n CLI command implementations
 */
export abstract class AbstractCommand<Flags = Record<string, unknown>> {
  /**
   * Command flags parsed from command line
   */
  readonly flags: Flags;

  /**
   * Graceful shutdown timeout in seconds
   */
  protected gracefulShutdownTimeoutInS = 30;

  /**
   * Whether this command needs community packages
   */
  protected needsCommunityPackages = false;

  /**
   * Whether this command needs task runner
   */
  protected needsTaskRunner = false;

  constructor(flags?: Flags) {
    this.flags = flags ?? ({} as Flags);
  }

  /**
   * Gets the command name
   */
  abstract getCommandName(): string;

  /**
   * Gets the command description
   */
  abstract getCommandDescription(): string;

  /**
   * Initializes the command
   * Override to add initialization logic
   */
  async init(): Promise<void> {
    // Base initialization logic
    this.setupSignalHandlers();
  }

  /**
   * Runs the command
   */
  abstract run(): Promise<void>;

  /**
   * Stops the process
   * Override to add cleanup logic
   */
  protected async stopProcess(): Promise<void> {
    // Override in derived classes
  }

  /**
   * Sets up signal handlers for graceful shutdown
   */
  protected setupSignalHandlers(): void {
    process.once('SIGTERM', this.onTerminationSignal('SIGTERM'));
    process.once('SIGINT', this.onTerminationSignal('SIGINT'));
  }

  /**
   * Creates a termination signal handler
   * @param signal - Signal name
   * @returns Signal handler function
   */
  protected onTerminationSignal(signal: string): () => Promise<void> {
    return async () => {
      this.log(`Received ${signal}. Shutting down...`);
      
      const forceShutdownTimer = setTimeout(() => {
        this.error(`Shutdown timed out after ${this.gracefulShutdownTimeoutInS} seconds`);
        process.exit(1);
      }, this.gracefulShutdownTimeoutInS * 1000);

      try {
        await this.stopProcess();
        clearTimeout(forceShutdownTimer);
        process.exit(0);
      } catch (error) {
        clearTimeout(forceShutdownTimer);
        this.error(`Error during shutdown: ${error}`);
        process.exit(1);
      }
    };
  }

  /**
   * Logs an info message
   * @param message - Message to log
   */
  protected log(message: string): void {
    console.log(`[${this.getCommandName()}] ${message}`);
  }

  /**
   * Logs an error message
   * @param message - Error message
   */
  protected error(message: string): void {
    console.error(`[${this.getCommandName()}] ERROR: ${message}`);
  }

  /**
   * Logs a warning message
   * @param message - Warning message
   */
  protected warn(message: string): void {
    console.warn(`[${this.getCommandName()}] WARN: ${message}`);
  }

  /**
   * Logs a debug message
   * @param message - Debug message
   */
  protected debug(message: string): void {
    console.debug(`[${this.getCommandName()}] DEBUG: ${message}`);
  }

  /**
   * Exits successfully
   */
  protected async exitSuccessfully(): Promise<void> {
    await this.stopProcess();
    process.exit(0);
  }

  /**
   * Exits with error
   * @param message - Error message
   * @param error - Optional error object
   */
  protected async exitWithCrash(message: string, error?: unknown): Promise<void> {
    this.error(message);
    if (error) {
      console.error(error);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    process.exit(1);
  }

  /**
   * Handles command completion
   * @param error - Optional error from command execution
   */
  async finally(error?: Error): Promise<void> {
    if (error?.message) {
      this.error(error.message);
    }
    const exitCode = error ? 1 : 0;
    process.exit(exitCode);
  }
}

/**
 * Command metadata interface
 */
export interface CommandMetadata {
  name: string;
  description: string;
  examples?: string[];
  aliases?: string[];
}

/**
 * Command flag definition
 */
export interface CommandFlag {
  name: string;
  char?: string;
  description: string;
  required?: boolean;
  default?: unknown;
  options?: string[];
}

/**
 * Command registry for managing CLI commands
 */
export class CommandRegistry {
  private commands = new Map<string, new () => AbstractCommand>();

  /**
   * Registers a command
   * @param name - Command name
   * @param commandClass - Command class constructor
   */
  register(name: string, commandClass: new () => AbstractCommand): void {
    this.commands.set(name, commandClass);
  }

  /**
   * Gets a command by name
   * @param name - Command name
   * @returns Command class or undefined
   */
  get(name: string): (new () => AbstractCommand) | undefined {
    return this.commands.get(name);
  }

  /**
   * Checks if a command exists
   * @param name - Command name
   * @returns True if command exists
   */
  has(name: string): boolean {
    return this.commands.has(name);
  }

  /**
   * Gets all registered command names
   * @returns Array of command names
   */
  getCommandNames(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * Creates an instance of a command
   * @param name - Command name
   * @returns Command instance or undefined
   */
  createInstance(name: string): AbstractCommand | undefined {
    const CommandClass = this.commands.get(name);
    if (CommandClass) {
      return new CommandClass();
    }
    return undefined;
  }
}
