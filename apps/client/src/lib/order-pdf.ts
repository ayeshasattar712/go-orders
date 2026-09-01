import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';

export type OrderPdfItem = {
  name: string;
  quantity: number;
  price: number;
};

export type OrderPdfInput = {
  orderNumber: string;
  date: string;
  status: string;
  vendorName: string;
  total: number;
  eta?: string;
  trackingNumber?: string;
  carrier?: string;
  customerName?: string;
  customerEmail?: string;
  shipTo?: string[];
  paymentLabel?: string;
  items: OrderPdfItem[];
};

const PURPLE = rgb(0.486, 0.227, 0.929);
const CHARCOAL = rgb(0.12, 0.12, 0.16);
const MUTED = rgb(0.4, 0.4, 0.45);
const LINE = rgb(0.88, 0.88, 0.9);
const WHITE = rgb(1, 1, 1);

function money(value: number) {
  return `Rs ${new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
}

function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/-/g, ' ');
}

function truncate(font: PDFFont, text: string, size: number, maxWidth: number) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let value = text;
  while (value.length > 1 && font.widthOfTextAtSize(`${value}…`, size) > maxWidth) {
    value = value.slice(0, -1);
  }
  return `${value}…`;
}

function drawChrome(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  orderNumber: string,
  pageLabel: string,
) {
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: height - 96, width, height: 96, color: CHARCOAL });
  page.drawRectangle({ x: 0, y: height - 100, width, height: 4, color: PURPLE });
  page.drawText('GoOrder', { x: 48, y: height - 52, size: 22, font: bold, color: WHITE });
  page.drawText('Corporate marketplace', {
    x: 48,
    y: height - 72,
    size: 10,
    font,
    color: rgb(0.75, 0.72, 0.85),
  });
  page.drawText('SALES ORDER', {
    x: width - 48 - bold.widthOfTextAtSize('SALES ORDER', 14),
    y: height - 48,
    size: 14,
    font: bold,
    color: WHITE,
  });
  page.drawText(orderNumber, {
    x: width - 48 - font.widthOfTextAtSize(orderNumber, 11),
    y: height - 68,
    size: 11,
    font,
    color: rgb(0.85, 0.82, 0.95),
  });
  page.drawText(pageLabel, {
    x: 48,
    y: 36,
    size: 8,
    font,
    color: MUTED,
  });
}

export async function buildOrderPdf(input: OrderPdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageSize: [number, number] = [612, 792];

  const pages: PDFPage[] = [];
  const first = pdf.addPage(pageSize);
  pages.push(first);

  const drawHeader = (page: PDFPage, index: number, total: number) => {
    drawChrome(page, font, bold, input.orderNumber, `GoOrder, Inc.  ·  Saved as PDF form  ·  Page ${index} of ${total}`);
  };

  const { width, height } = first.getSize();
  let page = first;
  let y = height - 140;

  page.drawText('CUSTOMER', { x: 48, y, size: 9, font: bold, color: PURPLE });
  y -= 18;
  page.drawText(input.customerName || 'Guest order', {
    x: 48,
    y,
    size: 12,
    font: bold,
    color: CHARCOAL,
  });
  if (input.customerEmail) {
    y -= 14;
    page.drawText(input.customerEmail, { x: 48, y, size: 10, font, color: MUTED });
  }
  const shipLines = (input.shipTo ?? []).filter(Boolean);
  if (shipLines.length > 0) {
    y -= 18;
    page.drawText('SHIP TO', { x: 48, y, size: 9, font: bold, color: PURPLE });
    for (const line of shipLines) {
      y -= 14;
      page.drawText(truncate(font, line, 10, 280), { x: 48, y, size: 10, font, color: MUTED });
    }
  }

  const metaX = 360;
  let metaY = height - 140;
  const meta: [string, string][] = [
    ['Order date', dateLabel(input.date)],
    ['Status', statusLabel(input.status)],
    ['Vendor', input.vendorName],
    ['Tracking', input.trackingNumber || '—'],
    ['Carrier', input.carrier || '—'],
    ['ETA', input.eta || '—'],
    ['Payment', input.paymentLabel || '—'],
  ];
  for (const [label, value] of meta) {
    page.drawText(label, { x: metaX, y: metaY, size: 9, font, color: MUTED });
    page.drawText(truncate(bold, value, 10, 150), {
      x: metaX + 70,
      y: metaY,
      size: 10,
      font: bold,
      color: CHARCOAL,
    });
    metaY -= 16;
  }

  y = Math.min(y, metaY) - 28;

  const drawTableHeader = () => {
    page.drawRectangle({ x: 48, y: y - 6, width: width - 96, height: 24, color: PURPLE });
    page.drawText('Item', { x: 60, y, size: 10, font: bold, color: WHITE });
    page.drawText('Qty', { x: 360, y, size: 10, font: bold, color: WHITE });
    page.drawText('Amount', {
      x: width - 60 - bold.widthOfTextAtSize('Amount', 10),
      y,
      size: 10,
      font: bold,
      color: WHITE,
    });
    y -= 32;
  };

  drawTableHeader();

  const minY = 200;
  for (const item of input.items) {
    if (y < minY) {
      page = pdf.addPage(pageSize);
      pages.push(page);
      y = height - 140;
      drawTableHeader();
    }
    const lineTotal = money(item.price * item.quantity);
    page.drawText(truncate(font, item.name, 10, 280), { x: 60, y, size: 10, font, color: CHARCOAL });
    page.drawText(String(item.quantity), { x: 360, y, size: 10, font, color: CHARCOAL });
    page.drawText(lineTotal, {
      x: width - 60 - font.widthOfTextAtSize(lineTotal, 10),
      y,
      size: 10,
      font,
      color: CHARCOAL,
    });
    y -= 18;
  }

  if (y < 220) {
    page = pdf.addPage(pageSize);
    pages.push(page);
    y = height - 140;
  }

  page.drawLine({
    start: { x: 48, y },
    end: { x: width - 48, y },
    thickness: 1,
    color: LINE,
  });
  y -= 22;
  const totalText = money(input.total);
  page.drawText('Order total', { x: 360, y, size: 11, font: bold, color: PURPLE });
  page.drawText(totalText, {
    x: width - 60 - bold.widthOfTextAtSize(totalText, 11),
    y,
    size: 11,
    font: bold,
    color: PURPLE,
  });

  y -= 28;
  page.drawText('Fulfillment notes', { x: 48, y, size: 10, font: bold, color: CHARCOAL });
  y -= 14;
  page.drawText('Include the order number on packing slips and delivery paperwork.', {
    x: 48,
    y,
    size: 9,
    font,
    color: MUTED,
  });

  const form = pdf.getForm();
  page.drawText('Received by / signature', {
    x: 48,
    y: 118,
    size: 9,
    font: bold,
    color: CHARCOAL,
  });
  const signature = form.createTextField('receiverSignature');
  signature.addToPage(page, { x: 48, y: 88, width: 220, height: 24 });

  page.drawText('Delivery / warehouse notes', {
    x: 288,
    y: 118,
    size: 9,
    font: bold,
    color: CHARCOAL,
  });
  const notesField = form.createTextField('orderNotes');
  notesField.enableMultiline();
  notesField.addToPage(page, { x: 288, y: 64, width: 276, height: 48 });

  const totalPages = pages.length;
  pages.forEach((p, index) => drawHeader(p, index + 1, totalPages));

  return pdf.save();
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  BANK_ACCOUNT: 'Bank transfer',
  ONLINE_TRANSFER: 'Online transfer',
  'bank-account': 'Bank transfer',
  'online-transfer': 'Online transfer',
};

export function orderToPdfInput(
  order: {
    orderNumber: string;
    date: Date;
    status: string;
    vendorName: string;
    total: number;
    eta: string | null;
    trackingNumber: string | null;
    carrier: string | null;
    shippingName: string | null;
    shippingLine1: string | null;
    shippingCity: string | null;
    shippingState: string | null;
    shippingZip: string | null;
    paymentMethod: string | null;
    items: { name: string; quantity: number; price: number }[];
    payment?: {
      method: string;
      status: string;
      reference: string;
      transferReference: string | null;
    } | null;
    user?: { firstName: string; lastName: string; email: string } | null;
  },
): OrderPdfInput {
  const cityLine = [order.shippingCity, order.shippingState, order.shippingZip]
    .filter(Boolean)
    .join(', ');
  const shipTo = [order.shippingName, order.shippingLine1, cityLine].filter(
    (line): line is string => Boolean(line),
  );
  const method = order.payment?.method || order.paymentMethod;
  const methodLabel = method ? (PAYMENT_METHOD_LABEL[method] ?? method) : undefined;
  const paymentLabel = order.payment
    ? `${methodLabel ?? 'Payment'} · ${order.payment.status.toLowerCase().replace(/_/g, ' ')} · ${order.payment.reference}`
    : methodLabel;

  return {
    orderNumber: order.orderNumber,
    date: order.date.toISOString(),
    status: order.status.toLowerCase().replace(/_/g, '-'),
    vendorName: order.vendorName,
    total: order.total,
    eta: order.eta ?? undefined,
    trackingNumber: order.trackingNumber ?? undefined,
    carrier: order.carrier ?? undefined,
    customerName: order.user
      ? `${order.user.firstName} ${order.user.lastName}`.trim()
      : (order.shippingName ?? undefined),
    customerEmail: order.user?.email,
    shipTo: shipTo.length > 0 ? shipTo : undefined,
    paymentLabel,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
  };
}

export function pdfDownloadHeaders(filename: string) {
  const safe = filename.replace(/[^A-Za-z0-9._-]/g, '_');
  return {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${safe}"`,
    'Cache-Control': 'no-store',
  };
}
