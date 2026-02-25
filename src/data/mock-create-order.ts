import { MOCK_API_DELAY } from "../constants/query-config";
import type { CreateOrderPayload } from "../types/order";

export async function createOrder(_payload: CreateOrderPayload): Promise<{ id: string }> {
    await new Promise<void>((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    return { id: `order-${Date.now()}` };
}
