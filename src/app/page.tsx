import QuickActionTiles from "@/components/budget/QuickActionTiles";
import PresetBanner from "@/components/dashboard/PresetBanner";



export default function Home() {
  return (

    
    <div>
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          예산을 쉽고 스마트하게 관리하세요
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Qoint와 함께 수입과 지출을 추적하고, 카테고리별 예산을 설정하며, 재정
          목표를 달성해보세요.
        </p>
      </div>

      <PresetBanner />

      {/* Quick Action Tiles */}
      <QuickActionTiles />

      {/* Value Proposition */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            실시간 분석
          </h3>
          <p className="text-sm text-gray-600">
            카테고리별 지출 현황을 한눈에 파악하고 예산 대비 사용률을 실시간으로
            확인하세요.
          </p>
        </div>
      

        <div className="text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            목표 설정
          </h3>
          <p className="text-sm text-gray-600">
            월별 예산 목표를 설정하고 진행 상황을 추적하여 재정 계획을
            달성하세요.
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚡</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            빠른 입력
          </h3>
          <p className="text-sm text-gray-600">
            간편한 인터페이스로 거래를 빠르게 기록하고 고정 지출을 일괄
            등록하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
