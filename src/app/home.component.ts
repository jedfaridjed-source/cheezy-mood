import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from './services/order.service';

interface MenuItem { name: string; price: number; description?: string; }
interface CartItem { id: number; name: string; base: string; price: number; extras: string[]; quantity: number; }

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  constructor(private orderService: OrderService){}
  // CHANGE THIS to Cheezy Mood's WhatsApp number, digits only, including Tunisia country code.
  readonly whatsappNumber = '21624578212';

  readonly sandwichBase = 3.5;
  readonly pastaBase = 5;
  readonly friesPrice = 2;
  readonly Math = Math;
  readonly openingHour = 11;
  readonly closingHour = 23;
  readonly closingMinute = 30;
  readonly minimumLeadMinutes = 30;

  meats: MenuItem[] = [
    { name: 'Minced Chicken', price: 3 },
    { name: 'Philly Steak', price: 3 },
    { name: 'Ground Meat', price: 3 },
    { name: 'Sausage', price: 2.5 }
  ];
  cheeses: MenuItem[] = [
    { name: 'Mozzarella', price: 2 },
    { name: 'Cheddar', price: 4 },
    { name: 'Gruyère', price: 4 },
    { name: 'Cheese Sauce', price: 2 }
  ];
  pastas: MenuItem[] = [
    { name: 'Mac & Cheese', price: 0, description: 'Macaroni, cheese sauce & fried onion' },
    { name: 'Alfredo', price: 0, description: 'Penne or spaghetti, cream sauce' },
    { name: 'Rosa', price: 0, description: 'Penne or spaghetti, cream sauce & tomato sauce' }
  ];

  selectedBase = 'Sandwich';
  selectedPasta = 'Mac & Cheese';
  selectedMeats: string[] = [];
  selectedCheeses: string[] = [];
  addFries = false;
  quantity = 1;

  cart: CartItem[] = [];
  showCart = false;
  showCheckout = false;
  orderSent = false;
  mobileMenu = false;

  customerName = '';
  customerPhone = '';
  customerNote = '';
  pickupDate = 'today';
  pickupTime = '19:00';

  timeSlots: string[] = [];

  ngOnInit(): void {
    this.refreshTimeSlots();
  }

  refreshTimeSlots(): void {
    this.timeSlots = this.buildTimeSlots(this.pickupDate === 'today');

    if (!this.timeSlots.length && this.pickupDate === 'today') {
      this.pickupDate = 'tomorrow';
      this.timeSlots = this.buildTimeSlots(false);
    }

    if (!this.timeSlots.includes(this.pickupTime)) {
      this.pickupTime = this.timeSlots[0] ?? '';
    }
  }

  onPickupDateChange(): void {
    this.refreshTimeSlots();
  }

  private buildTimeSlots(isToday: boolean): string[] {
    const slots: string[] = [];
    let firstMinute = this.openingHour * 60;

    if (isToday) {
      const now = new Date();
      const currentMinute = now.getHours() * 60 + now.getMinutes();
      firstMinute = Math.max(
        firstMinute,
        Math.ceil((currentMinute + this.minimumLeadMinutes) / 15) * 15
      );
    }

    const lastMinute = this.closingHour * 60 + this.closingMinute;
    for (let minute = firstMinute; minute <= lastMinute; minute += 15) {
      const hour = Math.floor(minute / 60);
      const mins = minute % 60;
      slots.push(`${String(hour).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
    }
    return slots;
  }

  get currentTotal(): number {
    const base = this.selectedBase === 'Sandwich' ? this.sandwichBase : this.pastaBase;
    const extras = [...this.selectedMeats, ...this.selectedCheeses].reduce((sum, name) => sum + this.itemPrice(name), 0);
    return (base + extras + (this.addFries ? this.friesPrice : 0)) * this.quantity;
  }

  get cartTotal(): number { return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0); }
  get cartCount(): number { return this.cart.reduce((sum, item) => sum + item.quantity, 0); }

  itemPrice(name: string): number {
    return [...this.meats, ...this.cheeses].find(item => item.name === name)?.price ?? 0;
  }

  toggle(list: string[], value: string): void {
    const index = list.indexOf(value);
    if (index >= 0) list.splice(index, 1); else list.push(value);
  }

  isSelected(list: string[], value: string): boolean { return list.includes(value); }

  addToCart(): void {
    this.orderSent = false;
    const basePrice = this.selectedBase === 'Sandwich' ? this.sandwichBase : this.pastaBase;
    const baseName = this.selectedBase === 'Sandwich' ? 'Sandwich' : `Pasta — ${this.selectedPasta}`;
    const extras = [...this.selectedMeats, ...this.selectedCheeses];
    if (this.addFries) extras.push('Fries');
    const unitPrice = basePrice + extras.reduce((sum, name) => sum + (name === 'Fries' ? this.friesPrice : this.itemPrice(name)), 0);
    const id = Date.now() + Math.random();
    this.cart.push({ id, name: baseName, base: baseName, price: unitPrice, extras, quantity: this.quantity });
    this.quantity = 1;
    this.selectedMeats = [];
    this.selectedCheeses = [];
    this.addFries = false;
    this.showCart = true;
  }

  changeQty(item: CartItem, delta: number): void {
    item.quantity += delta;
    if (item.quantity <= 0) this.removeItem(item.id);
  }

  removeItem(id: number): void { this.cart = this.cart.filter(item => item.id !== id); }

  openCheckout(): void {
    if (!this.cart.length) return;
    this.showCheckout = true;
    this.showCart = false;
  }

  backToCart(): void { this.showCheckout = false; this.showCart = true; }

sendOrder(): void {
  if (
    !this.customerName.trim() ||
    !this.customerPhone.trim() ||
    !this.pickupTime ||
    !this.cart.length
  ) {
    return;
  }

  this.orderSent = false;

  const order = {
    customer: {
      name: this.customerName.trim(),
      phone: this.customerPhone.trim()
    },

    items: this.cart.map(item => ({
      name: item.name,
      base: item.base,
      quantity: item.quantity,
      unitPrice: Number(item.price.toFixed(2)),
      totalPrice: Number((item.price * item.quantity).toFixed(2)),
      extras: item.extras
    })),

    pickupDate: this.getPickupDate(),

    pickupTime: this.pickupTime,

    note: this.customerNote.trim(),

    total: Number(this.cartTotal.toFixed(2))
  };

  console.log('Sending order to backend:', order);

  this.orderService.createOrder(order).subscribe({

    next: (response) => {

      console.log('Order created successfully:', response);

      const orderNumber =
        response.orderNumber || 'CHEEZY-MOOD';

      const invoiceNumber =
        response.invoiceNumber || '';

      const confirmedPickupTime =
        response.pickupAt
          ? new Date(response.pickupAt).toLocaleTimeString(
              'en-TN',
              {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }
            )
          : this.pickupTime;

      const confirmedTotal =
        response.total ?? this.cartTotal;

      this.openWhatsApp(
        orderNumber,
        invoiceNumber,
        confirmedPickupTime,
        confirmedTotal
      );

      this.orderSent = true;
    },

    error: (error) => {

      console.error('Order creation failed:', error);

      /*
       * 409 means the requested pickup time is full.
       */
      if (
        error.status === 409 &&
        error.error?.code === 'PICKUP_SLOT_UNAVAILABLE'
      ) {

        const suggested = error.error.suggestedSlot;

        if (suggested) {

          alert(
            `This pickup time is full.\n\n` +
            `Next available pickup: ${suggested.time}`
          );

          this.pickupDate =
            suggested.date === this.getPickupDate()
              ? 'today'
              : 'tomorrow';

          this.pickupTime = suggested.time;

        } else {

          alert(
            'This pickup time is full and there are no more available slots.'
          );
        }

        return;
      }

      alert(
        'Sorry, we could not send your preorder. ' +
        'Please check your connection and try again.'
      );
    }

  });
}

  scrollTo(id: string): void {
    this.mobileMenu = false;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  formatPrice(value: number): string { return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} DT`; }

  private getPickupDate(): string {
  const date = new Date();

  if (this.pickupDate === 'tomorrow') {
    date.setDate(date.getDate() + 1);
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

private openWhatsApp(
  orderNumber: string,
  invoiceNumber: string,
  pickupTime: string,
  total: number
): void {

  const dateLabel =
    this.pickupDate === 'today'
      ? 'Today'
      : 'Tomorrow';

  const lines = this.cart.map(item => {

    const extras = item.extras.length
      ? ` + ${item.extras.join(', ')}`
      : '';

    return `• ${item.quantity}x ${item.name}${extras} — ${(item.price * item.quantity).toFixed(2)} DT`;
  });

  const message = [
    '🔥 CHEEZY MOOD — NEW PREORDER',
    '',
    `Order: ${orderNumber}`,
    invoiceNumber ? `Invoice: ${invoiceNumber}` : '',
    '',
    `Name: ${this.customerName.trim()}`,
    `Phone: ${this.customerPhone.trim()}`,
    `Pickup: ${dateLabel} at ${pickupTime}`,
    '',
    'ORDER:',
    ...lines,
    '',
    `TOTAL: ${Number(total).toFixed(2)} DT`,
    this.customerNote.trim()
      ? `Note: ${this.customerNote.trim()}`
      : '',
    '',
    'All About Junky Food 😎'
  ]
    .filter(Boolean)
    .join('\n');

  const url =
    `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;

  window.open(url, '_blank', 'noopener,noreferrer');
}
}

