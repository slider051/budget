export type SubscriptionCategory =
  | "ott"
  | "ai"
  | "shopping"
  | "music"
  | "reading"
  | "other";

export type SubscriptionCurrency = "KRW" | "USD" | "JPY";

export type BillingCycle = "monthly" | "custom" | "yearly";

export interface Subscription {
  readonly id: string;
  readonly serviceKey: string;
  readonly serviceName: string;
  readonly category: SubscriptionCategory;
  readonly logoUrl: string;
  readonly defaultPrice: number;
  readonly actualPrice: number;
  readonly participantCount: number;
  readonly currency: SubscriptionCurrency;
  readonly billingCycle: BillingCycle;
  readonly customCycleMonths: number | null;
  readonly billingStartDate: string; // YYYY-MM-DD
  readonly endDate: string | null; // YYYY-MM-DD
  readonly accountName: string;
  readonly memo: string;
  readonly createdAt: string; // ISO timestamp
  readonly updatedAt: string; // ISO timestamp

  // Legacy compatibility fields for existing saved data
  readonly basePrice?: number;
  readonly billingAnchorDate?: string;
  readonly expectedEndDate?: string | null;
  readonly customCycleEndDate?: string | null;
  readonly customCycleDays?: number | null;
  readonly autoRenew?: boolean;
  readonly accounts?: readonly {
    readonly id: string;
    readonly alias: string;
    readonly accountLabel: string;
    readonly discountType: "none" | "percent30" | "percent50" | "free";
    readonly customPrice: number | null;
    readonly memo: string;
  }[];
}
