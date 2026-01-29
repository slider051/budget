import Link from "next/link";

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

const actions: QuickAction[] = [
  {
    title: "예산 현황",
    description: "카테고리별 예산 사용 현황을 확인하세요",
    icon: "💰",
    href: "/budget",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "거래 추가",
    description: "새로운 수입 또는 지출을 기록하세요",
    icon: "➕",
    href: "/transactions/new",
    color: "bg-green-50 text-green-600",
  },
  {
    title: "고정지출 설정",
    description: "매달 반복되는 지출을 일괄 등록하세요",
    icon: "🔁",
    href: "/fixed-expenses/new",
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "거래 내역",
    description: "전체 거래 내역을 조회하고 관리하세요",
    icon: "📝",
    href: "/transactions",
    color: "bg-blue-50 text-blue-600",
  },
];

export default function QuickActionTiles() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md hover:border-indigo-300 transition-all group"
        >
          <div
            className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
          >
            {action.icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {action.title}
          </h3>
          <p className="text-sm text-gray-500">{action.description}</p>
        </Link>
      ))}
    </div>
  );
}
