export const INCOME_CATEGORIES = ["급여", "부업", "투자", "기타수입"] as const;

export const EXPENSE_CATEGORIES = [
  "식비",
  "교통비",
  "주거비",
  "통신비",
  "쇼핑",
  "의료",
  "교육",
  "문화생활",
  "기타지출",
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  식비: "🍽️",
  교통비: "🚗",
  주거비: "🏠",
  통신비: "📱",
  쇼핑: "🛒",
  의료: "⚕️",
  교육: "📚",
  문화생활: "🎭",
  기타지출: "💸",
  급여: "💰",
  부업: "💼",
  투자: "📈",
  기타수입: "💵",
};

export const CATEGORY_EN_NAMES: Record<string, string> = {
  식비: "Food & Groceries",
  교통비: "Transportation",
  주거비: "Housing",
  통신비: "Communication",
  쇼핑: "Shopping",
  의료: "Health & Beauty",
  교육: "Education",
  문화생활: "Entertainment",
  기타지출: "Other Expenses",
  급여: "Salary",
  부업: "Side Income",
  투자: "Investments",
  기타수입: "Other Income",
};

export const DEFAULT_CURRENCY = "KRW";
