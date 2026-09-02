/**
 * Prisma seed script — reuses the existing mock-data arrays as literal seed
 * fixtures instead of hand-authoring new data, so the DB-backed app looks
 * identical to the mock-data-driven app during the migration.
 *
 * Every entity is created with its existing mock-data string `id` (e.g.
 * 'cat_furniture', 'vnd_apex') passed straight through as the Prisma record
 * id, so cross-entity references in the mock data (categoryId, vendorId,
 * clientId, ...) resolve directly without needing an id-translation map.
 *
 * Run with: npm run db:seed
 */
import bcrypt from 'bcryptjs';
import {
  PrismaClient,
  UserType,
  Role,
  type CategoryStatus,
  type VendorStatus,
  type StockStatus,
  type OrderStatus,
  type ClientStatus,
  type InvoiceType,
  type InvoiceStatus,
  type InvoiceAlertTiming,
  type InvoiceAlertChannel,
  type InvoiceAlertRecipient,
  type QuotationStatus,
  type VendorDeliveryStatus,
  type VendorPurchaseInvoiceStatus,
  type TenderStatus,
  type RfqStatus,
  type InventoryStatus,
  type DeliveryStatus,
  type DeliveredByRole,
  type TicketPriority,
  type TicketStatus,
  type TicketChannel,
  type AssetStatus,
  type ForecastTrend,
  type RiskLevel,
  type ChatSenderRole,
  type ChatAttachmentType,
  type NotificationType,
} from '@prisma/client';

// Seed fixtures are read from apps/client's copy of the mock-data — both
// apps carry an identical copy, so either would do; client is canonical
// here since it's the primary consumer of the catalog data.
import { categories } from '../../../apps/client/src/lib/mock-data/categories';
import { vendors } from '../../../apps/client/src/lib/mock-data/vendors';
import { products } from '../../../apps/client/src/lib/mock-data/products';
import { testimonials } from '../../../apps/client/src/lib/mock-data/testimonials';
import { orders } from '../../../apps/client/src/lib/mock-data/orders';
import {
  invoices,
  ledgerEntries,
  warehouses,
  inventoryItems,
  deliveryJobs,
  supportTickets,
  assets,
  tenders,
  bidsByTender,
  quotesByRfq,
  rfqRequests,
  demandForecasts,
} from '../../../apps/client/src/lib/mock-data/enterprise';
import {
  clients,
  quotations,
  chatThreads,
  chatMessages,
  vendorPurchases,
  invoiceAlertRules,
  invoiceAlertLog,
  notifications,
} from '../../../apps/client/src/lib/mock-data/admin';

const prisma = new PrismaClient();

function buildEnumMap<T extends string>(dict: Record<string, T>) {
  return (key: string): T => {
    const value = dict[key];
    if (!value) throw new Error(`No enum mapping for "${key}"`);
    return value;
  };
}

