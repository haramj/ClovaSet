package com.clovaset.api.chats;

import com.clovaset.api.clothes.Clothing;
import com.clovaset.api.clothes.ClothingRepository;
import com.clovaset.api.config.ParticipantIdentity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;

@Service
public class RentalChatService {
    private static final ZoneId DEMO_ZONE = ZoneId.of("Asia/Seoul");
    private final JdbcTemplate jdbc;
    private final ClothingRepository clothes;

    @Value("${MAX_CHATS:1000}")
    private int maxChats;

    public RentalChatService(JdbcTemplate jdbc, ClothingRepository clothes) {
        this.jdbc = jdbc;
        this.clothes = clothes;
    }

    public record CreateRequest(Long clothingId, String requesterName, LocalDate start, LocalDate end) {}
    public record NewMessage(String body) {}
    public record Message(long id, boolean mine, String body, LocalDateTime createdAt) {}
    public record Summary(long id, long clothingId, String clothingName, String ownerName, String requesterName,
                          LocalDate start, LocalDate end, BigDecimal total, String role, String lastMessage,
                          LocalDateTime createdAt) {}
    public record Room(Summary chat, List<Message> messages) {}

    private static final String SUMMARY_SQL = """
        SELECT r.*, c.name AS clothing_name, c.owner_name,
          (SELECT body FROM rental_chat_messages WHERE chat_id = r.id ORDER BY id DESC LIMIT 1) AS last_message
        FROM rental_chats r JOIN clothes c ON c.id = r.clothing_id
        """;

    @Transactional
    public Room create(CreateRequest request, String participantToken) {
        String requester = ParticipantIdentity.hash(participantToken);
        if (request == null || request.clothingId() == null || request.requesterName() == null
            || request.requesterName().isBlank() || request.requesterName().trim().length() > 40
            || request.start() == null || request.end() == null)
            bad("대여 요청 내용을 확인해주세요.");
        Clothing clothing = clothes.findById(request.clothingId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "옷을 찾을 수 없습니다."));
        String owner = clothing.getOwnerTokenHash();
        if (owner == null) bad("이 옷은 올린 사람과 채팅할 수 없어요.");
        if (owner.equals(requester)) bad("내 옷에는 대여 요청을 보낼 수 없어요.");
        long days = ChronoUnit.DAYS.between(request.start(), request.end()) + 1;
        if (request.start().isBefore(LocalDate.now(DEMO_ZONE)) || days < 1 || days > 30
            || request.start().isBefore(clothing.getRentalStart()) || request.end().isAfter(clothing.getRentalEnd()))
            bad("등록된 대여 가능 기간 안에서 최대 30일까지 선택해주세요.");
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM rental_chats", Integer.class);
        if (count != null && count >= maxChats)
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "시연용 채팅 한도에 도달했어요.");
        BigDecimal total = clothing.getPricePerDay().multiply(BigDecimal.valueOf(days));
        GeneratedKeyHolder keys = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement statement = connection.prepareStatement("""
                INSERT INTO rental_chats (clothing_id, owner_token_hash, requester_token_hash, requester_name,
                                          rental_start, rental_end, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)
                """, new String[]{"id"});
            statement.setLong(1, clothing.getId());
            statement.setString(2, owner);
            statement.setString(3, requester);
            statement.setString(4, request.requesterName().trim());
            statement.setDate(5, Date.valueOf(request.start()));
            statement.setDate(6, Date.valueOf(request.end()));
            statement.setBigDecimal(7, total);
            return statement;
        }, keys);
        long id = Objects.requireNonNull(keys.getKey()).longValue();
        String body = "안녕하세요! " + clothing.getName() + "을(를) " + request.start() + "부터 " + request.end()
            + "까지 빌리고 싶어요. 예상 금액은 " + total.toPlainString() + "원입니다. 가능할까요?";
        jdbc.update("INSERT INTO rental_chat_messages (chat_id, sender_token_hash, body) VALUES (?, ?, ?)", id, requester, body);
        return room(id, participantToken);
    }

    @Transactional(readOnly = true)
    public List<Summary> list(String participantToken) {
        String hash = ParticipantIdentity.hash(participantToken);
        return jdbc.query(SUMMARY_SQL + " WHERE r.owner_token_hash = ? OR r.requester_token_hash = ? ORDER BY r.created_at DESC",
            (rs, row) -> summary(rs, hash), hash, hash);
    }

    @Transactional(readOnly = true)
    public Room room(long id, String participantToken) {
        String hash = ParticipantIdentity.hash(participantToken);
        Summary summary = jdbc.query(SUMMARY_SQL + " WHERE r.id = ? AND (r.owner_token_hash = ? OR r.requester_token_hash = ?)",
            (rs, row) -> summary(rs, hash), id, hash, hash).stream().findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방을 찾을 수 없습니다."));
        List<Message> messages = jdbc.query("SELECT * FROM rental_chat_messages WHERE chat_id = ? ORDER BY id ASC",
            (rs, row) -> new Message(rs.getLong("id"), hash.equals(rs.getString("sender_token_hash")),
                rs.getString("body"), rs.getTimestamp("created_at").toLocalDateTime()), id);
        return new Room(summary, messages);
    }

    @Transactional
    public Room send(long id, NewMessage request, String participantToken) {
        Room existing = room(id, participantToken);
        if (request == null || request.body() == null || request.body().isBlank() || request.body().trim().length() > 1000)
            bad("메시지는 1~1000자로 입력해주세요.");
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM rental_chat_messages WHERE chat_id = ?", Integer.class, id);
        if (count != null && count >= 100)
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "이 채팅방의 메시지 한도에 도달했어요.");
        jdbc.update("INSERT INTO rental_chat_messages (chat_id, sender_token_hash, body) VALUES (?, ?, ?)",
            existing.chat().id(), ParticipantIdentity.hash(participantToken), request.body().trim());
        return room(id, participantToken);
    }

    private Summary summary(java.sql.ResultSet rs, String hash) throws java.sql.SQLException {
        return new Summary(rs.getLong("id"), rs.getLong("clothing_id"), rs.getString("clothing_name"),
            rs.getString("owner_name"), rs.getString("requester_name"), rs.getDate("rental_start").toLocalDate(),
            rs.getDate("rental_end").toLocalDate(), rs.getBigDecimal("total_price"),
            hash.equals(rs.getString("owner_token_hash")) ? "owner" : "requester", rs.getString("last_message"),
            rs.getTimestamp("created_at").toLocalDateTime());
    }

    private static void bad(String message) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
