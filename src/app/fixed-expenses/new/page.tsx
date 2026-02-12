import PageHeader from '@/components/ui/PageHeader';
import FixedExpenseForm from '@/components/budget/FixedExpenseForm';
import {
  DASHBOARD_PRESETS,
  DASHBOARD_PRESET_ORDER,
} from "@/lib/presets/dashboardPresets";

export default function NewFixedExpensePage() {
  return (
    <div>
      <PageHeader
        title="고정지출 일괄 생성"
        description="매달 반복되는 지출을 한 번에 등록하세요"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="max-w-2xl">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  고정지출이란?
                </h4>
                <p className="text-sm text-blue-700">
                  매달 정기적으로 발생하는 지출(예: 구독료, 보험료, 통신비)을 선택한 기간 동안 자동으로 생성합니다.
                </p>
              </div>
            </div>
          </div>

          <FixedExpenseForm />

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              💡 사용 팁
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 연도와 월 범위를 선택하여 원하는 기간만큼 거래를 생성할 수 있습니다</li>
              <li>• 매월 날짜는 1~31 사이로 지정하세요</li>
              <li>• 생성된 거래는 거래내역 페이지에서 개별 수정/삭제가 가능합니다</li>
            </ul>
          </div>
        </div>

        <aside>
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
            <h4 className="text-sm font-semibold text-violet-900 mb-2">
              프리셋 샘플 데이터 수정 가이드
            </h4>
            <p className="text-xs text-violet-800 mb-3">
              대시보드 직업 프리셋의 원본 샘플 데이터는 아래 파일에서 한 번에 수정할 수 있습니다.
            </p>
            <code className="block rounded-lg bg-white px-2 py-1 text-xs text-violet-900 mb-4">
              src/lib/presets/dashboardPresets.ts
            </code>

            <div className="space-y-3">
              {DASHBOARD_PRESET_ORDER.map((presetId) => {
                const preset = DASHBOARD_PRESETS[presetId];
                return (
                  <div key={preset.id} className="rounded-lg bg-white p-3 border border-violet-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {preset.label}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      수입: {preset.income.amount.toLocaleString()}원 ({preset.income.description})
                    </p>
                    <p className="text-xs font-medium text-gray-700 mt-2">예산 샘플</p>
                    <div className="mt-1 space-y-1">
                      {Object.entries(preset.budgets).map(([category, amount]) => (
                        <p key={category} className="text-xs text-gray-600">
                          {category}: {amount.toLocaleString()}원
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        </div>
      </div>

  );
}
