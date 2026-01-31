const ALERTS_STORAGE_KEY = "budget_tracker_alerts";

interface SeenAlerts {
  readonly [month: string]: {
    readonly [category: string]: boolean;
  };
}

export function getSeenAlerts(): SeenAlerts {
  if (typeof window === "undefined") return {};

  try {
    const data = localStorage.getItem(ALERTS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function markAlertAsSeen(month: string, category: string): void {
  if (typeof window === "undefined") return;

  try {
    const seen = getSeenAlerts();
    const updated = {
      ...seen,
      [month]: {
        ...(seen[month] || {}),
        [category]: true,
      },
    };
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to mark alert as seen:", error);
  }
}

export function hasSeenAlert(month: string, category: string): boolean {
  const seen = getSeenAlerts();
  return seen[month]?.[category] === true;
}

export function clearAllAlerts(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(ALERTS_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear alerts:", error);
  }
}

export function shouldShowBudgetAlert(
  spent: number,
  budget: number,
  month: string,
  category: string,
): boolean {
  if (budget === 0) return false;

  const usage = (spent / budget) * 100;
  if (usage < 90) return false;

  return !hasSeenAlert(month, category);
}
