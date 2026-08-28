import { clearCustomerSessionCookie, getCustomerSession } from '@/lib/auth/customer-auth';
import { successResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function POST() {
  const session = await getCustomerSession();
  if (session) {
    logger.info('Customer logged out', { userId: session.sub });
  }

  await clearCustomerSessionCookie();
  return successResponse({ message: 'Signed out successfully' });
}
