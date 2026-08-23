import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateOrderItem {
  name: string;
  base: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  extras: string[];
}

export interface CreateOrderRequest {
  customer: {
    name: string;
    phone: string;
  };

  items: CreateOrderItem[];

  pickupDate: string;
  pickupTime: string;

  note: string;

  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  // IMPORTANT: backend routes are under /api
  private readonly apiUrl = 'https://cheezy-mood-backend.onrender.com/api';

  constructor(private http: HttpClient) {}

  createOrder(order: CreateOrderRequest): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/orders`,
      order
    );
  }

  getCustomerOrders(phone: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/customers/${encodeURIComponent(phone)}/orders`
    );
  }
}