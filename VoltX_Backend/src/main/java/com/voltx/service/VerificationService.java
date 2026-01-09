package com.voltx.service;

import com.voltx.entity.User;
import com.voltx.entity.VerificationRequest;
import com.voltx.enums.VerificationStatus;
import com.voltx.exception.BadRequestException;
import com.voltx.exception.ResourceNotFoundException;
import com.voltx.repository.VerificationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final VerificationRequestRepository verificationRequestRepository;
    private final NotificationService notificationService;
    private final UserService userService;

    @Transactional
    public VerificationRequest createVerificationRequest(User user, String documentType, String documentUrl) {
        if (user.isVerified()) {
            throw new BadRequestException("User already verified");
        }

        if (verificationRequestRepository.existsByUserAndStatus(user, VerificationStatus.PENDING)) {
            throw new BadRequestException("Verification request already pending");
        }

        VerificationRequest request = VerificationRequest.builder()
                .user(user)
                .documentType(documentType)
                .documentUrl(documentUrl)
                .status(VerificationStatus.PENDING)
                .build();

        return verificationRequestRepository.save(request);
    }

    @Transactional
    public void approveVerification(Long requestId, User admin) {
        VerificationRequest request = verificationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification request not found"));

        request.setStatus(VerificationStatus.APPROVED);
        request.setReviewedBy(admin);
        verificationRequestRepository.save(request);

        User user = request.getUser();
        user.setVerified(true);
        userService.findById(user.getId());

        notificationService.createNotification(
                user,
                "Your verification request has been approved! You are now verified."
        );
    }

    @Transactional
    public void declineVerification(Long requestId, User admin, String reason) {
        VerificationRequest request = verificationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification request not found"));

        request.setStatus(VerificationStatus.DECLINED);
        request.setReviewedBy(admin);
        verificationRequestRepository.save(request);

        notificationService.createNotification(
                request.getUser(),
                "Your verification request was declined. Reason: " + reason
        );
    }
}
