const ENGLISH_HERO_TITLE = "Manage your budget easily";
const KOREAN_HERO_TITLE = "예산을 쉽게 관리해보세요";

function parseYearMonth(selectedMonth: string, fallbackDate: Date) {
  const [rawYear, rawMonth] = selectedMonth.split("-");
  const year = Number(rawYear);
  const month = Number(rawMonth);

  if (
    Number.isFinite(year) &&
    Number.isFinite(month) &&
    month >= 1 &&
    month <= 12
  ) {
    return { year, month };
  }

  return {
    year: fallbackDate.getFullYear(),
    month: fallbackDate.getMonth() + 1,
  };
}

export function getDashboardHeroTitle(locale: string): string {
  return locale === "ko" ? KOREAN_HERO_TITLE : ENGLISH_HERO_TITLE;
}

export function getDashboardMonthBadge(
  locale: string,
  selectedMonth: string,
  fallbackDate = new Date(),
): string {
  const { year, month } = parseYearMonth(selectedMonth, fallbackDate);

  if (locale === "ko") {
    return `Qoint | ${month}월 포커스`;
  }

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(new Date(year, month - 1, 1));

  return `Qoint | ${monthLabel} Focus`;
}
