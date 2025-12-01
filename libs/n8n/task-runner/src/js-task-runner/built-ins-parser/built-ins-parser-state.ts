/**
 * State for tracking which built-in variables are accessed in code.
 */
import type { BrokerMessage } from '../../message-types';
import type { InputDataChunkDefinition } from '../../runner-types';

/**
 * Class to keep track of which built-in variables are accessed in the code.
 * Used to optimize data requests by only fetching what's needed.
 */
export class BuiltInsParserState {
  /** Names of nodes that are accessed via $() */
  neededNodeNames: Set<string> = new Set();

  /** Whether all nodes are needed (e.g., for paired item functionality) */
  needsAllNodes = false;

  /** Whether $env is accessed */
  needs$env = false;

  /** Whether $input is accessed */
  needs$input = false;

  /** Whether $execution is accessed */
  needs$execution = false;

  /** Whether $prevNode is accessed */
  needs$prevNode = false;

  constructor(opts: Partial<BuiltInsParserState> = {}) {
    Object.assign(this, opts);
  }

  /**
   * Marks that all nodes are needed, including input data.
   */
  markNeedsAllNodes() {
    this.needsAllNodes = true;
    this.needs$input = true;
    this.neededNodeNames = new Set();
  }

  /**
   * Marks a specific node as needed.
   */
  markNodeAsNeeded(nodeName: string) {
    if (this.needsAllNodes) {
      return;
    }

    this.neededNodeNames.add(nodeName);
  }

  /**
   * Marks that $env is needed.
   */
  markEnvAsNeeded() {
    this.needs$env = true;
  }

  /**
   * Marks that $input is needed.
   */
  markInputAsNeeded() {
    this.needs$input = true;
  }

  /**
   * Marks that $execution is needed.
   */
  markExecutionAsNeeded() {
    this.needs$execution = true;
  }

  /**
   * Marks that $prevNode is needed.
   */
  markPrevNodeAsNeeded() {
    this.needs$prevNode = true;
  }

  /**
   * Converts the state to data request parameters.
   */
  toDataRequestParams(
    chunk?: InputDataChunkDefinition,
  ): BrokerMessage.ToRequester.TaskDataRequest['requestParams'] {
    return {
      dataOfNodes: this.needsAllNodes ? 'all' : Array.from(this.neededNodeNames),
      env: this.needs$env,
      input: {
        include: this.needs$input,
        chunk,
      },
      prevNode: this.needs$prevNode,
    };
  }

  /**
   * Creates a new state that needs all data.
   */
  static newNeedsAllDataState(): BuiltInsParserState {
    const obj = new BuiltInsParserState();
    obj.markNeedsAllNodes();
    obj.markEnvAsNeeded();
    obj.markInputAsNeeded();
    obj.markExecutionAsNeeded();
    obj.markPrevNodeAsNeeded();
    return obj;
  }
}
