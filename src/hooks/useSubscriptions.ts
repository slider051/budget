"use client";

import { useSyncExternalStore } from "react";
import {
  deleteSubscription,
  subscriptionStore,
  upsertSubscription,
} from "@/lib/subscriptions/subscriptionRepository";
import type { Subscription } from "@/types/subscription";

export function useSubscriptions() {
  const subscriptions = useSyncExternalStore(
    subscriptionStore.subscribe,
    subscriptionStore.getSnapshot,
    subscriptionStore.getServerSnapshot,
  );

  return {
    subscriptions,
    upsertSubscription: (subscription: Subscription) => {
      upsertSubscription(subscription);
    },
    deleteSubscription: (id: string) => {
      deleteSubscription(id);
    },
  };
}
