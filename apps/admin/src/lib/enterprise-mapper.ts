import type {
  Client as PrismaClient,
  ClientAddress as PrismaClientAddress,
  ClientStatus as PrismaClientStatus,
  Invoice as PrismaInvoice,
  InvoiceType as PrismaInvoiceType,
  InvoiceStatus as PrismaInvoiceStatus,
  InvoiceAlertRule as PrismaInvoiceAlertRule,
  InvoiceAlertTiming as PrismaInvoiceAlertTiming,
  InvoiceAlertChannel as PrismaInvoiceAlertChannel,
  InvoiceAlertRecipient as PrismaInvoiceAlertRecipient,
  InvoiceAlertLogEntry as PrismaInvoiceAlertLogEntry,
  Quotation as PrismaQuotation,
  QuotationStatus as PrismaQuotationStatus,
  VendorPurchase as PrismaVendorPurchase,
  VendorDeliveryStatus as PrismaVendorDeliveryStatus,
  VendorPurchaseInvoiceStatus as PrismaVendorPurchaseInvoiceStatus,
  AppNotification as PrismaAppNotification,
  NotificationType as PrismaNotificationType,
  DeliveryJob as PrismaDeliveryJob,
  DeliveryStatus as PrismaDeliveryStatus,
  DeliveryAttempt as PrismaDeliveryAttempt,
  DeliveredByRole as PrismaDeliveredByRole,
  SupportTicket as PrismaSupportTicket,
  TicketPriority as PrismaTicketPriority,
  TicketStatus as PrismaTicketStatus,
  TicketChannel as PrismaTicketChannel,
  Asset as PrismaAsset,
  AssetStatus as PrismaAssetStatus,
  Tender as PrismaTender,
  TenderStatus as PrismaTenderStatus,
  Bid as PrismaBid,
  RfqRequest as PrismaRfqRequest,
  RfqStatus as PrismaRfqStatus,
  DemandForecastItem as PrismaDemandForecastItem,
  ForecastTrend as PrismaForecastTrend,
  RiskLevel as PrismaRiskLevel,
  WarehouseStock as PrismaWarehouseStock,
  InventoryItem as PrismaInventoryItem,
  InventoryStatus as PrismaInventoryStatus,
  LedgerEntry as PrismaLedgerEntry,
  Payment as PrismaPayment,
  PaymentStatus as PrismaPaymentStatus,
  CheckoutPaymentMethod as PrismaCheckoutPaymentMethod,
  Order as PrismaOrder,
  Testimonial as PrismaTestimonial,
  ChatThread as PrismaChatThread,
  ChatMessage as PrismaChatMessage,
  ChatSenderRole as PrismaChatSenderRole,
  ChatAttachment as PrismaChatAttachment,
  ChatAttachmentType as PrismaChatAttachmentType,
  User as PrismaUser,
  CreditTerms as PrismaCreditTerms,
} from '@prisma/client';
import type {
  Client,
  InvoiceAlertRule,
  InvoiceAlertLogEntry,
  Quotation,
  VendorPurchase,
  AppNotification,
  ChatThread,
  ChatMessage,
  ChatAttachment,
} from '@/types/admin';
import type {
  Invoice,
  LedgerEntry,
  ReceivedPayment,
  DeliveryJob,
  SupportTicket,
  Asset,
  Tender,
  Bid,
  RfqRequest,
  DemandForecastItem,
  WarehouseStock,
  InventoryItem,
} from '@/types/enterprise';
import type { Testimonial } from '@/types/catalog';
import type { User } from '@/types/auth';
import type { CreditTerms } from '@/constants/credit-terms';

export const CREDIT_TERMS_TO_STRING: Record<PrismaCreditTerms, CreditTerms> = {
  COD: 'cod',
  PREPAID: 'prepaid',
  NET_15: 'net-15',
  NET_30: 'net-30',
  NET_45: 'net-45',
  NET_60: 'net-60',
};

