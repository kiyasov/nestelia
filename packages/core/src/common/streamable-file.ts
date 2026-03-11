/**
 * Streamable file class for handling file streams
 *
 */
export class StreamableFile {
  private readonly stream: any;

  constructor(stream: any) {
    this.stream = stream;
  }

  /**
   * Get the underlying stream
   */
  getStream(): any {
    return this.stream;
  }
}