const categoryStatusMap = buildEnumMap<CategoryStatus>({ active: 'ACTIVE', inactive: 'INACTIVE' });
const vendorStatusMap = buildEnumMap<VendorStatus>({
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  suspended: 'SUSPENDED',
});
const stockStatusMap = buildEnumMap<StockStatus>({
  'in-stock': 'IN_STOCK',
  'low-stock': 'LOW_STOCK',
  'out-of-stock': 'OUT_OF_STOCK',
  preorder: 'PREORDER',
});
const orderStatusMap = buildEnumMap<OrderStatus>({
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  processing: 'PROCESSING',
  packed: 'PACKED',
  shipped: 'SHIPPED',
  'out-for-delivery': 'OUT_FOR_DELIVERY',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
});
const clientStatusMap = buildEnumMap<ClientStatus>({ active: 'ACTIVE', suspended: 'SUSPENDED' });
const invoiceTypeMap = buildEnumMap<InvoiceType>({ receivable: 'RECEIVABLE', payable: 'PAYABLE' });
const invoiceStatusMap = buildEnumMap<InvoiceStatus>({
  draft: 'DRAFT',
  sent: 'SENT',
  paid: 'PAID',
  partial: 'PARTIAL',
  overdue: 'OVERDUE',
  credit: 'CREDIT',
});
const alertTimingMap = buildEnumMap<InvoiceAlertTiming>({
  '7-day': 'SEVEN_DAY',
  '3-day': 'THREE_DAY',
  'due-today': 'DUE_TODAY',
  overdue: 'OVERDUE',
});
const alertChannelMap = buildEnumMap<InvoiceAlertChannel>({
  dashboard: 'DASHBOARD',
  email: 'EMAIL',
  sms: 'SMS',
});
const alertRecipientMap = buildEnumMap<InvoiceAlertRecipient>({ client: 'CLIENT', admin: 'ADMIN' });
const quotationStatusMap = buildEnumMap<QuotationStatus>({
  requested: 'REQUESTED',
  approved: 'APPROVED',
  rejected: 'REJECTED',
});
const vendorDeliveryStatusMap = buildEnumMap<VendorDeliveryStatus>({
  ordered: 'ORDERED',
  shipped: 'SHIPPED',
  received: 'RECEIVED',
});
const vendorPurchaseInvoiceStatusMap = buildEnumMap<VendorPurchaseInvoiceStatus>({
  unbilled: 'UNBILLED',
  billed: 'BILLED',
  paid: 'PAID',
});
const tenderStatusMap = buildEnumMap<TenderStatus>({
  open: 'OPEN',
  evaluating: 'EVALUATING',
  awarded: 'AWARDED',
  closed: 'CLOSED',
});
const rfqStatusMap = buildEnumMap<RfqStatus>({
  draft: 'DRAFT',
  'rfq-sent': 'RFQ_SENT',
  'quotes-received': 'QUOTES_RECEIVED',
  'vendor-selected': 'VENDOR_SELECTED',
  'po-issued': 'PO_ISSUED',
  approved: 'APPROVED',
  receiving: 'RECEIVING',
  completed: 'COMPLETED',
});
const inventoryStatusMap = buildEnumMap<InventoryStatus>({
  healthy: 'HEALTHY',
  low: 'LOW',
  critical: 'CRITICAL',
  overstock: 'OVERSTOCK',
});
const deliveryStatusMap = buildEnumMap<DeliveryStatus>({
  processing: 'PROCESSING',
  packed: 'PACKED',
  dispatched: 'DISPATCHED',
  'out-for-delivery': 'OUT_FOR_DELIVERY',
  delivered: 'DELIVERED',
  delayed: 'DELAYED',
});
const deliveredByMap = buildEnumMap<DeliveredByRole>({ admin: 'ADMIN', customer: 'CUSTOMER' });
const ticketPriorityMap = buildEnumMap<TicketPriority>({
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  urgent: 'URGENT',
});
const ticketStatusMap = buildEnumMap<TicketStatus>({
  open: 'OPEN',
  pending: 'PENDING',
  resolved: 'RESOLVED',
});
const ticketChannelMap = buildEnumMap<TicketChannel>({
  email: 'EMAIL',
  chat: 'CHAT',
  phone: 'PHONE',
});
const assetStatusMap = buildEnumMap<AssetStatus>({
  'in-use': 'IN_USE',
  'in-storage': 'IN_STORAGE',
  maintenance: 'MAINTENANCE',
  retired: 'RETIRED',
});
const forecastTrendMap = buildEnumMap<ForecastTrend>({ up: 'UP', down: 'DOWN', stable: 'STABLE' });
const riskLevelMap = buildEnumMap<RiskLevel>({ low: 'LOW', medium: 'MEDIUM', high: 'HIGH' });
const chatSenderRoleMap = buildEnumMap<ChatSenderRole>({ customer: 'CUSTOMER', admin: 'ADMIN' });
const chatAttachmentTypeMap = buildEnumMap<ChatAttachmentType>({
  image: 'IMAGE',
  pdf: 'PDF',
  file: 'FILE',
});
const notificationTypeMap = buildEnumMap<NotificationType>({
  invoice: 'INVOICE',
  payment: 'PAYMENT',
  delivery: 'DELIVERY',
  credit: 'CREDIT',
});

