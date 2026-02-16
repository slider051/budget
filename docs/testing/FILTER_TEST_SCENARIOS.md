# Transaction Filter Test Scenarios

거래내역 검색/필터 기능의 정상 동작 검증 시나리오

## 테스트 목적

- URL 쿼리 기반 필터 상태 유지 확인
- 복합 필터 조합 정상 동작 확인
- 필터 결과 집계 정확도 확인
- 성능 및 useMemo 캐싱 확인

---

## 준비 사항

1. 개발 서버 실행: `npm run dev`
2. `/transactions/new`에서 테스트 데이터 생성:
   - 2026-01-15: 수입 급여 3,000,000원 "월급"
   - 2026-01-20: 지출 식비 50,000원 "마트 장보기"
   - 2026-01-22: 지출 교통비 30,000원 "지하철 충전"
   - 2026-02-05: 지출 식비 80,000원 "외식"
   - 2026-02-10: 수입 부업 500,000원 "프리랜서"
   - 2026-02-15: 지출 쇼핑 120,000원 "옷 구매"

---

## 시나리오 1: 기간 + 카테고리 필터

### 1단계: 1월 식비 거래만 조회

1. `/transactions` 페이지 접속
2. 날짜 필터:
   - 시작일: `2026-01-01`
   - 종료일: `2026-01-31`
3. 카테고리 칩: `식비` 클릭
4. URL 확인: `/transactions?dateFrom=2026-01-01&dateTo=2026-01-31&categories=식비`

**예상 결과:**
- 검색 결과: **1건**
- 총 수입: ₩0
- 총 지출: ₩50,000
- 표시: "2026-01-20, 식비, 50,000원, 마트 장보기"

### 2단계: 카테고리 추가 (식비 + 교통비)

1. 카테고리 칩: `교통비` 클릭
2. URL 확인: `/transactions?dateFrom=2026-01-01&dateTo=2026-01-31&categories=식비,교통비`

**예상 결과:**
- 검색 결과: **2건**
- 총 지출: ₩80,000 (50,000 + 30,000)
- 정렬: 최신순 (교통비 1/22 → 식비 1/20)

---

## 시나리오 2: 기간 + 검색어 + 타입

### 1단계: 2월 수입만 조회

1. Reset 버튼 클릭 (필터 초기화)
2. 날짜 필터:
   - 시작일: `2026-02-01`
   - 종료일: `2026-02-28`
3. 타입: `수입` 선택
4. URL 확인: `/transactions?dateFrom=2026-02-01&dateTo=2026-02-28&type=income`

**예상 결과:**
- 검색 결과: **1건**
- 총 수입: ₩500,000
- 총 지출: ₩0
- 표시: "부업, 500,000원"

### 2단계: 검색어 추가 ("프리")

1. 검색 입력: `프리`
2. URL 확인: `/transactions?q=프리&dateFrom=2026-02-01&dateTo=2026-02-28&type=income`

**예상 결과:**
- 검색 결과: **1건** (메모에 "프리랜서" 포함)
- 총 수입: ₩500,000

### 3단계: 타입 변경 (수입 → 전체)

1. 타입: `전체` 선택
2. URL 확인: `/transactions?q=프리&dateFrom=2026-02-01&dateTo=2026-02-28&type=all`

**예상 결과:**
- 검색 결과: **1건** (검색어 "프리"는 수입 거래만 해당)

---

## 시나리오 3: 금액 범위 + 정렬

### 1단계: 5만원~10만원 거래

1. Reset 버튼 클릭
2. 금액 필터:
   - 최소 금액: `50000`
   - 최대 금액: `100000`
3. URL 확인: `/transactions?minAmount=50000&maxAmount=100000`

**예상 결과:**
- 검색 결과: **2건**
  - 2026-02-05: 식비 80,000원
  - 2026-01-20: 식비 50,000원
- 총 지출: ₩130,000

### 2단계: 정렬 변경 (금액 높은순)

1. 정렬: `금액 높은순` 선택
2. URL 확인: `/transactions?minAmount=50000&maxAmount=100000&sort=amount-desc`

**예상 결과:**
- 순서 변경:
  1. 2026-02-05: 80,000원 (먼저)
  2. 2026-01-20: 50,000원

### 3단계: 정렬 변경 (금액 낮은순)

