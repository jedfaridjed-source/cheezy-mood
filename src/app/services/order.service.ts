import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StoreStatus {
  isOpen: boolean;
  ordersEnabled: boolean;
  reason: 'OPEN' | 'CLOSING_SOON' | 'CLOSED';
  openingTime: string;
  closingTime: string;
  minutesToClose: number;
  closingSoonMinutes: number;
  message: string | null;
}

export interface ArticleAvailability {
  _id: string;
  name: string;
  type: 'base' | 'extra' | 'product';
  department: 'sandwich' | 'pasta' | 'fries' | 'general';
  price: number;
  preparationMinutes: number;
  stock: number;
  minimumStock: number;
  active: boolean;
  unlimitedStock: boolean;
  unit: string;
  available: boolean;
  stockStatus: 'unlimited' | 'ok' | 'low' | 'out' | 'inactive';
}

export interface CreateOrderItem {
  name: string;
  base: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  extras: string[];
  articleId?: string;
  department?: 'sandwich' | 'pasta' | 'fries' | 'general';
  preparationMinutes?: number;
  stockRequirements?: { articleId: string; quantity: number }[];
}

export interface CreateOrderRequest {
  customer: { name: string; phone: string };
  items: CreateOrderItem[];
  pickupDate: string;
  pickupTime: string;
  note: string;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  // Local development. Change only this line for your Render deployment,
  // or replace it later with Angular environment configuration.
  private readonly apiUrl = 'https://cheezy-mood-backend.onrender.com/api';
  // private readonly apiUrl = 'http://localhost:5000/api'

  constructor(private http: HttpClient) {}

  createOrder(order: CreateOrderRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, order);
  }

  getCustomerOrders(phone: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers/${encodeURIComponent(phone)}/orders`);
  }

  getStoreStatus(): Observable<StoreStatus> {
    return this.http.get<StoreStatus>(`${this.apiUrl}/store/status`);
  }

  getAvailability(): Observable<ArticleAvailability[]> {
    return this.http.get<ArticleAvailability[]>(`${this.apiUrl}/articles/availability`);
  }

  getPickupSlots(date: 'today' | 'tomorrow'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/slots`, { params: { date } });
  }

  getCustomerProfile(phone: string): Observable<{customer: CustomerProfile; orders: CustomerOrder[]}> {
    return this.http.get<{customer: CustomerProfile; orders: CustomerOrder[]}>(`${this.apiUrl}/customers/${encodeURIComponent(phone)}/profile`);
  }

  updateCustomerProfile(phone: string, data: { name: string; profilePicture?: string }): Observable<CustomerProfile> {
    return this.http.patch<CustomerProfile>(`${this.apiUrl}/customers/${encodeURIComponent(phone)}/profile`, data);
  }

  getCustomerInvoice(phone: string, orderId: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/customers/${encodeURIComponent(phone)}/orders/${orderId}/invoice`);
  }
}

export interface CustomerProfile { _id: string; name: string; phone: string; profilePicture?: string; notes?: string; }
export interface CustomerOrder { _id: string; orderNumber: string; invoiceNumber: string; total: number; subtotal: number; status: string; paymentStatus: string; pickupAt: string; createdAt: string; items: any[]; note?: string; statusHistory?: any[]; }
export interface Invoice { invoiceNumber: string; orderNumber: string; issuedAt: string; customer: any; pickupAt: string; readyAt?: string; productionStartAt?: string; items: any[]; subtotal: number; total: number; status: string; paymentStatus: string; paymentMethod: string; }
