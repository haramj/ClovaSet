package com.clovaset.api;

import com.clovaset.api.clothes.ClothingRequest;
import com.clovaset.api.clothes.ClothingRepository;
import com.clovaset.api.clothes.ClothingService;
import org.junit.jupiter.api.Test;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ApiApplicationTests {
    @Autowired ClothingService service;
    @Autowired ClothingRepository repository;
    @PersistenceContext EntityManager entityManager;

    @Test
    @Transactional
    void registrationPersistsClothingOccasionsAndPhotoInMySql() {
        byte[] photo = new byte[]{(byte)0xff, (byte)0xd8, (byte)0xff, 1, 2, 3};
        var request = new ClothingRequest("녀", "격식", List.of("레스토랑", "결혼하객"), "시연용 원피스",
            "깨끗한 원피스", new BigDecimal("15000"), LocalDate.now().plusDays(1),
            LocalDate.now().plusDays(5), "경기도 용인시 기흥구 서농동");
        var created = service.register(request, new MockMultipartFile("photo", "dress.jpg", "image/jpeg", photo));
        assertNotNull(created.id());
        assertEquals(2, created.occasions().size());
        entityManager.clear();
        var stored = repository.findById(created.id()).orElseThrow();
        assertEquals("시연용 원피스", stored.getName());
        assertArrayEquals(photo, stored.getPhotoData());
        assertEquals("image/jpeg", stored.getPhotoContentType());
        assertEquals("경기도 용인시 기흥구 서농동", stored.getPickupPlace());
    }
}
