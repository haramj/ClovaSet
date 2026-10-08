# ClovaSet

특별한 날에만 입는 옷을 가까운 동네 이웃과 빌려주고 빌리는 의류 대여 서비스입니다.

## 현재 상태

`apps/web`은 React + Vite 프론트엔드, `apps/api`는 Spring Boot 4.0.8 백엔드입니다. 옷 등록과 사진 저장은 로컬 Spring API → MySQL 8.4.11로 연결됩니다. 계정, 실제 대여 및 결제는 아직 시연 범위에 포함되지 않습니다.

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
- 공개 웹은 GitHub Pages의 정적 사이트입니다. 이 환경에서 등록한 옷과 사진은 브라우저의 IndexedDB에 저장되며 다른 사용자와 공유되지 않습니다.
- 로컬 전체 실행에서는 등록 정보와 사진이 MySQL에 저장됩니다. 공개용 백엔드 호스팅은 아직 연결되지 않았습니다.
- PR에서 Spring API·MySQL 마이그레이션 테스트와 웹 빌드를 검사합니다. `main`에 푸시하면 검사 통과 후 GitHub Pages에 배포합니다.
- 웹 배포 파일에는 API 키, `.env`, OpenCode 설정을 포함하지 않습니다.

찜과 대여 요청 체험은 localStorage를 사용합니다. 예시 상품의 가격·위치는 데모 데이터입니다. 영상은 사진에 움직임을 적용한 모션 영상입니다. [미디어 기록](docs/architecture/media.md)을 참고하세요.

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
