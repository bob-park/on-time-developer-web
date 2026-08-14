# CLAUDE.md

@AGENTS.md

## Claude Code 전용 규칙

### Plan Mode
- 큰 변경(파일 3개 이상 / 새 기능 / 마이그레이션) 은 plan mode 로 진행한다.

### 실행 명령어 안내
다음 명령어를 우선적으로 사용한다. 추가 도구가 필요한 경우 사용자에게 확인.

- `yarn dev` — Next.js 개발 서버 실행
- `yarn build` — production 빌드
- `yarn start` — production 빌드 실행
- `yarn lint` — ESLint 실행 (커밋 전 필수)
- `yarn prettier` — 전체 소스 포매팅
- `mise trust && mise ls` — Node 버전 동기화

테스트 스크립트는 현재 `package.json` 에 정의되어 있지 않다. 테스트가
도입되면 본 섹션과 `docs/agents/tech-stack.md`,
`docs/agents/workflows/dev-env.md` 를 함께 업데이트한다.

### Design Prompt 템플릿 위치
- 재사용 가능한 시스템 디자인 / UI 디자인 prompt 템플릿은 `./docs/design/`
  아래에 보관한다.
- 사용자가 디자인 관련 요청을 줄 때, 가장 먼저 `./docs/design/` 의 템플릿을
  확인하여 일관된 출력 스타일과 산출물 형식을 따른다.

### 디자인 프롬프트 처리 워크플로우
사용자가 UI / 디자인 관련 요청(목업, 레이아웃 비교, 비주얼 컴포넌트) 을 주면:

1. `./docs/design/` 에 적용 가능한 prompt 템플릿이 있는지 먼저 확인한다.
2. superpowers brainstorming 단계에서 visual companion 사용을 제안한다.
3. 사용자가 동의하면 정적 HTML 목업을 임시 디렉토리에 작성한다.
4. `npx serve <dir>` 또는 `python3 -m http.server` 로 로컬 HTTP 서버를
   구동하고, 접속 URL과 포트를 사용자에게 안내한다.
5. 사용자 피드백을 받아 반복 작업한 뒤, 최종 합의된 디자인만 실제
   `src/` 코드에 반영한다.
6. 작업 종료 시 HTTP 서버를 정리한다.
