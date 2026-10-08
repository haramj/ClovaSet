# Shared Clothes

특별한 날에만 입는 옷을 가까운 동네 이웃과 빌려주고 빌리는 의류 대여 서비스입니다.

## 현재 상태

초기 디렉토리 구조와 기획 문서만 구성되어 있습니다. 프레임워크, 데이터베이스, 패키지 매니저는 아직 선정하지 않았으며 실행 가능한 앱이나 설치·실행 명령은 포함하지 않습니다.

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

1. 웹·API 기술 스택과 데이터베이스 선정
2. 동네 인증 및 대여·취소·반납 정책 결정
3. 회원, 의류, 대여 데이터 모델 설계
4. 의류 등록 → 동네 검색 → 대여 요청 → 수락 → 전달 → 반납 흐름 구현

자세한 범위는 [MVP 기획](docs/product/mvp.md), 코드 배치는 [구조 가이드](docs/architecture/structure.md)를 참고하세요.
