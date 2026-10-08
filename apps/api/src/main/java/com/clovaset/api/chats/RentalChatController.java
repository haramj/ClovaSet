package com.clovaset.api.chats;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
public class RentalChatController {
    private final RentalChatService service;

    public RentalChatController(RentalChatService service) { this.service = service; }

    @GetMapping
    public List<RentalChatService.Summary> list(@RequestHeader("X-Participant-Token") String token) {
        return service.list(token);
    }

    @PostMapping
    public ResponseEntity<RentalChatService.Room> create(@RequestBody RentalChatService.CreateRequest request,
                                                           @RequestHeader("X-Participant-Token") String token) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, token));
    }

    @GetMapping("/{id}")
    public RentalChatService.Room room(@PathVariable long id, @RequestHeader("X-Participant-Token") String token) {
        return service.room(id, token);
    }

    @PostMapping("/{id}/messages")
    public RentalChatService.Room send(@PathVariable long id, @RequestBody RentalChatService.NewMessage request,
                                        @RequestHeader("X-Participant-Token") String token) {
        return service.send(id, request, token);
    }
}
