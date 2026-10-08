package com.clovaset.api.clothes;

import com.clovaset.api.config.ParticipantIdentity;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClothingService {
    private static final ZoneId DEMO_ZONE = ZoneId.of("Asia/Seoul");
    private static final Map<String, Set<String>> OCCASIONS = Map.of(
        "격식", Set.of("레스토랑", "장례", "결혼하객", "면접"),
        "파티", Set.of("클럽", "패션쇼", "페스티벌", "콘서트", "기타"),
        "일상", Set.of("산책", "데이트", "카페", "운동", "기타")
    );
    private static final long MAX_PHOTO_SIZE = 5 * 1024 * 1024;
    private final ClothingRepository repository;

    @Value("${MAX_CLOTHES:1000000}")
    private long maxClothes = 1000000;

    public ClothingService(ClothingRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<ClothingResponse> list() {
        return list(null);
    }

    @Transactional(readOnly = true)
    public List<ClothingResponse> list(String participantToken) {
        String hash = participantToken == null ? null : ParticipantIdentity.hash(participantToken);
        return repository.findAllByOrderByCreatedAtDesc().stream().map(item -> ClothingResponse.from(item, hash)).toList();
    }

    @Transactional(readOnly = true)
    public Clothing photo(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "옷을 찾을 수 없습니다."));
    }

    @Transactional
    public ClothingResponse register(ClothingRequest request, MultipartFile photo) {
        return register(request, photo, null);
    }

    @Transactional
    public ClothingResponse register(ClothingRequest request, MultipartFile photo, String participantToken) {
        if (!Set.of("남", "녀").contains(request.gender())) bad("성별을 선택해주세요.");
        Set<String> allowed = OCCASIONS.get(request.category());
        if (allowed == null || request.occasions().stream().anyMatch(o -> !allowed.contains(o))) bad("카테고리와 용도를 확인해주세요.");
        if (request.pricePerDay().scale() > 0 || request.pricePerDay().compareTo(new java.math.BigDecimal("10000000")) > 0) bad("가격은 1원부터 1천만 원 이하로 입력해주세요.");
        if (request.rentalStart().isBefore(LocalDate.now(DEMO_ZONE)) || request.rentalEnd().isBefore(request.rentalStart())) bad("대여 기간을 확인해주세요.");
        if (photo == null || photo.isEmpty() || photo.getSize() > MAX_PHOTO_SIZE) bad("5MB 이하 사진을 등록해주세요.");
        byte[] bytes;
        try { bytes = photo.getBytes(); }
        catch (IOException ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "사진을 읽을 수 없습니다."); }
        String mime = imageType(bytes);
        if (mime == null) bad("JPG, PNG, WebP 사진만 등록할 수 있습니다.");
        if (repository.count() >= maxClothes)
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "시연용 등록 한도에 도달했습니다.");
        Clothing clothing = new Clothing(request.gender(), request.category(), new LinkedHashSet<>(request.occasions()),
            request.name().trim(), request.description().trim(), request.pricePerDay(), request.rentalStart(),
            request.rentalEnd(), request.pickupPlace().trim(), mime, bytes);
        String ownerHash = participantToken == null ? null : ParticipantIdentity.hash(participantToken);
        if (ownerHash != null) {
            if (request.ownerName() == null || request.ownerName().isBlank()) bad("올린 사람 이름을 입력해주세요.");
            clothing.setOwner(request.ownerName().trim(), ownerHash);
        }
        return ClothingResponse.from(repository.saveAndFlush(clothing), ownerHash);
    }

    private void bad(String message) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }

    private String imageType(byte[] b) {
        if (b.length >= 3 && (b[0] & 0xff) == 0xff && (b[1] & 0xff) == 0xd8 && (b[2] & 0xff) == 0xff) return "image/jpeg";
        if (b.length >= 8 && (b[0] & 0xff) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') return "image/png";
        if (b.length >= 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F' && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') return "image/webp";
        return null;
    }
}