1. 정렬: `금액 낮은순` 선택

**예상 결과:**
- 순서 역전:
  1. 2026-01-20: 50,000원 (먼저)
  2. 2026-02-05: 80,000원

---

## 시나리오 4: 복합 필터 (모든 조건)

### 전체 조건 조합

1. Reset 버튼 클릭
2. 검색어: `외`
3. 타입: `지출`
4. 카테고리: `식비`, `쇼핑` 선택
5. 날짜: `2026-02-01` ~ `2026-02-28`
6. 금액: 최소 `70000`
7. 정렬: `최신순`
8. URL 확인: `/transactions?q=외&type=expense&categories=식비,쇼핑&dateFrom=2026-02-01&dateTo=2026-02-28&minAmount=70000&sort=latest`

**예상 결과:**
- 검색 결과: **1건**
- 2026-02-05: 식비 80,000원 "외식" (검색어 "외" 포함, 2월, 지출, 식비, 70,000원 이상)
- 총 지출: ₩80,000

---

## 시나리오 5: URL 직접 입력 (SSR/CSR 일치)

### URL 파라미터로 접근

1. 브라우저 주소창에 직접 입력:
   ```
   http://localhost:3000/transactions?type=income&minAmount=1000000
   ```
2. 페이지 새로고침 (F5)

**예상 결과:**
- 필터 UI 상태가 URL과 일치 (타입=수입, 최소금액=1000000)
- 검색 결과: **1건** (급여 3,000,000원)
- 새로고침 후에도 필터 유지

---

## 시나리오 6: 빈 결과 처리

### 조건에 맞는 거래 없음

1. Reset 버튼 클릭
2. 검색어: `존재하지않는검색어`
3. URL 확인: `/transactions?q=존재하지않는검색어`

**예상 결과:**
- 검색 결과: **0건**
- 총 수입: ₩0
- 총 지출: ₩0
- 거래 목록: "거래 내역이 없습니다." 메시지

---

## 성능 체크리스트

### useMemo 캐싱 확인

- [ ] 필터 변경 시에만 재계산 (React DevTools Profiler)
- [ ] 동일한 필터로 재렌더 시 계산 건너뜀
- [ ] 결과 집계(count, totalIncome, totalExpense)가 즉시 업데이트

### URL 쿼리 상태 관리

- [ ] 필터 변경 시 URL 자동 업데이트
- [ ] 브라우저 뒤로가기/앞으로가기 정상 동작
- [ ] URL 복사 → 새 탭 → 동일한 필터 상태 유지

### 불변성 보장

- [ ] `applyTransactionFilters`가 원본 배열 변경 안 함
- [ ] 필터 결과가 새 배열 참조 (원본과 분리)

---

## 자동화 체크리스트

- [ ] 기간 필터 (from/to) 정상 동작
- [ ] 카테고리 멀티 선택 (칩 UI) 정상 동작
- [ ] 검색어 필터 (description, category 검색)
- [ ] 타입 필터 (all/income/expense)
- [ ] 금액 범위 필터 (min/max)
- [ ] 정렬 (최신/오래된/금액↑/금액↓)
- [ ] Reset 버튼으로 모든 필터 초기화
- [ ] 결과 집계 정확도 (count, sum)
- [ ] URL 쿼리 파싱 안전성 (잘못된 값 fallback)
- [ ] Suspense fallback 표시 (useSearchParams)

---

## 성공 기준

1. **필터 정확도**: 모든 조건 조합이 정확한 결과 반환
2. **URL 상태 유지**: 새로고침/복사 시에도 필터 유지
3. **성능**: 1000개 거래에서도 즉시 필터링 (<100ms)
4. **UI 일관성**: 필터 변경 시 UI 즉시 반영
5. **빌드 통과**: `npm run build` 및 `npm run lint` 0 에러

---

## 알려진 제한사항 및 정책

### 입력 제한
- 검색어는 대소문자 구분 안 함 (toLowerCase)
- 날짜는 YYYY-MM-DD 형식만 지원
- 카테고리는 정확히 일치해야 함 (부분 검색 X)
- URL 쿼리 길이 제한 (~2000자, 카테고리 많이 선택 시 주의)