export const CREDIT_TERMS_FROM_STRING: Record<CreditTerms, PrismaCreditTerms> = {
  cod: 'COD',
  prepaid: 'PREPAID',
  'net-15': 'NET_15',
  'net-30': 'NET_30',
  'net-45': 'NET_45',
  'net-60': 'NET_60',
};

export const CLIENT_STATUS_TO_STRING: Record<PrismaClientStatus, Client['status']> = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
};

export function serializeClient(
  client: PrismaClient & { addresses?: PrismaClientAddress[] },
): Client {
  return {
    id: client.id,
    companyName: client.companyName,
    contactName: client.contactName,
    email: client.email,
    phone: client.phone,
    address: client.address,
    status: CLIENT_STATUS_TO_STRING[client.status],
    creditLimit: client.creditLimit,
    creditUsed: client.creditUsed,
    creditFrozen: client.creditFrozen,
    creditTerms: CREDIT_TERMS_TO_STRING[client.creditTerms] ?? 'net-30',
    outstandingBalance: client.outstandingBalance,
    dueAmount: client.dueAmount,
    nextDueDate: client.nextDueDate ? client.nextDueDate.toISOString().slice(0, 10) : null,
    joinedAt: client.joinedAt.toISOString().slice(0, 10),
    orderCount: client.orderCount,
    totalSpend: client.totalSpend,
    taxId: client.taxId ?? undefined,
    billingEmail: client.billingEmail ?? undefined,
    addresses: (client.addresses ?? []).map((addr) => ({
      id: addr.id,
      label: addr.label,
      line1: addr.line1,
      line2: addr.line2 ?? undefined,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    })),
  };
}

export const INVOICE_TYPE_TO_STRING: Record<PrismaInvoiceType, Invoice['type']> = {
  RECEIVABLE: 'receivable',
  PAYABLE: 'payable',
};

export const INVOICE_STATUS_TO_STRING: Record<PrismaInvoiceStatus, Invoice['status']> = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
  CREDIT: 'credit',
};

export function serializeInvoice(invoice: PrismaInvoice): Invoice {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    vendorOrCustomer: invoice.vendorOrCustomer,
    clientId: invoice.clientId ?? undefined,
    type: INVOICE_TYPE_TO_STRING[invoice.type],
    issueDate: invoice.issueDate.toISOString().slice(0, 10),
    dueDate: invoice.dueDate.toISOString().slice(0, 10),
    amount: invoice.amount,
    amountPaid: invoice.amountPaid,
    status: INVOICE_STATUS_TO_STRING[invoice.status],
    orderNumber: invoice.orderNumber ?? undefined,
  };
}

export const ALERT_TIMING_TO_STRING: Record<PrismaInvoiceAlertTiming, InvoiceAlertRule['timing']> =
  {
    SEVEN_DAY: '7-day',
    THREE_DAY: '3-day',
    DUE_TODAY: 'due-today',
    OVERDUE: 'overdue',
  };

export const ALERT_CHANNEL_TO_STRING: Record<
  PrismaInvoiceAlertChannel,
  InvoiceAlertRule['channels'][number]
> = {
  DASHBOARD: 'dashboard',
  EMAIL: 'email',
  SMS: 'sms',
};

export const ALERT_RECIPIENT_TO_STRING: Record<
  PrismaInvoiceAlertRecipient,
  InvoiceAlertRule['recipients'][number]
> = {
  CLIENT: 'client',
  ADMIN: 'admin',
};

export function serializeInvoiceAlertRule(rule: PrismaInvoiceAlertRule): InvoiceAlertRule {
  return {
    id: rule.id,
    timing: ALERT_TIMING_TO_STRING[rule.timing],
    label: rule.label,
    description: rule.description,
    channels: rule.channels.map((channel) => ALERT_CHANNEL_TO_STRING[channel]),
    recipients: rule.recipients.map((recipient) => ALERT_RECIPIENT_TO_STRING[recipient]),
    enabled: rule.enabled,
  };
}

