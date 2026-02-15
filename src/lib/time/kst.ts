const KST_TIME_ZONE = "Asia/Seoul";

const kstYearMonthFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: KST_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
});

function isValidDate(value: Date): boolean {
  return Number.isFinite(value.getTime());
}

export function getKstYearMonth(referenceDate: Date = new Date()): string {
  if (!isValidDate(referenceDate)) {
    throw new Error("Invalid date");
  }

  const parts = kstYearMonthFormatter.formatToParts(referenceDate);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  if (!year || !month) {
    throw new Error("Failed to format KST year-month");
  }

  return `${year}-${month}`;
}
