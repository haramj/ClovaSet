package com.clovaset.api;

import com.clovaset.api.chats.RentalChatService;
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
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ApiApplicationTests {
    @Autowired ClothingService service;
    @Autowired ClothingRepository repository;
    @Autowired RentalChatService chats;
    @PersistenceContext EntityManager entityManager;

    @Test
    @Transactional
    void registrationPersistsClothingOccasionsAndPhotoInMySql() {
        byte[] photo = new byte[]{(byte)0xff, (byte)0xd8, (byte)0xff, 1, 2, 3};
        var request = new ClothingRequest("녀", "격식", List.of("레스토랑", "결혼하객"), "시연용 원피스",
            "깨끗한 원피스", new BigDecimal("15000"), LocalDate.now().plusDays(1),
            LocalDate.now().plusDays(5), "경기도 용인시 기흥구 서농동", null);
        var created = service.register(request, new MockMultipartFile("photo", "dress.jpg", "image/jpeg", photo));
        assertNotNull(created.id());
        assertFalse(created.chatAvailable());
        assertEquals(2, created.occasions().size());
        entityManager.clear();
        var stored = repository.findById(created.id()).orElseThrow();
        assertEquals("시연용 원피스", stored.getName());
        assertArrayEquals(photo, stored.getPhotoData());
        assertEquals("image/jpeg", stored.getPhotoContentType());
        assertEquals("경기도 용인시 기흥구 서농동", stored.getPickupPlace());
    }

    @Test
    @Transactional
    void rentalRequestAppearsForOwnerButNotAnotherBrowser() {
        String owner = "11111111-1111-4111-8111-111111111111";
        String requester = "22222222-2222-4222-8222-222222222222";
        String outsider = "33333333-3333-4333-8333-333333333333";
        LocalDate start = LocalDate.now().plusDays(2);
        LocalDate end = start.plusDays(1);
        var request = new ClothingRequest("녀", "격식", List.of("결혼하객"), "채팅 테스트 옷",
            "깨끗한 옷", new BigDecimal("6000"), start, end, "서농동", "옷 주인");
        var photo = new MockMultipartFile("photo", "dress.jpg", "image/jpeg",
            new byte[]{(byte)0xff, (byte)0xd8, (byte)0xff, 1});
        var clothing = service.register(request, photo, owner);
        assertThrows(ResponseStatusException.class,
            () -> chats.create(new RentalChatService.CreateRequest(clothing.id(), "옷 주인", start, end), owner));

        var room = chats.create(new RentalChatService.CreateRequest(clothing.id(), "빌릴 이웃", start, end), requester);
        assertEquals(new BigDecimal("12000"), room.chat().total());
        assertEquals(1, room.messages().size());
        assertTrue(chats.list(owner).stream().anyMatch(item -> item.id() == room.chat().id()));
        assertThrows(ResponseStatusException.class, () -> chats.room(room.chat().id(), outsider));
        assertEquals(2, chats.send(room.chat().id(), new RentalChatService.NewMessage("네, 가능합니다."), owner).messages().size());
    }
}