### 범위 검증 정책 (A안: 조용히 처리)
**날짜 범위 (dateFrom/dateTo):**
- `dateFrom > dateTo`인 경우: 두 조건 모두 적용 (교집합 없음 → 빈 결과)
- 에러/경고 없이 조용히 처리
- 유효한 날짜가 아닌 경우: 무시

**금액 범위 (minAmount/maxAmount):**
- `minAmount > maxAmount`인 경우: 필터 적용 단계에서만 자동 swap (transactionFilters.ts)
- 입력 UI는 로컬 string state로 제어, onBlur 시점에만 URL 반영
- 에러/경고 없이 조용히 처리
- 숫자가 아닌 경우: 무시

**IME Composition 정책 (한글 입력):**
- 조합 중(`isComposing=true`)에는 URL 업데이트 안 함
- 조합 종료(`onCompositionEnd`) 시점에만 최종 문자열로 URL 동기화
- 로컬 input state는 조합 중에도 즉시 반영 (시각적 일관성)
- URL→로컬 동기화는 외부 네비게이션으로 URL이 바뀐 경우만 수행 (레이스 방지)

---

## 구현 상세: 핵심 해결 내용

### 문제 1: IME 조합 중 글자 사라짐/중복

**증상:**
- "지하철" 입력 시 '하'가 사라지거나 "지하하철"처럼 중복
- 한글 입력 중 글자가 분해되거나 이전 값으로 되돌아감

**원인:**
- URL 업데이트(`updateFilter → router.push`) → `searchParams` 변경
- `useEffect`가 새 URL의 `q` 값을 받아서 `setLocalSearchQuery` 호출
- 방금 입력한 글자를 옛 값으로 덮어씀 (레이스 조건)
- 한글은 음절 단위로 `compositionend`가 자주 발생 → URL replace가 잦음

**해결 (TransactionFilterBar.tsx):**
```typescript
const lastPushedQRef = useRef(filters.q);  // 마지막으로 내가 푸시한 q 값 기록

useEffect(() => {
  if (isComposingRef.current) return;           // 조합 중이면 skip
  if (filters.q === lastPushedQRef.current) return;  // 내가 방금 바꾼 URL이면 skip
  setLocalSearchQuery(filters.q);               // 외부에서 URL 바뀐 경우만 동기화
}, [filters.q]);

const handleSearchChange = (value: string) => {
  setLocalSearchQuery(value);
  if (!isComposingRef.current) {
    lastPushedQRef.current = value;  // URL 업데이트 직전 기록
    updateFilter({ q: value });
  }
};
```

**핵심:**
- `lastPushedQRef`: 내가 방금 푸시한 값 기록
- useEffect 가드: 조합 중(`isComposing`) 또는 내가 만든 변화(`urlQ === lastPushed`)면 skip
- 외부 네비게이션(뒤로가기, URL 직접 입력)으로 URL이 바뀐 경우만 로컬 동기화

---

### 문제 2: 금액 입력 중 값이 튐

**증상:**
- max에 "30000" 입력 중 "3"만 입력했을 때 min(20000) > max(3) 성립
- swap 정책이 즉시 발동 → min/max 값이 서로 뒤집힘
- 사용자는 max에 계속 입력하는데, 실제로는 min이 바뀌거나 앞에 붙음
- URL도 `maxAmount=20000030303` 같은 이상한 문자열로 망가짐

**원인:**
- URL 파싱 단계(page.tsx)에서 min > max일 때 즉시 swap 수행
- 입력 중인 중간 상태(`max="3"`)에서도 swap 발생
- swap된 값이 다시 URL → filters → input value로 피드백

**해결 (3단계):**

1. **입력 UI를 로컬 string state로 분리 (TransactionFilterBar.tsx):**
```typescript
const [localMinAmountStr, setLocalMinAmountStr] = useState(filters.minAmount);
const [localMaxAmountStr, setLocalMaxAmountStr] = useState(filters.maxAmount);

<Input
  value={localMinAmountStr}
  onChange={(e) => setLocalMinAmountStr(e.target.value)}  // 로컬만 갱신
  onBlur={(e) => {
    const value = e.target.value.trim();
    updateFilter({ minAmount: value });  // blur 시점에만 URL 반영
  }}
/>
```

