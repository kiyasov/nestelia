// Event system exports - to be implemented
export interface EventEmitter {
  // Will be implemented in the future
  emit(event: string, data?: unknown): void;
  on(event: string, callback: (data: unknown) => void): void;
}

// Placeholder implementation
class BaseEventEmitter implements EventEmitter {
  private listeners: Record<string, ((data: unknown) => void)[]> = {};

  emit(event: string, data?: unknown): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event].forEach((callback) => callback(data));
  }

  on(event: string, callback: (data: unknown) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
}

// Event emitter singleton
let emitter: EventEmitter | null = null;

export function getEventEmitter(): EventEmitter {
  if (!emitter) {
    emitter = new BaseEventEmitter();
  }
  return emitter;
}
