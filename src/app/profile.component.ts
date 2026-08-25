import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { OrderService, CustomerProfile, CustomerOrder, Invoice } from './services/order.service';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile: CustomerProfile | null = null;
  orders: CustomerOrder[] = [];
  loading = true;
  saving = false;
  invoiceLoading = false;
  selectedInvoice: Invoice | null = null;
  editName = '';
  profilePicture = '';
  error = '';
  private phone = '';
  private sub?: Subscription;

  constructor(private ordersApi: OrderService, private router: Router) {}

  ngOnInit(): void {
    this.phone = localStorage.getItem('cheezyMoodCustomerPhone') || '';
    if (!this.phone) { this.router.navigateByUrl('/'); return; }
    this.load();
    this.sub = timer(15000, 15000).subscribe(() => this.load(false));
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  load(showLoader = true): void {
    if (showLoader) this.loading = true;
    this.ordersApi.getCustomerProfile(this.phone).subscribe({
      next: data => {
        this.profile = data.customer;
        this.orders = data.orders || [];
        this.editName = data.customer.name || '';
        this.profilePicture = data.customer.profilePicture || '';
        this.loading = false;
        this.error = '';
      },
      error: err => {
        this.loading = false;
        this.error = err.status === 404 ? 'Customer profile not found.' : 'Could not load your profile.';
      }
    });
  }

  get currentOrders(): CustomerOrder[] {
    return this.orders.filter(o => ['pending', 'accepted', 'preparing', 'ready'].includes(o.status));
  }

  get historyOrders(): CustomerOrder[] {
    return this.orders.filter(o => !['pending', 'accepted', 'preparing', 'ready'].includes(o.status));
  }

  statusLabel(status: string): string {
    return ({ pending: 'WAITING FOR CASHIER', accepted: 'CONFIRMED', preparing: 'PREPARING', ready: 'READY FOR PICKUP', completed: 'COMPLETED', cancelled: 'CANCELLED', rejected: 'REJECTED' } as any)[status] || status.toUpperCase();
  }

  statusStep(status: string): number {
    return ({ pending: 1, accepted: 2, preparing: 3, ready: 4, completed: 5 } as any)[status] || 1;
  }

  hasUnreadChange(order: CustomerOrder): boolean {
    const last = order.statusHistory?.[order.statusHistory.length - 1];
    return !!last && last.status === order.status;
  }

  saveProfile(): void {
    if (!this.editName.trim() || this.saving) return;
    this.saving = true;
    this.ordersApi.updateCustomerProfile(this.phone, { name: this.editName.trim(), profilePicture: this.profilePicture }).subscribe({
      next: customer => { this.profile = customer; this.editName = customer.name; this.saving = false; },
      error: () => { this.saving = false; this.error = 'Could not save your profile.'; }
    });
  }

  choosePicture(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.error = 'Please choose an image.'; return; }
    if (file.size > 5_000_000) { this.error = 'Please choose an image smaller than 5 MB.'; return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 420;
        const scale = Math.min(1, size / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        this.profilePicture = canvas.toDataURL('image/jpeg', 0.78);
        this.error = '';
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }

  openInvoice(order: CustomerOrder): void {
    this.invoiceLoading = true;
    this.ordersApi.getCustomerInvoice(this.phone, order._id).subscribe({
      next: invoice => { this.selectedInvoice = invoice; this.invoiceLoading = false; },
      error: () => { this.invoiceLoading = false; this.error = 'Invoice could not be loaded.'; }
    });
  }

  closeInvoice(): void { this.selectedInvoice = null; }
  backHome(): void { this.router.navigateByUrl('/'); }
  formatDate(value: string): string { return new Date(value).toLocaleString('en-TN', { dateStyle: 'medium', timeStyle: 'short' }); }
}
