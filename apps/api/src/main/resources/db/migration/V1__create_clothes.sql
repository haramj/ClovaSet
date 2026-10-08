CREATE TABLE clothes (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  gender VARCHAR(10) NOT NULL,
  category VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price_per_day DECIMAL(10, 0) NOT NULL,
  rental_start DATE NOT NULL,
  rental_end DATE NOT NULL,
  pickup_place VARCHAR(100) NOT NULL,
  photo_content_type VARCHAR(30) NOT NULL,
  photo_data LONGBLOB NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX idx_clothes_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE clothing_occasions (
  clothing_id BIGINT NOT NULL,
  occasion VARCHAR(30) NOT NULL,
  PRIMARY KEY (clothing_id, occasion),
  CONSTRAINT fk_clothing_occasions_clothing FOREIGN KEY (clothing_id) REFERENCES clothes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