export function serializeInvoiceAlertLogEntry(
  entry: PrismaInvoiceAlertLogEntry,
): InvoiceAlertLogEntry {
  return {
    id: entry.id,
    invoiceNumber: entry.invoiceNumber,
    clientName: entry.clientName,
    timing: ALERT_TIMING_TO_STRING[entry.timing],
    channel: ALERT_CHANNEL_TO_STRING[entry.channel],
    recipient: ALERT_RECIPIENT_TO_STRING[entry.recipient],
    sentAt: entry.sentAt.toISOString(),
  };
}

export const QUOTATION_STATUS_TO_STRING: Record<PrismaQuotationStatus, Quotation['status']> = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export function serializeQuotation(quotation: PrismaQuotation): Quotation {
  return {
    id: quotation.id,
    quotationNumber: quotation.quotationNumber,
    clientId: quotation.clientId,
    productName: quotation.productName,
    quantity: quotation.quantity,
    unit: quotation.unit,
    notes: quotation.notes ?? undefined,
    estimatedTotal: quotation.estimatedTotal,
    status: QUOTATION_STATUS_TO_STRING[quotation.status],
    requestedAt: quotation.requestedAt.toISOString(),
    respondedAt: quotation.respondedAt ? quotation.respondedAt.toISOString() : null,
    vendorName: quotation.vendorName,
  };
}

export const VENDOR_DELIVERY_STATUS_TO_STRING: Record<
  PrismaVendorDeliveryStatus,
  VendorPurchase['deliveryStatus']
> = {
  ORDERED: 'ordered',
  SHIPPED: 'shipped',
  RECEIVED: 'received',
};

export const VENDOR_PURCHASE_INVOICE_STATUS_TO_STRING: Record<
  PrismaVendorPurchaseInvoiceStatus,
  VendorPurchase['invoiceStatus']
> = {
  UNBILLED: 'unbilled',
  BILLED: 'billed',
  PAID: 'paid',
};

export function serializeVendorPurchase(purchase: PrismaVendorPurchase): VendorPurchase {
  return {
    id: purchase.id,
    vendorId: purchase.vendorId,
    vendorName: purchase.vendorName,
    productName: purchase.productName,
    quantity: purchase.quantity,
    purchaseCost: purchase.purchaseCost,
    purchaseDate: purchase.purchaseDate.toISOString().slice(0, 10),
    expectedDeliveryDate: purchase.expectedDeliveryDate.toISOString().slice(0, 10),
    deliveryDate: purchase.deliveryDate ? purchase.deliveryDate.toISOString().slice(0, 10) : null,
    deliveryStatus: VENDOR_DELIVERY_STATUS_TO_STRING[purchase.deliveryStatus],
    invoiceStatus: VENDOR_PURCHASE_INVOICE_STATUS_TO_STRING[purchase.invoiceStatus],
  };
}

export const NOTIFICATION_TYPE_TO_STRING: Record<PrismaNotificationType, AppNotification['type']> =
  {
    INVOICE: 'invoice',
    PAYMENT: 'payment',
    DELIVERY: 'delivery',
    CREDIT: 'credit',
  };

export function serializeNotification(notification: PrismaAppNotification): AppNotification {
  return {
    id: notification.id,
    type: NOTIFICATION_TYPE_TO_STRING[notification.type],
    title: notification.title,
    message: notification.message,
    createdAt: notification.createdAt.toISOString(),
    read: notification.read,
    href: notification.href ?? undefined,
  };
}

export const DELIVERY_STATUS_TO_STRING: Record<PrismaDeliveryStatus, DeliveryJob['status']> = {
  PROCESSING: 'processing',
  PACKED: 'packed',
  DISPATCHED: 'dispatched',
  OUT_FOR_DELIVERY: 'out-for-delivery',
  DELIVERED: 'delivered',
  DELAYED: 'delayed',
  FAILED: 'failed',
};

