package com.clovaset.api.clothes;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ClothingServiceTest {
    private final ClothingRepository repository = mock(ClothingRepository.class);
    private final ClothingService service = new ClothingService(repository);
    private final MockMultipartFile jpeg = new MockMultipartFile("photo", "jacket.jpg", "image/jpeg", new byte[]{(byte)0xff, (byte)0xd8, (byte)0xff, 1});

    private ClothingRequest request(String category, List<String> occasions) {
        return new ClothingRequest("녀", category, occasions, "재킷", "깨끗한 재킷", new BigDecimal("15000"),
            LocalDate.now().plusDays(1), LocalDate.now().plusDays(3), "경기도 용인시 기흥구 서농동");
    }

    @Test
    void rejectsOccasionFromAnotherCategoryBeforeSaving() {
        var error = assertThrows(ResponseStatusException.class,
            () -> service.register(request("격식", List.of("결혼하객", "클럽")), jpeg));
        assertEquals(400, error.getStatusCode().value());
        verifyNoInteractions(repository);
    }

    @Test
    void rejectsSpoofedImageWithJpegMimeType() {
        var file = new MockMultipartFile("photo", "fake.jpg", "image/jpeg", "not an image".getBytes());
        var error = assertThrows(ResponseStatusException.class,
            () -> service.register(request("격식", List.of("결혼하객")), file));
        assertEquals(400, error.getStatusCode().value());
        verifyNoInteractions(repository);
    }

    @Test
    void rejectsPastRentalStart() {
        var original = request("일상", List.of("데이트"));
        var past = new ClothingRequest(original.gender(), original.category(), original.occasions(), original.name(),
            original.description(), original.pricePerDay(), LocalDate.now().minusDays(1), original.rentalEnd(), original.pickupPlace());
        assertThrows(ResponseStatusException.class, () -> service.register(past, jpeg));
        verifyNoInteractions(repository);
    }
}
