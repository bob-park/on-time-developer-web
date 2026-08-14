---
title: Build & Release
scope: docker-compose.yml, Dockerfile, bump-version.sh
applies_to: building Docker images, cutting releases
related:
  - ./git.md
  - ../tech-stack.md
---

# Build & Release

> Multi-arch Docker build = `docker buildx bake`. Image tag = `package.json#version`. 이미지 이름/태그 변경 시 `docker-compose.yml` 갱신.

- Multi-arch Docker build via `docker buildx bake`. Image tag is derived from `package.json#version`.
- Canonical build command (see README for context):

  ```bash
  VERSION=$(node -p "require('./package.json').version") \
    docker buildx bake -f docker-compose.yml --push --provenance false
  ```

- When changing image names or tags, update `docker-compose.yml`.
- Version pattern is defined in the Git workflow ([version pattern](./git.md#pr-title--version-bump)).
