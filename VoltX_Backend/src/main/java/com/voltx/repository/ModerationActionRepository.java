package com.voltx.repository;

import com.voltx.entity.ModerationAction;
import com.voltx.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModerationActionRepository extends JpaRepository<ModerationAction, Long> {

    List<ModerationAction> findByUserOrderByCreatedAtDesc(User user);

    List<ModerationAction> findByAdminOrderByCreatedAtDesc(User admin);
}