export const DELIVERED_BY_TO_STRING: Record<
  PrismaDeliveredByRole,
  NonNullable<DeliveryJob['deliveredBy']>
> = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
};

export function serializeDeliveryJob(
  job: PrismaDeliveryJob & { attempts?: PrismaDeliveryAttempt[] },
): DeliveryJob {
  return {
    id: job.id,
    orderNumber: job.orderNumber,
    customer: job.customer,
    driver: job.driver,
    driverPhone: job.driverPhone,
    vehicle: job.vehicle,
    status: DELIVERY_STATUS_TO_STRING[job.status],
    progress: job.progress,
    eta: job.eta,
    origin: job.origin,
    destination: job.destination,
    trackingNumber: job.trackingNumber ?? undefined,
    maxAttempts: job.maxAttempts,
    attempts: (job.attempts ?? []).map((attempt) => ({
      attemptNumber: attempt.attemptNumber,
      outcome: attempt.outcome === 'SUCCESS' ? 'success' : 'failed',
      reason: attempt.reason ?? undefined,
      attemptedAt: attempt.attemptedAt.toISOString(),
      nextAttemptAt: attempt.nextAttemptAt ? attempt.nextAttemptAt.toISOString() : undefined,
    })),
    deliveredBy: job.deliveredBy ? DELIVERED_BY_TO_STRING[job.deliveredBy] : undefined,
    deliveredAt: job.deliveredAt ? job.deliveredAt.toISOString() : undefined,
  };
}

export const TICKET_PRIORITY_TO_STRING: Record<PrismaTicketPriority, SupportTicket['priority']> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const TICKET_STATUS_TO_STRING: Record<PrismaTicketStatus, SupportTicket['status']> = {
  OPEN: 'open',
  PENDING: 'pending',
  RESOLVED: 'resolved',
};

export const TICKET_CHANNEL_TO_STRING: Record<PrismaTicketChannel, SupportTicket['channel']> = {
  EMAIL: 'email',
  CHAT: 'chat',
  PHONE: 'phone',
};

export function serializeSupportTicket(ticket: PrismaSupportTicket): SupportTicket {
  return {
    id: ticket.id,
    subject: ticket.subject,
    customer: ticket.customer,
    priority: TICKET_PRIORITY_TO_STRING[ticket.priority],
    status: TICKET_STATUS_TO_STRING[ticket.status],
    updatedAt: ticket.updatedAt.toISOString(),
    channel: TICKET_CHANNEL_TO_STRING[ticket.channel],
  };
}

export const ASSET_STATUS_TO_STRING: Record<PrismaAssetStatus, Asset['status']> = {
  IN_USE: 'in-use',
  IN_STORAGE: 'in-storage',
  MAINTENANCE: 'maintenance',
  RETIRED: 'retired',
};

export function serializeAsset(asset: PrismaAsset): Asset {
  return {
    id: asset.id,
    tag: asset.tag,
    name: asset.name,
    category: asset.category,
    assignedTo: asset.assignedTo,
    location: asset.location,
    status: ASSET_STATUS_TO_STRING[asset.status],
    purchaseDate: asset.purchaseDate.toISOString().slice(0, 10),
    value: asset.value,
    nextMaintenance: asset.nextMaintenance ? asset.nextMaintenance.toISOString().slice(0, 10) : '—',
  };
}

export const TENDER_STATUS_TO_STRING: Record<PrismaTenderStatus, Tender['status']> = {
  OPEN: 'open',
  EVALUATING: 'evaluating',
  AWARDED: 'awarded',
  CLOSED: 'closed',
};

export function serializeTender(tender: PrismaTender): Tender {
  return {
    id: tender.id,
    title: tender.title,
    category: tender.category,
    budget: tender.budget,
    deadline: tender.deadline.toISOString().slice(0, 10),
    status: TENDER_STATUS_TO_STRING[tender.status],
    bidCount: tender.bidCount,
  };
}

