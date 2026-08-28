import { isResponse, requireStaffSession } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';
import { serializeChatThread } from '@/lib/chat/serialize';

export async function GET(request: Request) {
  const session = await requireStaffSession(request);
  if (isResponse(session)) return session;

  const threads = await prisma.chatThread.findMany({
    include: { client: true },
    orderBy: { lastMessageAt: 'desc' },
  });

  return successResponse({ threads: threads.map(serializeChatThread) });
}