async function main() {
  console.log('Seeding GoOrder database...');

  // --- Users -----------------------------------------------------------
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      id: 'usr_admin_001',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('Admin123!', 12),
      firstName: 'Alex',
      lastName: 'Admin',
      userType: UserType.STAFF,
      role: Role.ADMIN,
      isActive: true,
      emailVerified: new Date(),
    },
  });
  void adminUser;

  const customerUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      id: 'usr_user_001',
      email: 'user@example.com',
      passwordHash: await bcrypt.hash('User1234!', 12),
      firstName: 'Sam',
      lastName: 'User',
      userType: UserType.CUSTOMER,
      role: Role.USER,
      isActive: true,
      emailVerified: new Date(),
    },
  });

  // --- Catalog -----------------------------------------------------------
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        productCount: category.productCount,
        image: category.image,
        description: category.description,
        status: categoryStatusMap(category.status),
      },
    });
  }

  for (const vendor of vendors) {
    await prisma.vendor.upsert({
      where: { id: vendor.id },
      update: {},
      create: {
        id: vendor.id,
        name: vendor.name,
        slug: vendor.slug,
        logo: vendor.logo,
        banner: vendor.banner,
        rating: vendor.rating,
        reviewCount: vendor.reviewCount,
        verified: vendor.verified,
        location: vendor.location,
        responseTime: vendor.responseTime,
        yearsActive: vendor.yearsActive,
        fulfillmentRate: vendor.fulfillmentRate,
        certifications: vendor.certifications,
        status: vendorStatusMap(vendor.status),
        contactPerson: vendor.contactPerson,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        registeredAt: new Date(vendor.registeredAt),
        performanceScore: vendor.performanceScore,
        categories: { connect: vendor.categories.map((id) => ({ id })) },
      },
    });
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        shortDescription: product.shortDescription,
        description: product.description,
        images: product.images,
        categoryId: product.categoryId,
        vendorId: product.vendorId,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        currency: product.currency,
        rating: product.rating,
        reviewCount: product.reviewCount,
        stock: product.stock,
        stockStatus: stockStatusMap(product.stockStatus),
        sku: product.sku,
        unit: product.unit,
        minOrderQty: product.minOrderQty,
        tags: product.tags,
        isBestSeller: product.isBestSeller ?? false,
        isTrending: product.isTrending ?? false,
        isNew: product.isNew ?? false,
        deliveryEstimateDays: product.deliveryEstimateDays,
        bulkPricing: {
          create: product.bulkPricing.map((tier) => ({
            minQty: tier.minQty,
            maxQty: tier.maxQty,
            price: tier.price,
          })),
        },
        specifications: {
          create: product.specifications.map((spec) => ({ label: spec.label, value: spec.value })),
        },
        reviews: {
          create: product.reviews.map((review) => ({
            id: review.id,
            author: review.author,
            avatar: review.avatar,
            rating: review.rating,
            date: new Date(review.date),
            title: review.title,
            body: review.body,
            verified: review.verified,
            helpful: review.helpful,
          })),
        },
      },
    });
  }

  for (const testimonial of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: testimonial.id },
      update: {},
      create: {
        id: testimonial.id,
        name: testimonial.name,
        role: testimonial.role,
        company: testimonial.company,
        avatar: testimonial.avatar,
        quote: testimonial.quote,
        rating: testimonial.rating,
      },
    });
  }

  // --- Orders (all attributed to the demo customer) -----------------------
  for (const order of orders) {
    await prisma.order.upsert({
      where: { id: order.id },
      update: {},
      create: {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: customerUser.id,
        date: new Date(order.date),
        status: orderStatusMap(order.status),
        total: order.total,
        itemCount: order.itemCount,
        eta: order.eta,
        vendorName: order.vendorName,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        items: {
          create: order.items.map((item) => ({
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        timeline: {
          create: order.timeline.map((step) => ({
            status: orderStatusMap(step.status),
            label: step.label,
            timestamp: step.timestamp ? new Date(step.timestamp) : null,
            description: step.description,
          })),
        },
      },
    });
  }

  // --- Clients (client_1 linked to the demo customer login) ---------------
  for (const client of clients) {
    await prisma.client.upsert({
      where: { id: client.id },
      update: {},
      create: {
        id: client.id,
        userId: client.email.toLowerCase() === customerUser.email ? customerUser.id : null,
        companyName: client.companyName,
        contactName: client.contactName,
        email: client.email,
        phone: client.phone,
        address: client.address,
        status: clientStatusMap(client.status),
        creditLimit: client.creditLimit,
        creditUsed: client.creditUsed,
        creditFrozen: client.creditFrozen,
        outstandingBalance: client.outstandingBalance,
        dueAmount: client.dueAmount,
        nextDueDate: client.nextDueDate ? new Date(client.nextDueDate) : null,
        joinedAt: new Date(client.joinedAt),
        orderCount: client.orderCount,
        totalSpend: client.totalSpend,
        taxId: client.taxId,
        billingEmail: client.billingEmail,
        addresses: {
          create: client.addresses.map((address) => ({
            id: address.id,
            label: address.label,
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: address.isDefault,
          })),
        },
      },
    });
  }

  // --- Invoicing / accounting ----------------------------------------------
  for (const invoice of invoices) {
    await prisma.invoice.upsert({
      where: { id: invoice.id },
      update: {},
      create: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        vendorOrCustomer: invoice.vendorOrCustomer,
        clientId: invoice.clientId ?? null,
        type: invoiceTypeMap(invoice.type),
        issueDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
        amount: invoice.amount,
        amountPaid: invoice.amountPaid,
        status: invoiceStatusMap(invoice.status),
        orderNumber: invoice.orderNumber,
      },
    });
  }

  for (const rule of invoiceAlertRules) {
    await prisma.invoiceAlertRule.upsert({
      where: { id: rule.id },
      update: {},
      create: {
        id: rule.id,
        timing: alertTimingMap(rule.timing),
        label: rule.label,
        description: rule.description,
        channels: rule.channels.map(alertChannelMap),
        recipients: rule.recipients.map(alertRecipientMap),
        enabled: rule.enabled,
      },
    });
  }

  for (const logEntry of invoiceAlertLog) {
    await prisma.invoiceAlertLogEntry.upsert({
      where: { id: logEntry.id },
      update: {},
      create: {
        id: logEntry.id,
        invoiceNumber: logEntry.invoiceNumber,
        clientName: logEntry.clientName,
        timing: alertTimingMap(logEntry.timing),
        channel: alertChannelMap(logEntry.channel),
        recipient: alertRecipientMap(logEntry.recipient),
        sentAt: new Date(logEntry.sentAt),
      },
    });
  }

  for (const entry of ledgerEntries) {
    await prisma.ledgerEntry.upsert({
      where: { id: entry.id },
      update: {},
      create: {
        id: entry.id,
        date: new Date(entry.date),
        account: entry.account,
        description: entry.description,
        debit: entry.debit,
        credit: entry.credit,
      },
    });
  }

  // --- Quotations ------------------------------------------------------
  for (const quotation of quotations) {
    await prisma.quotation.upsert({
      where: { id: quotation.id },
      update: {},
      create: {
        id: quotation.id,
        quotationNumber: quotation.quotationNumber,
        clientId: quotation.clientId,
        productName: quotation.productName,
        quantity: quotation.quantity,
        unit: quotation.unit,
        notes: quotation.notes,
        estimatedTotal: quotation.estimatedTotal,
        status: quotationStatusMap(quotation.status),
        requestedAt: new Date(quotation.requestedAt),
        respondedAt: quotation.respondedAt ? new Date(quotation.respondedAt) : null,
        vendorName: quotation.vendorName,
      },
    });
  }

  // --- Vendor purchases --------------------------------------------------
  for (const purchase of vendorPurchases) {
    await prisma.vendorPurchase.upsert({
      where: { id: purchase.id },
      update: {},
      create: {
        id: purchase.id,
        vendorId: purchase.vendorId,
        vendorName: purchase.vendorName,
        productName: purchase.productName,
        quantity: purchase.quantity,
        purchaseCost: purchase.purchaseCost,
        purchaseDate: new Date(purchase.purchaseDate),
        expectedDeliveryDate: new Date(purchase.expectedDeliveryDate),
        deliveryDate: purchase.deliveryDate ? new Date(purchase.deliveryDate) : null,
        deliveryStatus: vendorDeliveryStatusMap(purchase.deliveryStatus),
        invoiceStatus: vendorPurchaseInvoiceStatusMap(purchase.invoiceStatus),
      },
    });
  }

  // --- Warehouses & inventory ----------------------------------------------
  for (const warehouse of warehouses) {
    await prisma.warehouseStock.upsert({
      where: { id: warehouse.id },
      update: {},
      create: {
        id: warehouse.id,
        warehouseName: warehouse.warehouseName,
        location: warehouse.location,
        utilization: warehouse.utilization,
        capacityUnits: warehouse.capacityUnits,
        usedUnits: warehouse.usedUnits,
      },
    });
  }

  const warehouseIdByName = new Map(
    warehouses.map((warehouse) => [warehouse.warehouseName, warehouse.id]),
  );

  for (const item of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        sku: item.sku,
        name: item.name,
        warehouseId: warehouseIdByName.get(item.warehouse) ?? null,
        onHand: item.onHand,
        reserved: item.reserved,
        reorderPoint: item.reorderPoint,
        reorderQty: item.reorderQty,
        status: inventoryStatusMap(item.status),
        category: item.category,
        unitCost: item.unitCost,
      },
    });
  }

  // --- Delivery ------------------------------------------------------------
  for (const job of deliveryJobs) {
    await prisma.deliveryJob.upsert({
      where: { id: job.id },
      update: {},
      create: {
        id: job.id,
        orderNumber: job.orderNumber,
        customer: job.customer,
        driver: job.driver,
        driverPhone: job.driverPhone,
        vehicle: job.vehicle,
        status: deliveryStatusMap(job.status),
        progress: job.progress,
        eta: job.eta,
        origin: job.origin,
        destination: job.destination,
        deliveredBy: job.deliveredBy ? deliveredByMap(job.deliveredBy) : null,
        deliveredAt: job.deliveredAt ? new Date(job.deliveredAt) : null,
      },
    });
  }

  // --- Support, assets -----------------------------------------------------
  for (const ticket of supportTickets) {
    await prisma.supportTicket.upsert({
      where: { id: ticket.id },
      update: {},
      create: {
        id: ticket.id,
        subject: ticket.subject,
        customer: ticket.customer,
        priority: ticketPriorityMap(ticket.priority),
        status: ticketStatusMap(ticket.status),
        updatedAt: new Date(ticket.updatedAt),
        channel: ticketChannelMap(ticket.channel),
      },
    });
  }

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { id: asset.id },
      update: {},
      create: {
        id: asset.id,
        tag: asset.tag,
        name: asset.name,
        category: asset.category,
        assignedTo: asset.assignedTo,
        location: asset.location,
        status: assetStatusMap(asset.status),
        purchaseDate: new Date(asset.purchaseDate),
        value: asset.value,
        nextMaintenance: asset.nextMaintenance === '—' ? null : new Date(asset.nextMaintenance),
      },
    });
  }

  // --- Tenders + bids --------------------------------------------------
  for (const tender of tenders) {
    await prisma.tender.upsert({
      where: { id: tender.id },
      update: {},
      create: {
        id: tender.id,
        title: tender.title,
        category: tender.category,
        budget: tender.budget,
        deadline: new Date(tender.deadline),
        status: tenderStatusMap(tender.status),
        bidCount: tender.bidCount,
      },
    });
  }

  for (const [tenderId, bids] of Object.entries(bidsByTender)) {
    for (const bid of bids) {
      await prisma.bid.upsert({
        where: { id: bid.id },
        update: {},
        create: {
          id: bid.id,
          tenderId,
          vendorName: bid.vendorName,
          amount: bid.amount,
          deliveryDays: bid.deliveryDays,
          rating: bid.rating,
          score: bid.score,
          recommended: bid.recommended ?? false,
        },
      });
    }
  }

  // --- RFQs + quotes -----------------------------------------------------
  for (const rfq of rfqRequests) {
    await prisma.rfqRequest.upsert({
      where: { id: rfq.id },
      update: {},
      create: {
        id: rfq.id,
        title: rfq.title,
        requestedBy: rfq.requestedBy,
        department: rfq.department,
        category: rfq.category,
        quantity: rfq.quantity,
        status: rfqStatusMap(rfq.status),
        createdAt: new Date(rfq.createdAt),
        estimatedValue: rfq.estimatedValue,
      },
    });
  }

  for (const [rfqId, quotes] of Object.entries(quotesByRfq)) {
    for (const quote of quotes) {
      await prisma.bid.upsert({
        where: { id: quote.id },
        update: {},
        create: {
          id: quote.id,
          rfqId,
          vendorName: quote.vendorName,
          amount: quote.amount,
          deliveryDays: quote.deliveryDays,
          rating: quote.rating,
          score: quote.score,
          recommended: quote.recommended ?? false,
        },
      });
    }
  }

  // --- Demand forecasting --------------------------------------------------
  for (const forecast of demandForecasts) {
    await prisma.demandForecastItem.upsert({
      where: { id: forecast.id },
      update: {},
      create: {
        id: forecast.id,
        product: forecast.product,
        category: forecast.category,
        currentStock: forecast.currentStock,
        predictedDemand: forecast.predictedDemand,
        confidence: forecast.confidence,
        trend: forecastTrendMap(forecast.trend),
        riskLevel: riskLevelMap(forecast.riskLevel),
        suggestedReorderQty: forecast.suggestedReorderQty,
        suggestedVendor: forecast.suggestedVendor,
      },
    });
  }

  // --- Chat (CRM) ----------------------------------------------------------
  for (const thread of chatThreads) {
    await prisma.chatThread.upsert({
      where: { id: thread.id },
      update: {},
      create: {
        id: thread.id,
        clientId: thread.clientId,
        subject: thread.subject,
        relatedOrderNumber: thread.relatedOrderNumber,
        relatedInvoiceNumber: thread.relatedInvoiceNumber,
        lastMessagePreview: thread.lastMessagePreview,
        lastMessageAt: new Date(thread.lastMessageAt),
        unreadForAdmin: thread.unreadForAdmin,
        unreadForCustomer: thread.unreadForCustomer,
      },
    });
  }

  for (const message of chatMessages) {
    await prisma.chatMessage.upsert({
      where: { id: message.id },
      update: {},
      create: {
        id: message.id,
        threadId: message.threadId,
        senderRole: chatSenderRoleMap(message.senderRole),
        senderName: message.senderName,
        body: message.body,
        createdAt: new Date(message.createdAt),
        readAt: message.readAt ? new Date(message.readAt) : null,
        attachments: message.attachments
          ? {
              create: message.attachments.map((attachment) => ({
                id: attachment.id,
                name: attachment.name,
                type: chatAttachmentTypeMap(attachment.type),
                url: attachment.url,
                size: attachment.size,
              })),
            }
          : undefined,
      },
    });
  }

  // --- Notifications (attributed to the demo customer's client) -----------
  const demoClientId =
    clients.find((client) => client.email.toLowerCase() === customerUser.email)?.id ?? null;
  for (const notification of notifications) {
    await prisma.appNotification.upsert({
      where: { id: notification.id },
      update: {},
      create: {
        id: notification.id,
        clientId: demoClientId,
        type: notificationTypeMap(notification.type),
        title: notification.title,
        message: notification.message,
        createdAt: new Date(notification.createdAt),
        read: notification.read,
        href: notification.href,
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