export function serializeBid(bid: PrismaBid): Bid {
  return {
    id: bid.id,
    vendorName: bid.vendorName,
    amount: bid.amount,
    deliveryDays: bid.deliveryDays,
    rating: bid.rating,
    score: bid.score,
    recommended: bid.recommended,
  };
}

export const RFQ_STATUS_TO_STRING: Record<PrismaRfqStatus, RfqRequest['status']> = {
  DRAFT: 'draft',
  RFQ_SENT: 'rfq-sent',
  QUOTES_RECEIVED: 'quotes-received',
  VENDOR_SELECTED: 'vendor-selected',
  PO_ISSUED: 'po-issued',
  APPROVED: 'approved',
  RECEIVING: 'receiving',
  COMPLETED: 'completed',
};

export function serializeRfqRequest(rfq: PrismaRfqRequest): RfqRequest {
  return {
    id: rfq.id,
    title: rfq.title,
    requestedBy: rfq.requestedBy,
    department: rfq.department,
    category: rfq.category,
    quantity: rfq.quantity,
    status: RFQ_STATUS_TO_STRING[rfq.status],
    createdAt: rfq.createdAt.toISOString().slice(0, 10),
    estimatedValue: rfq.estimatedValue,
  };
}

export const FORECAST_TREND_TO_STRING: Record<PrismaForecastTrend, DemandForecastItem['trend']> = {
  UP: 'up',
  DOWN: 'down',
  STABLE: 'stable',
};

export const RISK_LEVEL_TO_STRING: Record<PrismaRiskLevel, DemandForecastItem['riskLevel']> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export function serializeDemandForecastItem(item: PrismaDemandForecastItem): DemandForecastItem {
  return {
    id: item.id,
    product: item.product,
    category: item.category,
    currentStock: item.currentStock,
    predictedDemand: item.predictedDemand,
    confidence: item.confidence,
    trend: FORECAST_TREND_TO_STRING[item.trend],
    riskLevel: RISK_LEVEL_TO_STRING[item.riskLevel],
    suggestedReorderQty: item.suggestedReorderQty,
    suggestedVendor: item.suggestedVendor,
  };
}

export function serializeWarehouseStock(warehouse: PrismaWarehouseStock): WarehouseStock {
  return {
    id: warehouse.id,
    warehouseName: warehouse.warehouseName,
    location: warehouse.location,
    utilization: warehouse.utilization,
    capacityUnits: warehouse.capacityUnits,
    usedUnits: warehouse.usedUnits,
  };
}

export const INVENTORY_STATUS_TO_STRING: Record<PrismaInventoryStatus, InventoryItem['status']> = {
  HEALTHY: 'healthy',
  LOW: 'low',
  CRITICAL: 'critical',
  OVERSTOCK: 'overstock',
};

export function serializeInventoryItem(
  item: PrismaInventoryItem & { warehouse?: Pick<PrismaWarehouseStock, 'warehouseName'> | null },
): InventoryItem {
  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    warehouse: item.warehouse?.warehouseName ?? '',
    onHand: item.onHand,
    reserved: item.reserved,
    reorderPoint: item.reorderPoint,
    reorderQty: item.reorderQty,
    status: INVENTORY_STATUS_TO_STRING[item.status],
    category: item.category,
    unitCost: item.unitCost,
  };
}

export function serializeLedgerEntry(entry: PrismaLedgerEntry): LedgerEntry {
  return {
    id: entry.id,
    date: entry.date.toISOString().slice(0, 10),
    account: entry.account,
    description: entry.description,
    debit: entry.debit,
    credit: entry.credit,
  };
}

const PAYMENT_METHOD_TO_STRING: Record<PrismaCheckoutPaymentMethod, ReceivedPayment['method']> = {
  BANK_ACCOUNT: 'bank-account',
  ONLINE_TRANSFER: 'online-transfer',
};

