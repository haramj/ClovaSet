# ClovaSet

특별한 날에만 입는 옷을 가까운 동네 이웃과 빌려주고 빌리는 의류 대여 서비스입니다.

## 현재 상태

`apps/web`은 React + Vite 프론트엔드, `apps/api`는 Spring Boot 4.0.8 백엔드입니다. 옷 등록·사진·대여 요청 채팅은 Spring API를 통해 MySQL 8.4.11에 저장합니다. 브라우저에는 채팅 참여자 식별자와 표시 이름만 보관합니다. 계정, 실제 예약 및 결제는 아직 시연 범위에 포함되지 않습니다.

## 의류 등록 시연

상단 **서비스 시작하기** → **내 옷 등록하기**를 누르면 왼쪽 슬라이드 패널에서 다음 순서로 입력합니다.

1. 남성/여성 → 격식·파티·일상 → 해당 용도 복수 선택
2. 옷 이름, 사진(JPG/PNG/WebP, 최대 5MB), 설명
3. 1일 대여 가격, 대여 가능 시작·종료일, **내 위치** 버튼

내 위치 버튼은 시연을 위해 `경기도 용인시 기흥구 서농동`을 표시합니다. 실제 위치 권한이나 GPS는 사용하지 않습니다. 등록 후 옷장 목록·카테고리·서농동 필터에 바로 반영됩니다.

## 로컬 전체 실행

Node.js 22.12+, Java 17+, Docker Desktop이 필요합니다. 저장소 루트에서:

```sh
docker compose up -d mysql
cd apps/api
./mvnw spring-boot:run
```

다른 터미널에서:

```sh
cd apps/web
npm ci
npm run dev
```

`http://127.0.0.1:5173/`을 열면 됩니다. Vite가 `/api`를 `http://127.0.0.1:8080`으로 전달합니다. MySQL은 `127.0.0.1:3306`에만 열리고, 첫 실행 시 Flyway가 테이블을 생성합니다. 기본 데이터베이스 설정은 [compose.yaml](compose.yaml)과 `apps/api/src/main/resources/application.yml`에 있습니다. 필요하면 `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`를 환경 변수로 지정하세요. 기본 비밀번호는 로컬 개발 전용입니다.

백엔드 검사:

```sh
cd apps/api
./mvnw test
```

등록 API는 `POST /api/clothes`의 multipart `data`(JSON) + `photo`(이미지), 목록은 `GET /api/clothes`, 사진은 `GET /api/clothes/{id}/photo`입니다. [API 상세](apps/api/README.md)를 참고하세요.

## 공개 시연과 CI/CD

- 공개 웹: https://haramj.github.io/sharedclothes/
- Actions: https://github.com/haramj/sharedclothes/actions/workflows/web.yml
- 공개 웹은 GitHub Pages의 정적 사이트입니다. 공개용 Spring API와 MySQL 호스팅은 아직 연결되지 않아 공개 페이지의 등록 버튼은 비활성화됩니다. 브라우저에 등록 데이터를 저장하지 않습니다.
- 공개용 서버가 준비되면 GitHub Actions 웹 빌드에 `VITE_API_URL=https://서버주소/api`를 설정하고, API 서버의 `WEB_ORIGIN=https://haramj.github.io`를 설정해야 합니다. DB는 서버의 영구 볼륨 또는 관리형 MySQL에 두어야 합니다.
- PR에서 Spring API·MySQL 마이그레이션 테스트와 웹 빌드를 검사합니다. `main`에 푸시하면 검사 통과 후 GitHub Pages에 배포합니다.
- 웹 배포 파일에는 API 키, `.env`, OpenCode 설정을 포함하지 않습니다.

### 접근 코드가 있는 임시 시연 서버

`compose.demo.yaml`은 기존 로컬 DB와 분리된 MySQL 8.4.11 영구 볼륨을 만듭니다. API는 이 컴퓨터의 `127.0.0.1:8081`에만 열리고, 모든 `/api/` 요청에 시연 접속 코드가 필요합니다. 등록은 최대 50건, 채팅방은 최대 100개로 제한됩니다.

```sh
node scripts/prepare-demo-env.mjs
cd apps/api && ./mvnw -DskipTests package && cd ../..
docker compose -f compose.demo.yaml --env-file .env.demo up -d --build
```

접속 코드는 Git에 올리지 않는 `.env.demo`의 `DEMO_ACCESS_CODE`입니다. 외부 공개는 인증된 터널 주소가 준비된 동안만 사용합니다. 임시 터널 주소는 재시작 때 바뀌며, 이 컴퓨터가 꺼지면 외부 접근이 중단됩니다. MySQL 데이터는 Docker 영구 볼륨에 남습니다. 공개 웹 빌드에는 GitHub 저장소 변수 `VITE_API_URL=https://터널주소/api`와 `VITE_DEMO_ACCESS_REQUIRED=true`를 함께 설정해야 합니다. 접근 코드는 웹 빌드에 넣지 않습니다.

찜은 localStorage를 사용합니다. 새로 등록한 옷은 등록 브라우저가 판매자가 되며, 다른 브라우저에서 요청하면 양쪽의 `나의 채팅`에 같은 대화가 표시됩니다. 참여자 식별자는 브라우저별로 생성되므로 저장소를 지우면 이전 채팅에 접근할 수 없습니다. 이전 버전에 등록한 옷과 예시 상품은 올린 사람을 식별할 수 없어 브라우저에만 저장되는 **시연용 채팅방**으로 이동합니다. 이 메시지는 실제 올린 사람에게 전송되지 않습니다. 예전 브라우저 저장소의 체험 요청은 시연용 채팅 목록으로 표시합니다. 예시 상품의 가격·위치는 데모 데이터입니다. 영상은 사진에 움직임을 적용한 모션 영상입니다. [미디어 기록](docs/architecture/media.md)을 참고하세요.

## OpenCode 개발 환경

Node.js 22.12+와 npm이 필요합니다. 저장소 루트에서:

```sh
npm ci
cp .env.example .env
# .env에 CLOVASTUDIO_API_KEY 값을 입력
npm run opencode
```

`npm ci`는 고정 버전 OpenCode CLI를 설치합니다. 전역 설치는 필요하지 않습니다.
`.env`는 아래 한 줄만 있으면 됩니다. 키는 별도 보안 채널로 전달받으세요.

```dotenv
CLOVASTUDIO_API_KEY=여기에_전달받은_키
```

`npm run opencode`가 루트 `.env`를 읽고 기존 `opencode.json`의 HyperCLOVA X 설정에 주입합니다. 일반 `opencode` 명령은 이 로더를 거치지 않으므로 위 npm 명령을 사용하세요. `.env`는 Git에서 제외되며 템플릿만 공유됩니다. 키에 `VITE_` 접두사를 붙이지 마세요.

```sh
npm run opencode -- --version
npm test
```

설정 참고: [OpenCode 환경 변수](https://opencode.ai/docs/config/#env-vars), [CLOVA Studio 호환 API](https://guide.ncloud-docs.com/docs/clovastudio-dev-langchain), [Vite GitHub Pages 배포](https://vite.dev/guide/static-deploy.html#github-pages).
