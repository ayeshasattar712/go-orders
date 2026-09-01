import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import { pdfDownloadHeaders } from '@/lib/order-pdf';

export type ChallanPdfItem = {
  name: string;
  quantity: number;
};

export type ChallanPdfInput = {
  challanNumber: string;
  orderNumber: string;
  issuedAt: string;
  customerName: string;
  origin: string;
  destination: string;
  driver: string;
  vehicle: string;
  trackingNumber?: string;
  eta?: string;
  status: string;
  items: ChallanPdfItem[];
};

const PURPLE = rgb(0.486, 0.227, 0.929);
const CHARCOAL = rgb(0.12, 0.12, 0.16);
const MUTED = rgb(0.4, 0.4, 0.45);
const WHITE = rgb(1, 1, 1);

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

export async function buildChallanPdf(input: ChallanPdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([612, 792]);
  const { width, height } = page.getSize();

  page.drawRectangle({ x: 0, y: height - 96, width, height: 96, color: CHARCOAL });
  page.drawRectangle({ x: 0, y: height - 100, width, height: 4, color: PURPLE });
  page.drawText('GoOrder', { x: 48, y: height - 52, size: 22, font: bold, color: WHITE });
  page.drawText('Delivery challan (PDF form)', {
    x: 48,
    y: height - 72,
    size: 10,
    font,
    color: rgb(0.75, 0.72, 0.85),
  });
  page.drawText('DELIVERY CHALLAN', {
    x: width - 48 - bold.widthOfTextAtSize('DELIVERY CHALLAN', 14),
    y: height - 48,
    size: 14,
    font: bold,
    color: WHITE,
  });
  page.drawText(input.challanNumber, {
    x: width - 48 - font.widthOfTextAtSize(input.challanNumber, 11),
    y: height - 68,
    size: 11,
    font,
    color: rgb(0.85, 0.82, 0.95),
  });

  let y = height - 140;
  page.drawText('CONSIGNEE', { x: 48, y, size: 9, font: bold, color: PURPLE });
  y -= 16;
  page.drawText(truncate(bold, input.customerName, 12, 280), {
    x: 48,
    y,
    size: 12,
    font: bold,
    color: CHARCOAL,
  });
  y -= 16;
  page.drawText('Ship to', { x: 48, y, size: 9, font, color: MUTED });
  y -= 14;
  page.drawText(truncate(font, input.destination, 10, 280), {
    x: 48,
    y,
    size: 10,
    font,
    color: CHARCOAL,
  });

  const metaX = 360;
  let metaY = height - 140;
  const meta: [string, string][] = [
    ['Order', input.orderNumber],
    ['Issued', dateLabel(input.issuedAt)],
    ['Status', statusLabel(input.status)],
    ['Origin', input.origin],
    ['Driver', input.driver],
    ['Vehicle', input.vehicle],
    ['Tracking', input.trackingNumber || '—'],
    ['ETA', input.eta || '—'],
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
    metaY -= 15;
  }

  y = Math.min(y, metaY) - 24;
  page.drawRectangle({ x: 48, y: y - 6, width: width - 96, height: 24, color: PURPLE });
  page.drawText('Description of goods', { x: 60, y, size: 10, font: bold, color: WHITE });
  page.drawText('Qty', {
    x: width - 60 - bold.widthOfTextAtSize('Qty', 10),
    y,
    size: 10,
    font: bold,
    color: WHITE,
  });
  y -= 28;

  const items = input.items.length > 0 ? input.items : [{ name: 'Marketplace goods as per order', quantity: 1 }];
  for (const item of items.slice(0, 16)) {
    page.drawText(truncate(font, item.name, 10, 420), { x: 60, y, size: 10, font, color: CHARCOAL });
    const qty = String(item.quantity);
    page.drawText(qty, {
      x: width - 60 - font.widthOfTextAtSize(qty, 10),
      y,
      size: 10,
      font,
      color: CHARCOAL,
    });
    y -= 16;
  }
  if (input.items.length > 16) {
    page.drawText(`Plus ${input.items.length - 16} more line(s) as per order.`, {
      x: 60,
      y,
      size: 9,
      font,
      color: MUTED,
    });
    y -= 16;
  }

  y -= 8;
  page.drawText(
    'This challan confirms dispatch of goods. Retain for warehouse and delivery records.',
    { x: 48, y, size: 9, font, color: MUTED },
  );

  const form = pdf.getForm();
  page.drawText('Received by (name)', { x: 48, y: 150, size: 9, font: bold, color: CHARCOAL });
  form.createTextField('receivedBy').addToPage(page, { x: 48, y: 122, width: 220, height: 22 });

  page.drawText('Receiver signature', { x: 48, y: 104, size: 9, font: bold, color: CHARCOAL });
  form.createTextField('receiverSignature').addToPage(page, { x: 48, y: 76, width: 220, height: 22 });

  page.drawText('Goods condition / remarks', { x: 288, y: 150, size: 9, font: bold, color: CHARCOAL });
  const remarks = form.createTextField('challanRemarks');
  remarks.enableMultiline();
  remarks.addToPage(page, { x: 288, y: 76, width: 276, height: 68 });

  page.drawText('GoOrder, Inc.  ·  Saved as PDF form  ·  Page 1 of 1', {
    x: 48,
    y: 36,
    size: 8,
    font,
    color: MUTED,
  });

  return pdf.save();
}

export function challanToPdfInput(
  order: {
    orderNumber: string;
    date: Date;
    shippingName: string | null;
    shippingLine1: string | null;
    shippingCity: string | null;
    shippingState: string | null;
    shippingZip: string | null;
    trackingNumber: string | null;
    eta: string | null;
    items: { name: string; quantity: number }[];
    user?: { firstName: string; lastName: string } | null;
  },
  job?: {
    id: string;
    customer: string;
    origin: string;
    destination: string;
    driver: string;
    vehicle: string;
    trackingNumber: string | null;
    eta: string;
    status: string;
    createdAt: Date;
  } | null,
): ChallanPdfInput {
  const cityLine = [order.shippingCity, order.shippingState, order.shippingZip]
    .filter(Boolean)
    .join(', ');
  const shipTo = [order.shippingName, order.shippingLine1, cityLine].filter(Boolean).join(', ');
  const customerName =
    job?.customer ||
    (order.user ? `${order.user.firstName} ${order.user.lastName}`.trim() : '') ||
    order.shippingName ||
    'Customer';

  return {
    challanNumber: `CHL-${order.orderNumber}`,
    orderNumber: order.orderNumber,
    issuedAt: (job?.createdAt ?? order.date).toISOString(),
    customerName,
    origin: job?.origin || 'GoOrder warehouse',
    destination: job?.destination || shipTo || 'Address on file',
    driver: job?.driver || 'To be assigned',
    vehicle: job?.vehicle || '—',
    trackingNumber: job?.trackingNumber || order.trackingNumber || undefined,
    eta: job?.eta || order.eta || undefined,
    status: (job?.status || 'processing').toLowerCase().replace(/_/g, '-'),
    items: order.items.map((item) => ({ name: item.name, quantity: item.quantity })),
  };
}

export { pdfDownloadHeaders };
