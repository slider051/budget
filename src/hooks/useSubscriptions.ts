"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteSubscription,
  listSubscriptions,
  upsertSubscription,
} from "@/lib/subscriptions/subscriptionRepository";
import type { Subscription } from "@/types/subscription";

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<readonly Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listSubscriptions();
      setSubscriptions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "구독 목록을 불러오지 못했습니다.";
      setError(message);
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleUpsertSubscription = useCallback(async (subscription: Subscription) => {
    setError(null);
    const data = await upsertSubscription(subscription);
    setSubscriptions(data);
  }, []);

  const handleDeleteSubscription = useCallback(async (id: string) => {
    setError(null);
    const data = await deleteSubscription(id);
    setSubscriptions(data);
  }, []);

  return {
    subscriptions,
    isLoading,
    error,
    refresh,
    upsertSubscription: handleUpsertSubscription,
    deleteSubscription: handleDeleteSubscription,
  };
}