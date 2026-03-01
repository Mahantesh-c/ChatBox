package com.chatapp.repository;

import com.chatapp.entity.Message;
import com.chatapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderAndRecipientOrSenderAndRecipientOrderByTimestampAsc(
            User sender1, User recipient1, User sender2, User recipient2);
}
