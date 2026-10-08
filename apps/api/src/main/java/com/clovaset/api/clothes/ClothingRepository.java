package com.clovaset.api.clothes;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClothingRepository extends JpaRepository<Clothing, Long> {
    List<Clothing> findAllByOrderByCreatedAtDesc();
}
