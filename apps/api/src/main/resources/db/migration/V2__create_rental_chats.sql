ALTER TABLE clothes
  ADD COLUMN owner_name VARCHAR(40) NULL,
  ADD COLUMN owner_token_hash CHAR(64) NULL;

CREATE TABLE rental_chats (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  clothing_id BIGINT NOT NULL,
  owner_token_hash CHAR(64) NOT NULL,
  requester_token_hash CHAR(64) NOT NULL,
  requester_name VARCHAR(40) NOT NULL,
  rental_start DATE NOT NULL,
  rental_end DATE NOT NULL,
  total_price DECIMAL(12, 0) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX idx_rental_chats_owner (owner_token_hash, created_at),
  INDEX idx_rental_chats_requester (requester_token_hash, created_at),
  CONSTRAINT fk_rental_chats_clothing FOREIGN KEY (clothing_id) REFERENCES clothes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE rental_chat_messages (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  sender_token_hash CHAR(64) NOT NULL,
  body VARCHAR(1000) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX idx_chat_messages_chat (chat_id, created_at),
  CONSTRAINT fk_chat_messages_chat FOREIGN KEY (chat_id) REFERENCES rental_chats(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
