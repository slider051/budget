import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-gray-900">
            Budget Tracker
          </h1>

          <nav className="flex gap-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              대시보드
            </Link>
            <Link
              href="/transactions"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              거래내역
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
