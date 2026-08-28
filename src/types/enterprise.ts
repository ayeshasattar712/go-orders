export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'credit';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorOrCustomer: string;
  clientId?: string;
  type: 'receivable' | 'payable';
  issueDate: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  status: InvoiceStatus;
  orderNumber?: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
}

export interface WarehouseStock {
  id: string;
  warehouseName: string;
  location: string;
  utilization: number;
  capacityUnits: number;
  usedUnits: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  reorderPoint: number;
  reorderQty: number;
  status: 'healthy' | 'low' | 'critical' | 'overstock';
  category: string;
  unitCost: number;
}

export type DeliveryStatus =
  'processing' | 'packed' | 'dispatched' | 'out-for-delivery' | 'delivered' | 'delayed';

export interface DeliveryJob {
  id: string;
  orderNumber: string;
  customer: string;
  driver: string;
  driverPhone: string;
  vehicle: string;
  status: DeliveryStatus;
  progress: number;
  eta: string;
  origin: string;
  destination: string;
  deliveredBy?: 'admin' | 'customer';
  deliveredAt?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  customer: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved';
  updatedAt: string;
  channel: 'email' | 'chat' | 'phone';
}

export interface Asset {
  id: string;
  tag: string;
  name: string;
  category: string;
  assignedTo: string;
  location: string;
  status: 'in-use' | 'in-storage' | 'maintenance' | 'retired';
  purchaseDate: string;
  value: number;
  nextMaintenance: string;
}

export interface Tender {
  id: string;
  title: string;
  category: string;
  budget: number;
  deadline: string;
  status: 'open' | 'evaluating' | 'awarded' | 'closed';
  bidCount: number;
}

export interface Bid {
  id: string;
  vendorName: string;
  amount: number;
  deliveryDays: number;
  rating: number;
  score: number;
  recommended?: boolean;
}

export interface RfqRequest {
  id: string;
  title: string;
  requestedBy: string;
  department: string;
  category: string;
  quantity: number;
  status:
    | 'draft'
    | 'rfq-sent'
    | 'quotes-received'
    | 'vendor-selected'
    | 'po-issued'
    | 'approved'
    | 'receiving'
    | 'completed';
  createdAt: string;
  estimatedValue: number;
}

export interface DemandForecastItem {
  id: string;
  product: string;
  category: string;
  currentStock: number;
  predictedDemand: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
  suggestedReorderQty: number;
  suggestedVendor: string;
}
