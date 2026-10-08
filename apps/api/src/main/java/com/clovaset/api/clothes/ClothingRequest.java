package com.clovaset.api.clothes;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ClothingRequest(
    @NotBlank String gender,
    @NotBlank String category,
    @NotEmpty List<@NotBlank String> occasions,
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Size(max = 5000) String description,
    @NotNull @DecimalMin("1") BigDecimal pricePerDay,
    @NotNull LocalDate rentalStart,
    @NotNull LocalDate rentalEnd,
    @NotBlank @Size(max = 100) String pickupPlace
) {}
