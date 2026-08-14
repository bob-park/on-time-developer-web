이 Repository 는 Next JS 에 설정이 모두 완료된 Repository 이다. (feat. Bob Park)

## `KeyFlow Authorization Server` 연동 (better-auth)

[better-auth](https://www.better-auth.com/) 의 `genericOAuth` plugin (PKCE) 을 사용하여
`KeyFlow Authorization Server` 와 직접 연동한다. 로그인되어 있지 않은 경우 `src/proxy.ts` 에서 `/login` 으로 `redirect` 한다.

### login / logout — route handler

`/login`, `/logout` 은 page 가 아닌 **route handler** (`src/app/login/route.ts`,
`src/app/logout/route.ts`) 로 구현되어 있다. 실제 route 로 React rendering 하지 않고 바로 redirect 된다.

- `/login` — better-auth `signInWithOAuth2` 로 KeyFlow authorize URL 을 생성하여 redirect 한다.
  `?callback=` query 로 로그인 후 이동할 경로를 지정할 수 있다.
- `/logout` — better-auth session `signOut` 후, KeyFlow 의 OIDC end session endpoint (`/connect/logout`) 로 `id_token_hint`
  와 함께 redirect 하여 SSO session 까지 종료한다.

### API proxy — access token 비노출

browser 에는 access token 이 노출되지 않는다. `/api/**` 요청은 catch-all route handler (`src/app/api/[...path]/route.ts`) 가 server
side 에서 better-auth 로부터 access token 을 조회하여 `Authorization: Bearer` header 로 조립한 뒤 `API_HOST` 로 전달한다. session 이 없으면
`401` 을 응답한다.

### 환경 변수 (.env)

| 변수                         | 설명                                                        | 비고                                                         |
|------------------------------|-------------------------------------------------------------|--------------------------------------------------------------|
| `BETTER_AUTH_URL`            | better-auth base URL (배포된 web 의 실제 URL)               |                                                              |
| `BETTER_AUTH_SECRET`         | better-auth secret                                          | [generate-secret](https://better-auth.com/docs/installation) |
| `KEYFLOW_AUTH_HOST`          | KeyFlow Authorization Server host                           |                                                              |
| `KEYFLOW_AUTH_CLIENT_ID`     | KeyFlow OAuth client id                                     |                                                              |
| `KEYFLOW_AUTH_CLIENT_SECRET` | KeyFlow OAuth client secret                                 |                                                              |
| `API_HOST`                   | API proxy 대상 host (`/api/**` 요청이 전달되는 backend API) |                                                              |

## Spec

- typescript 6
- eslint 9
- prettier
- nextjs 16
- react 19
- react-scan
- react-icon
- react-query (tanstack-query) 5
- better-auth
- tailwindcss 4
- daisyui 5
- zustand 5
- sockjs

## eslint + prettier

eslint + prettier 는 Bob Park Repository 에 따른다.

- eslint: https://github.com/bob-park/eslint-config-bobpark
- prettier: https://github.com/bob-park/prettier-config-bobpark

## Project node version management

node version 관리는 기본적으로 `mise` (mise en place) 로 구성한다.

`mise` 설정시 다음과 같이 명령어를 실행한다.

```bash
# project 의 mise configuration 을 trust
mise trust

# node 적용된 버전 확인
mise ls 
```

## dir 구조

```text
src
├── app # app router
│   ├── api # app api router
│   │   ├── [...path] # API proxy (server side 에서 access token 조립 후 API_HOST 로 전달)
│   │   ├── auth
│   │   │   └── [...all] # better-auth handler
│   │   └── health # health check api
│   ├── login # route handler — rendering 없이 KeyFlow authorize 로 redirect
│   └── logout # route handler — session signout + OIDC end session
├── domain # domain
│   └── users
│       ├── apis # api request
│       ├── components # domain components
│       ├── queries # react-query components
│       └── store # zustand store
├── shared
│   ├── api
│   ├── auth # better-auth 설정 (server) + auth-client (client)
│   ├── components
│   │   ├── queries
│   │   ├── scan
│   │   ├── timeago
│   │   └── toast
│   ├── dayjs
│   ├── hooks
│   ├── queries
│   └── store
└── utils
```

## tanstack-query error handling

`tanstack-query` 사용 시 error handling 을 추가한다.

서버에서 내려주는 error 응답은 `ProblemDetail` 타입으로 정의한다.

```typescript
// src/shared/api/common.dto.ts

// ...

/**
 * ProblemDetail
 */
type ProblemDetail = {
    type: string;
    title: string;
    status: number;
    detail: string;
    code: string;
    timestamp: Date;
    exception: string;
};

// ...
```

`mutation` 작성 시 `onError` 에서 `err.data` 를 통해 `ProblemDetail` 을 전달한다.

```typescript
// tanstack-query 사용 시 (mutations)

// ...

export function useUserRegister({onSuccess, onError}: QueryMutationHandle<User>) {
    const queryClient = useQueryClient();

    const {mutate, isPending} = useMutation({
        mutationKey: ['users', 'register'],
        mutationFn: (req: UserRegisterRequest) => register(req),
        onSuccess: async (data) => {
            onSuccess?.(data);

            await queryClient.invalidateQueries({queryKey: ['users']});
        },
        onError: (err) => {
            onError?.(err.data); // error handling
        },
    });

    return {register: mutate, isLoading: isPending};
}

// ...
```

`hooks` 사용 시 `onError` 콜백에서 `code` 를 기준으로 분기 처리한다.

```typescript
// tanstack-query hooks 사용

// ...

const {register} = useUserRegister({
    onSuccess: (data) => console.log(data),
    onError: (err) => {
        if (err.code === 'BAD_REQUEST') {
            console.log('잘못된 요청');
        }
    },
});

// ...
```

## `PR` Merge 시 자동 version up 기능

`github workflows` + `github actions` 로 PR 시 자동으로 version up 을 진행한다.

### version pattern

[major].[minor].[patch]-rc[index]-[yyyyMMdd]

#### major

PR 제목에 `xxx [major]` 인 경우 major 버전이 `+1` 된다.

#### minor

PR 제목에 `xxx [minor]` 인 경우 minor 버전이 `+1` 된다.

#### patch

PR 제목에 `xxx` 인 경우 patch 버전이 `+1` 된다. 단, 같은 날인 경우 rc[index] 가 `+1` 된다.

### 수동 version up (`bump-version.sh`)

로컬에서 수동으로 version up 이 필요한 경우 `./bump-version.sh` 를 사용한다. (`jq` 필요)

```bash
./bump-version.sh [patch|minor|major|date]  # 기본값: patch
```

| 타입    | 동작                                                                      |
|---------|---------------------------------------------------------------------------|
| `patch` | 같은 날짜면 `rc[index]` 만 `+1`, 다른 날짜면 patch `+1` 후 `rc1` 로 리셋  |
| `minor` | 날짜와 무관하게 minor `+1`, patch 는 `0`, `rc1` 로 리셋                   |
| `major` | 날짜와 무관하게 major `+1`, minor / patch 는 `0`, `rc1` 로 리셋           |
| `date`  | 같은 날짜면 `rc[index]` 만 `+1`, 다른 날짜면 날짜만 갱신 후 `rc1` 로 리셋 |

## Server Action 사용 시 주의 (reverse proxy)

Next.js Server Action 은 요청의 `Origin` 과 `Host`(또는 `X-Forwarded-Host`) 가 일치해야 동작한다. reverse proxy 뒤에서 구동하는 경우, 반드시 `NGINX`
를 사용해서 `X-Forwarded-Host` 에 실제 요청 host 를 넣어야 한다. 누락 시 Server Action 요청이 차단된다. (`Invalid Server Actions request`)

예시는 아래와 같다. (환경: Docker Container)

```yaml
# docker-compose.yml
services:
  web:
    image: ghcr.io/bob-park/web
  proxy:
    image: nginx
    ports:
      - '80:80'
    environment:
      - WEB_DOMAIN=bob.org
      - WEB_HOST=http://web:3000
      - WS_HOST=http://web:3000
    volumes:
      - ./default.conf.template:/etc/nginx/templates/default.conf.template
    depends_on:
      web:
        condition: service_healthy
```

```nginx
# default.conf.template
log_format  proxy_log  '[$time_local] $remote_addr - $remote_user "$host$request_uri" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"'
                      ' Proxy: "$proxy_host" "$upstream_addr"';

server {

    access_log  /var/log/nginx/access.log proxy_log;

    listen       80;
    server_name  web;

    sendfile        on;
    keepalive_timeout  0;

    location / {
        proxy_pass ${WEB_HOST};
        proxy_redirect off;
        proxy_buffer_size                   128k;
        proxy_buffers                       8 256k;
        proxy_busy_buffers_size             256k;
        proxy_set_header  Host              $http_host;   # required for docker client's sake
        proxy_set_header  X-Real-IP         $remote_addr; # pass on real client's IP
        proxy_set_header  X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header  X-Forwarded-Proto $scheme;
        proxy_set_header  X-Forwarded-Host  ${WEB_DOMAIN};
    }

    location /api/v1/ws {
        proxy_pass ${WS_HOST};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

}
```

## Build

기본적으로 docker container 로 빌드한다. multi-arch 도 지원해야하므로, `docker buildx bake` 를 사용하여 build 한다. 반드시 `docker-compose.yml` 를
수정하여, 올바른 image 와 tag 를 사용할 수 있도록 해야한다.

```bash
# package.json 의 version 을 기준으로 image version 을 사용한다.
VERSION=$(node -p "require('./package.json').version") docker buildx bake -f docker-compose.yml --push --provenance false
```
