package com.clovaset.api.clothes;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/clothes")
public class ClothingController {
    private final ClothingService service;
    private final ObjectMapper mapper;
    private final jakarta.validation.Validator validator;

    public ClothingController(ClothingService service, ObjectMapper mapper, jakarta.validation.Validator validator) {
        this.service = service;
        this.mapper = mapper;
        this.validator = validator;
    }

    @GetMapping
    public List<ClothingResponse> list() { return service.list(); }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ClothingResponse> register(@RequestPart("data") String data, @RequestPart("photo") MultipartFile photo) {
        ClothingRequest request;
        try { request = mapper.readValue(data, ClothingRequest.class); }
        catch (JacksonException ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "등록 내용을 확인해주세요."); }
        // Record validation is applied explicitly because multipart JSON is parsed from a string part.
        var violations = validator.validate(request);
        if (!violations.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "필수 입력값을 확인해주세요.");
        ClothingResponse result = service.register(request, photo);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> photo(@PathVariable Long id) {
        Clothing clothing = service.photo(id);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(clothing.getPhotoContentType()))
            .cacheControl(CacheControl.maxAge(java.time.Duration.ofDays(7))).body(clothing.getPhotoData());
    }
}
