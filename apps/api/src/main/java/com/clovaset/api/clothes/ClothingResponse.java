package com.clovaset.api.clothes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

public record ClothingResponse(
    Long id, String gender, String category, Set<String> occasions,
    String name, String description, BigDecimal pricePerDay,
    LocalDate rentalStart, LocalDate rentalEnd, String pickupPlace,
    String photoUrl, String ownerName, boolean chatAvailable, boolean ownedByMe
) {
    public static ClothingResponse from(Clothing clothing) {
        return from(clothing, null);
    }

    public static ClothingResponse from(Clothing clothing, String participantHash) {
        return new ClothingResponse(clothing.getId(), clothing.getGender(), clothing.getCategory(),
            clothing.getOccasions(), clothing.getName(), clothing.getDescription(), clothing.getPricePerDay(),
            clothing.getRentalStart(), clothing.getRentalEnd(), clothing.getPickupPlace(),
            "/api/clothes/" + clothing.getId() + "/photo", clothing.getOwnerName(),
            clothing.getOwnerTokenHash() != null,
            participantHash != null && participantHash.equals(clothing.getOwnerTokenHash()));
    }
}