2. **URL 파싱에서 swap 제거 (page.tsx):**
```typescript
// 이전: minNum > maxNum이면 swap
// 현재: 그대로 전달
const minAmount = searchParams.get("minAmount") || "";
const maxAmount = searchParams.get("maxAmount") || "";
```

3. **swap은 필터 함수에서만 수행 (transactionFilters.ts):**
```typescript
let minAmount = filters.minAmount ? parseFloat(filters.minAmount) : null;
let maxAmount = filters.maxAmount ? parseFloat(filters.maxAmount) : null;

// Swap 정책: 필터 적용 단계에서만 조용히 swap (입력 UI는 건드리지 않음)
if (minAmount !== null && maxAmount !== null && !isNaN(minAmount) && !isNaN(maxAmount) && minAmount > maxAmount) {
  [minAmount, maxAmount] = [maxAmount, minAmount];
}
```

**핵심:**
- 입력 중에는 절대 swap하지 않음
- onChange는 로컬 string만 갱신 (숫자 파싱/swap/정규화 금지)
- URL 반영은 onBlur(확정) 시점에만
- swap은 계산 단계(`applyTransactionFilters`)에서만 조용히 처리

---

## 시나리오 7: IME Composition (한글 입력)

### 회귀 테스트 1: 한글 입력 중복/사라짐 방지

1. `/transactions` 페이지 접속
2. 검색 input 클릭
3. 한글 입력 테스트:
   - "지하철" 입력 (ㅈ → 지 → 지ㅎ → 지하 → ... → 지하철)
   - "버스" 입력 (ㅂ → 버 → 벗 → 버스)
   - "가나다" 입력
   - 초성만 입력 후 삭제 (ㄱ → 삭제)
   - 빠르게 "외식" 입력 후 즉시 삭제

**예상 결과:**
- 글자가 사라지지 않음 (예: "지하철"이 "지철"이 되지 않음)
- 중복 문자 없음 (예: "버버스스" X)
- 조합 중에는 URL 업데이트 안 됨
- 조합 완료 시점에만 URL에 `?q=지하철` 반영
- input 값과 URL 쿼리가 항상 동기화

### 회귀 테스트 2: 금액 입력 안정성

1. `/transactions` 페이지 접속
2. 최소 금액 input 클릭
3. 천천히 "20000" 입력
4. 최대 금액 input 클릭
5. 천천히 "30000" 입력
6. 빠르게 최소/최대 금액 교차 입력 ("50000" → "10000")

**예상 결과:**
- 입력 중 값이 튀지 않음
- min 입력 중에 max 값이 바뀌지 않음
- max 입력 중에 min 값이 바뀌지 않음
- URL에 `maxAmount=20000030303` 같은 누적 문자열 없음
- blur 시점에만 URL에 반영
- min(50000) > max(10000)여도 필터 결과는 정상 (내부에서 swap)

### 영문/숫자 입력 정상 동작

1. 검색 input에 영문 입력: "food"
2. URL 확인: `/transactions?q=food`

**예상 결과:**
- IME 없는 입력은 즉시 URL 반영 (기존 동작 유지)

---

## Budget Alert Test (추가)

### 90% 초과 알림 표시

1. `/budget` 페이지 접속
2. "+ Add new budget" 클릭 → `식비` 예산 `100,000원` 설정
3. `/transactions/new`에서 `식비` 지출 `95,000원` 입력
4. `/budget` 페이지 돌아가기

**예상 결과:**
- 식비 카드에 "Needs attention" 배지
- 주황색 알림 박스: "식비 예산의 95%를 사용했습니다"
- "예산 수정" + "확인" 버튼 표시

### 알림 해제 및 재노출 방지

1. "확인" 버튼 클릭
2. 알림 박스 사라짐
3. 페이지 새로고침 (F5)

**예상 결과:**
- 알림 박스 다시 표시 안 됨 (localStorage에 seen 기록)
- `/settings`에서 "알림 초기화" 클릭 시 다시 표시됨

---

## 향후 개선 사항

- [ ] 날짜 범위 프리셋 (오늘/이번 주/이번 달/작년)
- [ ] 필터 프리셋 저장 ("내 쇼핑 지출", "월급날 전후" 등)
- [ ] 고급 검색 (정규식, AND/OR 조건)
- [ ] 엑셀 내보내기 (필터된 결과만)
- [ ] 필터 히스토리 (최근 검색 10개)