const PAYMENT_STATUS_TO_STRING: Record<PrismaPaymentStatus, ReceivedPayment['status']> = {
  PENDING: 'pending',
  AWAITING_TRANSFER: 'awaiting-transfer',
  CONFIRMED: 'confirmed',
};

export function serializeReceivedPayment(
  payment: PrismaPayment & { order: PrismaOrder & { user: PrismaUser | null } },
): ReceivedPayment {
  const method = PAYMENT_METHOD_TO_STRING[payment.method];
  const name = payment.order.user
    ? `${payment.order.user.firstName} ${payment.order.user.lastName}`.trim()
    : payment.order.shippingName || payment.order.vendorName;
  return {
    id: payment.id,
    orderNumber: payment.order.orderNumber,
    customerName: name,
    customerEmail: payment.order.user?.email,
    method,
    methodLabel: method === 'bank-account' ? 'Bank transfer' : 'Online transfer',
    status: PAYMENT_STATUS_TO_STRING[payment.status],
    amount: payment.amount,
    reference: payment.reference,
    bankName: payment.bankName ?? undefined,
    accountTitle: payment.accountTitle ?? undefined,
    accountNumber: payment.accountNumber ?? undefined,
    transferReference: payment.transferReference ?? undefined,
    paidAt: payment.paidAt?.toISOString(),
    createdAt: payment.createdAt.toISOString(),
  };
}

export function serializeTestimonial(testimonial: PrismaTestimonial): Testimonial {
  return {
    id: testimonial.id,
    name: testimonial.name,
    role: testimonial.role,
    company: testimonial.company,
    avatar: testimonial.avatar,
    quote: testimonial.quote,
    rating: testimonial.rating,
  };
}

export function serializeChatThread(
  thread: PrismaChatThread & { client?: Pick<PrismaClient, 'companyName'> | null },
): ChatThread {
  return {
    id: thread.id,
    clientId: thread.clientId,
    clientName: thread.client?.companyName ?? '',
    subject: thread.subject,
    relatedOrderNumber: thread.relatedOrderNumber ?? undefined,
    relatedInvoiceNumber: thread.relatedInvoiceNumber ?? undefined,
    lastMessagePreview: thread.lastMessagePreview,
    lastMessageAt: thread.lastMessageAt.toISOString(),
    unreadForAdmin: thread.unreadForAdmin,
    unreadForCustomer: thread.unreadForCustomer,
  };
}

export const CHAT_SENDER_ROLE_TO_STRING: Record<PrismaChatSenderRole, ChatMessage['senderRole']> = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

export const CHAT_ATTACHMENT_TYPE_TO_STRING: Record<
  PrismaChatAttachmentType,
  ChatAttachment['type']
> = {
  IMAGE: 'image',
  PDF: 'pdf',
  FILE: 'file',
};

export function serializeChatMessage(
  message: PrismaChatMessage & { attachments?: PrismaChatAttachment[] },
): ChatMessage {
  return {
    id: message.id,
    threadId: message.threadId,
    senderRole: CHAT_SENDER_ROLE_TO_STRING[message.senderRole],
    senderName: message.senderName,
    body: message.body,
    attachments: message.attachments?.map((att) => ({
      id: att.id,
      name: att.name,
      type: CHAT_ATTACHMENT_TYPE_TO_STRING[att.type],
      url: att.url,
      size: att.size,
    })),
    createdAt: message.createdAt.toISOString(),
    readAt: message.readAt ? message.readAt.toISOString() : null,
  };
}

export function serializePublicUser(user: PrismaUser): User {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    userType: user.userType,
    role: user.role,
    permissions: [],
    avatarUrl: user.avatarUrl ?? undefined,
    isActive: user.isActive,
    emailVerified: Boolean(user.emailVerified),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
