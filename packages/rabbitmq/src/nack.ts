/**
 * Nack (Negative Acknowledgment) class for RabbitMQ message handling
 * Used in @RabbitSubscribe and @RabbitRPC handlers to reject messages
 *
 * @example
 * ```typescript
 * @RabbitSubscribe({
 *   exchange: 'orders',
 *   routingKey: 'order.created',
 *   queue: 'orders-queue',
 * })
 * async handleOrder(message: OrderMessage) {
 *   try {
 *     await processOrder(message);
 *   } catch (error) {
 *     // Requeue the message for retry
 *     throw new Nack(true);
 *   }
 * }
 * ```
 */
export class Nack {
  /**
   * @param requeue If true, the message will be requeued and redelivered.
   * If false (default), the message will be discarded or sent to DLQ.
   */
  constructor(public readonly requeue = false) {}
}
