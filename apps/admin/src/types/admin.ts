export type ClientStatus = 'active' | 'suspended';
export type CreditTerms = 'cod' | 'prepaid' | 'net-15' | 'net-30' | 'net-45' | 'net-60';

export interface ClientAddress {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  status: ClientStatus;
  creditLimit: number;
  creditUsed: number;
  creditFrozen: boolean;
  creditTerms: CreditTerms;
  outstandingBalance: number;
  dueAmount: number;
  nextDueDate: string | null;
  joinedAt: string;
  orderCount: number;
  totalSpend: number;
  taxId?: string;
  billingEmail?: string;
  addresses: ClientAddress[];
}

export type QuotationStatus = 'requested' | 'approved' | 'rejected';

export interface Quotation {
  id: string;
  quotationNumber: string;
  clientId: string;
  productName: string;
  quantity: number;
  unit: string;
  notes?: string;
  estimatedTotal: number;
  status: QuotationStatus;
  requestedAt: string;
  respondedAt: string | null;
  vendorName: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'file';
  url: string;
  size: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderRole: 'customer' | 'admin';
  senderName: string;
  body: string;
  attachments?: ChatAttachment[];
  createdAt: string;
  readAt: string | null;
}

export interface ChatThread {
  id: string;
  clientId: string;
  clientName: string;
  subject: string;
  relatedOrderNumber?: string;
  relatedInvoiceNumber?: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadForAdmin: number;
  unreadForCustomer: number;
}

export type VendorDeliveryStatus = 'ordered' | 'shipped' | 'received';

export interface VendorPurchase {
  id: string;
  vendorId: string;
  vendorName: string;
  productName: string;
  quantity: number;
  purchaseCost: number;
  purchaseDate: string;
  expectedDeliveryDate: string;
  deliveryDate: string | null;
  deliveryStatus: VendorDeliveryStatus;
  invoiceStatus: 'unbilled' | 'billed' | 'paid';
}

export type InvoiceAlertTiming = '7-day' | '3-day' | 'due-today' | 'overdue';
export type InvoiceAlertChannel = 'dashboard' | 'email' | 'sms';
export type InvoiceAlertRecipient = 'client' | 'admin';

export interface InvoiceAlertRule {
  id: string;
  timing: InvoiceAlertTiming;
  label: string;
  description: string;
  channels: InvoiceAlertChannel[];
  recipients: InvoiceAlertRecipient[];
  enabled: boolean;
}

export interface InvoiceAlertLogEntry {
  id: string;
  invoiceNumber: string;
  clientName: string;
  timing: InvoiceAlertTiming;
  channel: InvoiceAlertChannel;
  recipient: InvoiceAlertRecipient;
  sentAt: string;
}

export type NotificationType = 'invoice' | 'payment' | 'delivery' | 'credit';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  href?: string;
}
