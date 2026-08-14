# OnTime Developer Web v4 — 모델 캐시 상태/삭제

- 날짜: 2026-08-15
- 상태: 승인됨 (사용자 요구 + API 스니펫 제공)
- 작업 브랜치: feature/weeks-job-summary

## 요구사항

web-llm 의 `hasModelInCache` / `deleteModelAllInfoInCache` 로 현재 선택된 모델의
다운로드 여부 표시(badge, light/dark 모두 눈에 띄게) + 캐시 삭제 기능.
엔진은 IndexedDB 캐시 백엔드로 생성 — 설치된 web-llm 0.2.84 는 `useIndexedDBCache`
대신 `cacheBackend: 'indexeddb'` 를 사용 (동일 의도).

## 설계

### engine.ts
- `ENGINE_APP_CONFIG = { ...prebuiltAppConfig, useIndexedDBCache: true }` export,
  `CreateWebWorkerMLCEngine` 의 config 에 `appConfig: ENGINE_APP_CONFIG` 추가.
- 헬퍼 export: `checkModelCached(modelId)` → `hasModelInCache(modelId, ENGINE_APP_CONFIG)`,
  `deleteModelCache(modelId)` → `deleteModelAllInfoInCache(modelId, ENGINE_APP_CONFIG)`.
- 참고: 캐시 백엔드가 IndexedDB 로 바뀌므로 기존 Cache API 다운로드는 1회 재다운로드.

### ModelSelect 확장 (챗봇/보고서 두 배치 모두 자동 적용)
- 셀렉트 옆에:
  - **다운로드됨 badge**: 선택 모델이 캐시에 있으면 `badge badge-sm badge-success`
    (솔리드 — 다크 #1ed760/검정 글자, 라이트 #169c46/흰 글자로 양 모드 가시성 확보)
  - **삭제 버튼**: 캐시가 있을 때만 표시, 휴지통 SVG `btn btn-ghost btn-xs btn-square
    text-error`, 클릭 시 `deleteModelCache(modelId)` 후 상태 재조회.
    `isBusy`(전역 busy) 중엔 disabled.
- 캐시 상태 재조회 시점: mount / `modelId` 변경 / 삭제 후 /
  `subscribeProgress` 로 progress ≥ 1 감지 시 (다운로드 완료 반영).
- i18n (`llm` 네임스페이스, ko/en): `downloaded` = "다운로드됨"/"Downloaded",
  `deleteCache` = "모델 캐시 삭제"/"Delete model cache".

## 범위 제외
- 삭제 확인 다이얼로그(재다운로드 가능하므로 즉시 삭제), 전체 모델 목록별 상태 표시,
  캐시 용량 표시.
