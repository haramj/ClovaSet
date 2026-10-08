package com.clovaset.api.clothes;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "clothes")
public class Clothing {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String gender;

    @Column(nullable = false, length = 20)
    private String category;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "clothing_occasions", joinColumns = @JoinColumn(name = "clothing_id"))
    @Column(name = "occasion", nullable = false, length = 30)
    private Set<String> occasions = new LinkedHashSet<>();

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_per_day", nullable = false, precision = 10, scale = 0)
    private BigDecimal pricePerDay;

    @Column(name = "rental_start", nullable = false)
    private LocalDate rentalStart;

    @Column(name = "rental_end", nullable = false)
    private LocalDate rentalEnd;

    @Column(name = "pickup_place", nullable = false, length = 100)
    private String pickupPlace;

    @Column(name = "photo_content_type", nullable = false, length = 30)
    private String photoContentType;

    @Lob
    @Column(name = "photo_data", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] photoData;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    protected Clothing() {}

    public Clothing(String gender, String category, Set<String> occasions, String name, String description,
                    BigDecimal pricePerDay, LocalDate rentalStart, LocalDate rentalEnd, String pickupPlace,
                    String photoContentType, byte[] photoData) {
        this.gender = gender;
        this.category = category;
        this.occasions = new LinkedHashSet<>(occasions);
        this.name = name;
        this.description = description;
        this.pricePerDay = pricePerDay;
        this.rentalStart = rentalStart;
        this.rentalEnd = rentalEnd;
        this.pickupPlace = pickupPlace;
        this.photoContentType = photoContentType;
        this.photoData = photoData;
    }

    public Long getId() { return id; }
    public String getGender() { return gender; }
    public String getCategory() { return category; }
    public Set<String> getOccasions() { return occasions; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public BigDecimal getPricePerDay() { return pricePerDay; }
    public LocalDate getRentalStart() { return rentalStart; }
    public LocalDate getRentalEnd() { return rentalEnd; }
    public String getPickupPlace() { return pickupPlace; }
    public String getPhotoContentType() { return photoContentType; }
    public byte[] getPhotoData() { return photoData; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
