interface SeenAlerts {
  readonly [month: string]: {
    readonly [category: string]: boolean;
  };
}

let seenAlerts: SeenAlerts = {};

export function getSeenAlerts(): SeenAlerts {
  return seenAlerts;
}

export function markAlertAsSeen(month: string, category: string): void {
  const current = seenAlerts[month] ?? {};
  seenAlerts = {
    ...seenAlerts,
    [month]: {
      ...current,
      [category]: true,
    },
  };
}

export function hasSeenAlert(month: string, category: string): boolean {
  const seen = getSeenAlerts();
  return seen[month]?.[category] === true;
}

export function clearAllAlerts(): void {
  seenAlerts = {};
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
