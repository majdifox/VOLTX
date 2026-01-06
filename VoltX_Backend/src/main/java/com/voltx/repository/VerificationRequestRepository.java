package com.voltx.repository;

import com.voltx.entity.User;
import com.voltx.entity.VerificationRequest;
import com.voltx.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationRequestRepository extends JpaRepository<VerificationRequest, Long> {

    List<VerificationRequest> findByStatus(VerificationStatus status);

    Optional<VerificationRequest> findByUserAndStatus(User user, VerificationStatus status);

    boolean existsByUserAndStatus(User user, VerificationStatus status);
}
