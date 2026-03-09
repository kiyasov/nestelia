import { Injectable } from "nestelia";

@Injectable()
export class ProductsService {
  private callCount = 0;

  async findAll() {
    this.callCount++;
    // Simulate slow DB query
    await new Promise((r) => setTimeout(r, 10));
    return { products: ["Apple", "Banana", "Cherry"], calls: this.callCount };
  }

  getCallCount() {
    return this.callCount;
  }
}
