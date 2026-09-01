import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type InvoicePdfInput = {
  invoiceNumber: string;
  vendorOrCustomer: string;
  type: 'receivable' | 'payable' | string;
  issueDate: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  status: string;
  orderNumber?: string;
  billTo?: {
    companyName: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    creditTerms?: string;
  };
};

const PURPLE = rgb(0.486, 0.227, 0.929);
const CHARCOAL = rgb(0.12, 0.12, 0.16);
const MUTED = rgb(0.4, 0.4, 0.45);
const LINE = rgb(0.88, 0.88, 0.9);

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

export async function buildInvoicePdf(input: InvoicePdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const { width, height } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({ x: 0, y: height - 96, width, height: 96, color: CHARCOAL });
  page.drawRectangle({ x: 0, y: height - 100, width, height: 4, color: PURPLE });

  page.drawText('GoOrder', {
    x: 48,
    y: height - 52,
    size: 22,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText('Corporate marketplace', {
    x: 48,
    y: height - 72,
    size: 10,
    font,
    color: rgb(0.75, 0.72, 0.85),
  });

  const kind = input.type === 'payable' ? 'VENDOR BILL' : 'TAX INVOICE';
  page.drawText(kind, {
    x: width - 48 - bold.widthOfTextAtSize(kind, 14),
    y: height - 48,
    size: 14,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText(input.invoiceNumber, {
    x: width - 48 - font.widthOfTextAtSize(input.invoiceNumber, 11),
    y: height - 68,
    size: 11,
    font,
    color: rgb(0.85, 0.82, 0.95),
  });

  let y = height - 140;
  page.drawText('BILL TO', { x: 48, y, size: 9, font: bold, color: PURPLE });
  y -= 18;
  const billName = input.billTo?.companyName || input.vendorOrCustomer;
  page.drawText(billName, { x: 48, y, size: 12, font: bold, color: CHARCOAL });
  const billLines = [
    input.billTo?.contactName,
    input.billTo?.email,
    input.billTo?.phone,
    input.billTo?.address,
  ].filter(Boolean) as string[];
  for (const line of billLines) {
    y -= 14;
    page.drawText(line, { x: 48, y, size: 10, font, color: MUTED });
  }

  const metaX = 360;
  let metaY = height - 140;
  const meta: [string, string][] = [
    ['Issue date', dateLabel(input.issueDate)],
    ['Due date', dateLabel(input.dueDate)],
    ['Order', input.orderNumber || '—'],
    ['Status', input.status.replace(/_/g, ' ')],
    ['Terms', input.billTo?.creditTerms || 'Net-30'],
  ];
  for (const [label, value] of meta) {
    page.drawText(label, { x: metaX, y: metaY, size: 9, font, color: MUTED });
    page.drawText(value, { x: metaX + 90, y: metaY, size: 10, font: bold, color: CHARCOAL });
    metaY -= 16;
  }

  y = Math.min(y, metaY) - 28;
  page.drawRectangle({ x: 48, y: y - 6, width: width - 96, height: 24, color: PURPLE });
  page.drawText('Description', { x: 60, y: y, size: 10, font: bold, color: rgb(1, 1, 1) });
  page.drawText('Amount', {
    x: width - 60 - bold.widthOfTextAtSize('Amount', 10),
    y,
    size: 10,
    font: bold,
    color: rgb(1, 1, 1),
  });

  y -= 32;
  const description =
    input.type === 'payable'
      ? `Vendor bill — ${input.vendorOrCustomer}`
      : `Marketplace order${input.orderNumber ? ` ${input.orderNumber}` : ''} — goods and services`;
  page.drawText(description, { x: 60, y, size: 10, font, color: CHARCOAL });
  const amountText = money(input.amount);
  page.drawText(amountText, {
    x: width - 60 - font.widthOfTextAtSize(amountText, 10),
    y,
    size: 10,
    font,
    color: CHARCOAL,
  });

  y -= 16;
  page.drawLine({
    start: { x: 48, y },
    end: { x: width - 48, y },
    thickness: 1,
    color: LINE,
  });

  const balance = Math.max(0, input.amount - input.amountPaid);
  const totals: [string, string][] = [
    ['Subtotal', money(input.amount)],
    ['Amount paid', money(input.amountPaid)],
    ['Balance due', money(balance)],
  ];
  y -= 28;
  for (const [label, value] of totals) {
    const isBalance = label === 'Balance due';
    page.drawText(label, {
      x: 360,
      y,
      size: isBalance ? 11 : 10,
      font: isBalance ? bold : font,
      color: isBalance ? PURPLE : MUTED,
    });
    page.drawText(value, {
      x: width - 60 - (isBalance ? bold : font).widthOfTextAtSize(value, isBalance ? 11 : 10),
      y,
      size: isBalance ? 11 : 10,
      font: isBalance ? bold : font,
      color: isBalance ? PURPLE : CHARCOAL,
    });
    y -= 18;
  }

  y -= 20;
  page.drawText('Payment instructions', { x: 48, y, size: 10, font: bold, color: CHARCOAL });
  y -= 16;
  const notes = [
    'Pay in Pakistani rupees (PKR) by bank transfer or JazzCash, Raast, or card.',
    'Include the invoice number in the payment reference.',
    'Questions: billing@goorder.com  ·  This is a computer-generated PDF form.',
  ];
  for (const line of notes) {
    page.drawText(line, { x: 48, y, size: 9, font, color: MUTED });
    y -= 13;
  }

  const form = pdf.getForm();
  page.drawText('Authorized signature', {
    x: 48,
    y: 118,
    size: 9,
    font: bold,
    color: CHARCOAL,
  });
  const signature = form.createTextField('authorizedSignature');
  signature.addToPage(page, { x: 48, y: 88, width: 220, height: 24 });

  page.drawText('Internal / customer notes', {
    x: 288,
    y: 118,
    size: 9,
    font: bold,
    color: CHARCOAL,
  });
  const notesField = form.createTextField('invoiceNotes');
  notesField.enableMultiline();
  notesField.addToPage(page, { x: 288, y: 64, width: 276, height: 48 });

  page.drawText('GoOrder, Inc.  ·  Saved as PDF form  ·  Page 1 of 1', {
    x: 48,
    y: 36,
    size: 8,
    font,
    color: MUTED,
  });

  return pdf.save();
}

const CREDIT_TERMS_LABEL: Record<string, string> = {
  COD: 'Cash on delivery',
  PREPAID: 'Prepaid / in advance',
  NET_15: 'Net-15',
  NET_30: 'Net-30',
  NET_45: 'Net-45',
  NET_60: 'Net-60',
  cod: 'Cash on delivery',
  prepaid: 'Prepaid / in advance',
  'net-15': 'Net-15',
  'net-30': 'Net-30',
  'net-45': 'Net-45',
  'net-60': 'Net-60',
};

export function invoiceToPdfInput(
  invoice: {
    invoiceNumber: string;
    vendorOrCustomer: string;
    type: string;
    issueDate: Date;
    dueDate: Date;
    amount: number;
    amountPaid: number;
    status: string;
    orderNumber: string | null;
  },
  client?: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    creditTerms?: string;
  } | null,
): InvoicePdfInput {
  return {
    invoiceNumber: invoice.invoiceNumber,
    vendorOrCustomer: invoice.vendorOrCustomer,
    type: invoice.type === 'PAYABLE' || invoice.type === 'payable' ? 'payable' : 'receivable',
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    amount: invoice.amount,
    amountPaid: invoice.amountPaid,
    status: invoice.status.toLowerCase(),
    orderNumber: invoice.orderNumber ?? undefined,
    billTo: client
      ? {
          companyName: client.companyName,
          contactName: client.contactName,
          email: client.email,
          phone: client.phone,
          address: client.address,
          creditTerms: client.creditTerms
            ? (CREDIT_TERMS_LABEL[client.creditTerms] ?? client.creditTerms)
            : undefined,
        }
      : undefined,
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
