'use client';

import { useCallback } from 'react';
import { useCustomerAuthStore } from '@/store/customer-auth-store';
import { useAuthPromptStore } from '@/store/auth-prompt-store';

/**
 * Gates an action behind authentication. Guests attempting a restricted
 * action (add to cart, wishlist, request quotation, live chat, etc.) see the
 * login/signup modal instead of the action silently succeeding.
 */
export function useGuardedAction() {
  const user = useCustomerAuthStore((state) => state.user);
  const openPrompt = useAuthPromptStore((state) => state.open);

  return useCallback(
    (action: () => void, reason?: string) => {
      if (!user) {
        openPrompt(reason);
        return false;
      }
      action();
      return true;
    },
    [user, openPrompt],
  );
}

export function useIsAuthenticated() {
  return useCustomerAuthStore((state) => Boolean(state.user));
}
