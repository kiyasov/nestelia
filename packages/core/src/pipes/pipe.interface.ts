/**
 * Metadata for pipes
 */
export interface PipeMetadata {
  type: string;
  data?: any;
}

/**
 * Interface for pipes
 */
export interface PipeTransform {
  /**
   * Method to transform input data
   * @param value The value to transform
   * @param metadata Additional metadata
   */
  transform(value: any, metadata?: PipeMetadata): Promise<any> | any;
}
