# ClovaSet

특별한 날에만 입는 옷을 가까운 동네 이웃과 빌려주고 빌리는 의류 대여 서비스입니다.

## 현재 상태

React + Vite 기반의 반응형 소개 페이지와 동네 옷장 체험 화면이 구현되어 있습니다. API, 인증, 실제 예약·결제는 아직 연결되지 않았습니다.

## 실행 방법

Node.js 22.12+ 또는 24+ 환경에서 실행합니다.

```sh
cd apps/web
npm ci
npm run dev
```

표시된 로컬 주소를 브라우저에서 열면 소개 화면이 나타납니다. 상단 **서비스 시작하기**로 동네 옷장(`#/closet`)에 진입합니다.

```sh
npm run build
npm run preview
```

## 구현 내용

- 20초 자체 편집 모션 영상, 포스터 대체 화면, 재생·일시정지
- 스크롤 진입 애니메이션, 소개·이용 방법 앵커 이동
- 모바일 메뉴와 반응형 레이아웃, 모션 감소 설정 지원
- 예시 상품 검색, 카테고리·동네 필터, 찜 목록
- 상품 상세 모달, 대여 날짜 및 예상 금액 계산
- 이 브라우저에만 저장되는 체험 대여 요청과 취소

찜과 체험 요청은 localStorage를 사용합니다. 예시 상품의 가격·위치는 데모 데이터이며 실제 재고나 대여 제안이 아닙니다. 영상은 정지 사진에 움직임을 적용한 모션 영상으로, 실사 촬영 영상은 아닙니다. 미디어 출처는 [미디어 기록](docs/architecture/media.md)에 정리했습니다.

## 디렉토리 구조

```text
apps/
  web/
    public/                 # 정적 리소스
    src/
      app/                  # 앱 진입점 및 라우팅
      components/           # 공통 UI 컴포넌트
      features/             # 기능별 화면 및 로직
      lib/                  # 공통 유틸리티, API 클라이언트
      styles/               # 공통 스타일
  api/
    src/
      config/               # 서버 설정
      middleware/           # 인증, 오류 처리 등
      modules/              # 기능별 서버 로직
packages/
  shared/src/
    types/                  # 공용 데이터 계약
    constants/              # 공용 상수
    validators/             # 공용 입력 검증
database/                   # 마이그레이션 및 샘플 데이터
```

- `database/migrations/`: 데이터베이스 스키마 변경 이력
- `database/seeds/`: 개발용 샘플 데이터
- `tests/integration/`: 기능 간 통합 테스트
- `tests/e2e/`: 사용자 시나리오 테스트
- `infra/`: 배포 및 인프라 설정
- `scripts/`: 개발·운영 보조 스크립트
- `docs/product/`: 서비스 범위 및 정책
- `docs/architecture/`: 구조 및 설계 기록

웹의 `features/`와 API의 `modules/`는 `auth`, `users`, `neighborhoods`, `clothes`, `rentals`, `chat`, `reviews`, `notifications`로 나눕니다. 빈 디렉토리는 `.gitkeep`으로 유지하며 구현 파일이 생기면 제거할 수 있습니다.

## 다음 개발 단계

1. API 기술 스택과 데이터베이스 선정
2. 동네 인증 및 대여·취소·반납 정책 결정
3. 회원, 의류, 대여 데이터 모델 설계
4. 의류 등록 → 동네 검색 → 대여 요청 → 수락 → 전달 → 반납의 실제 API 연동

자세한 범위는 [MVP 기획](docs/product/mvp.md), 코드 배치는 [구조 가이드](docs/architecture/structure.md)를 참고하세요.


## 공개 서비스와 CI/CD

- 서비스: https://haramj.github.io/sharedclothes/
- Actions: https://github.com/haramj/sharedclothes/actions/workflows/web.yml
- PR: OpenCode 환경 로더 테스트 → 웹 의존성 설치 → 포맷 검사 → 프로덕션 빌드 → 배포 파일 검사
- main 푸시 / 수동 실행: 위 검사 통과 후 GitHub Pages로 자동 배포
- 배포 파일은 `apps/web/dist`만 사용합니다. API 키 없이 빌드하며 `.env`와 OpenCode 설정은 공개 웹에 포함하지 않습니다.
- 현재 공개 서비스는 데모입니다. 계정, 실제 대여/결제 서버는 포함하지 않습니다.

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
