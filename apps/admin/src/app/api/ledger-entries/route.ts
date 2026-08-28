import { PERMISSIONS } from '@/constants/roles';
import { isResponse, requirePermission, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { serializeLedgerEntry } from '@/lib/enterprise-mapper';
import { errorResponse, successResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.LEDGER_READ);
  if (allowed !== true) return allowed;

  const entries = await prisma.ledgerEntry.findMany({ orderBy: { date: 'desc' } });

  return successResponse({ entries: entries.map(serializeLedgerEntry) });
}

export async function POST(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const allowed = requirePermission(session, PERMISSIONS.INVOICES_WRITE);
  if (allowed !== true) return allowed;

  const body = (await request.json()) as {
    date?: string;
    account?: string;
    description?: string;
    debit?: number;
    credit?: number;
  };

  if (!body.account?.trim() || !body.description?.trim()) {
    return errorResponse('Account and description are required', {
      status: 422,
      code: 'VALIDATION_ERROR',
    });
  }

  const debit = Number(body.debit ?? 0);
  const credit = Number(body.credit ?? 0);
  if (debit < 0 || credit < 0 || (debit === 0 && credit === 0)) {
    return errorResponse('Enter a debit or credit amount', {
      status: 422,
      code: 'VALIDATION_ERROR',
    });
  }

  const entry = await prisma.ledgerEntry.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      account: body.account.trim(),
      description: body.description.trim(),
      debit,
      credit,
    },
  });

  return successResponse({ entry: serializeLedgerEntry(entry) }, { status: 201 });
}
