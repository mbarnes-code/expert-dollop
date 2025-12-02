/**
 * Utilities for reconstructing data from task data responses.
 */
import type {
  DataRequestResponse,
  InputDataChunkDefinition,
  INodeExecutionData,
  ITaskDataConnections,
  IExecuteData,
} from '../runner-types';

/**
 * Reconstructs data from a DataRequestResponse to the initial data structures.
 */
export class DataRequestResponseReconstruct {
  /**
   * Reconstructs `inputData` from a DataRequestResponse.
   * Handles chunked data by creating a sparse array.
   *
   * @param inputData - The input data from the response
   * @param chunk - Optional chunk definition
   * @returns Array of node execution data (may contain undefined for sparse arrays)
   */
  reconstructConnectionInputItems(
    inputData: DataRequestResponse['inputData'],
    chunk?: InputDataChunkDefinition,
  ): Array<INodeExecutionData | undefined> {
    const inputItems = inputData?.main?.[0] ?? [];
    
    if (!chunk) {
      return inputItems;
    }

    // Only a chunk of the input items was requested. We reconstruct
    // the array by filling in the missing items with `undefined`.
    let sparseInputItems: Array<INodeExecutionData | undefined> = [];

    sparseInputItems = sparseInputItems
      .concat(Array.from({ length: chunk.startIndex }))
      .concat(inputItems)
      .concat(Array.from({ length: inputItems.length - chunk.startIndex - chunk.count }));

    return sparseInputItems;
  }

  /**
   * Reconstructs `executeData` from a DataRequestResponse.
   *
   * @param response - The data request response
   * @param inputItems - The reconstructed input items
   * @returns Execute data structure
   */
  reconstructExecuteData(
    response: DataRequestResponse,
    inputItems: INodeExecutionData[],
  ): IExecuteData {
    const inputData: ITaskDataConnections = {
      ...response.inputData,
      main: [inputItems],
    };

    return {
      data: inputData,
      node: response.node,
      source: response.connectionInputSource,
    };
  }
}
