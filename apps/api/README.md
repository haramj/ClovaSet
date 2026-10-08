# ClovaSet 의류 등록 API

Spring Boot 4.0.8, Java 17, Spring Data JPA, Flyway, MySQL 8.4.11.

`docker compose up -d mysql` 후 이 디렉토리에서 `./mvnw spring-boot:run`을 실행합니다. 로컬 프론트엔드는 Vite 프록시로 API에 연결됩니다.

## 등록 계약

`POST /api/clothes`, `multipart/form-data`:

- `data`: JSON 문자열
- `photo`: JPG/PNG/WebP 이미지, 5MB 이하

```json
{
  "gender": "녀",
  "category": "격식",
  "occasions": ["레스토랑", "결혼하객"],
  "name": "시연용 원피스",
  "description": "깨끗하게 보관한 원피스",
  "pricePerDay": 15000,
  "rentalStart": "2026-10-12",
  "rentalEnd": "2026-10-20",
  "pickupPlace": "경기도 용인시 기흥구 서농동"
}
```

`gender`: `남` 또는 `녀`. 카테고리별 용도는 `격식`(레스토랑/장례/결혼하객/면접), `파티`(클럽/패션쇼/페스티벌/콘서트/기타), `일상`(산책/데이트/카페/운동/기타)이며 복수 선택할 수 있습니다.

서버는 날짜, 가격, 카테고리와 용도 조합, 파일 크기 및 실제 이미지 헤더를 검증합니다. 성공 시 HTTP 201과 등록 JSON을 반환합니다. `GET /api/clothes`로 등록 목록을 조회하고 `GET /api/clothes/{id}/photo`로 사진을 받습니다.

사진은 MySQL `LONGBLOB`에 저장합니다. 시연 단계의 간단한 구조이며 추후 실제 서비스에서는 사진을 별도 저장소로 분리하고 사용자 인증·권한을 추가해야 합니다.
