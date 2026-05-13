export interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface OrderRequest {
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
}

export interface OrderResponse {
  orderId: string;
  status: string;
  total: number;
  createdAt: string;
  message: string;
}
