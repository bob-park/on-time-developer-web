---
title: Git Workflow
scope: .git/**
applies_to: branching, commits, opening PRs, release tags
related:
  - ./build-release.md
  - ./dev-env.md
---

# Git Workflow

> `master` / `develop` / `feature/*` / `hotfix/*` 4-branch 모델. feature PR base 는 반드시 `develop`. 커밋 prefix = `feat / refactor / fix / build / docs / test`. PR 제목의 `[major]` / `[minor]` 토큰이 version bump 를 결정.

## Branch naming

These are the target conventions. The repository currently ships with `master` only; create `develop` / `feature/*` / `hotfix/*` branches on demand.

- `master` — production-shippable. Release tags are cut from this branch.
- `develop` — next-release integration branch.
- `feature/<topic>` — new feature development.
- `hotfix/<topic>` — patches against an already-released version.

Rules:

- Use lowercase, kebab-case for `<topic>` (e.g., `feature/asset-upload`, `hotfix/jwt-scope-mapping`).
- When opening a PR from a `feature/*` branch, the base branch **MUST** be `develop`. Targeting `master` directly is not allowed for feature work; promotion to `master` happens through a separate `develop` → `master` release PR.
- Do not commit directly to `master` or `develop` — always go through a PR.
- A tag is created on `master` when a release ships; tag name follows the version pattern in [PR title & version bump](#pr-title--version-bump).

## Commit message prefix

Format: `prefix: 한국어 설명`. Follow the existing history style.

- `feat`: 새로운 기능 추가
- `refactor`: 기능 변화 없는 리팩토링 (변수 이름 변경 등)
- `fix`: 버그 / 이슈 수정
- `build`: 패키지 매니저 의존성, 빌드 설정 변경
- `docs`: 문서 또는 주석 작업
- `test`: 테스트 코드 추가 / 수정

## PR title & version bump

The release workflow auto-bumps `package.json` version based on the PR title:

- Title contains `[major]` → major + 1.
- Title contains `[minor]` → minor + 1.
- Otherwise → patch + 1. For same-day PRs the `rc[index]` suffix is incremented instead.

Version pattern: `[major].[minor].[patch]-rc[index]-[yyyyMMdd]`.
