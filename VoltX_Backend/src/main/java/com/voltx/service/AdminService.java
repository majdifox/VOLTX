package com.voltx.service;

import com.voltx.dto.AccountActionRequest;
import com.voltx.dto.AdminDashboardStats;
import com.voltx.entity.Event;
import com.voltx.entity.ModerationAction;
import com.voltx.entity.User;
import com.voltx.enums.AccountStatus;
import com.voltx.enums.EventModerationStatus;
import com.voltx.enums.Role;
import com.voltx.exception.BadRequestException;
import com.voltx.exception.ResourceNotFoundException;
import com.voltx.exception.UnauthorizedException;
import com.voltx.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final PostRepository postRepository;
    private final ModerationActionRepository moderationActionRepository;
    private final NotificationService notificationService;

    public void validateAdminAccess(User user) {
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.CAPTAIN) {
            throw new UnauthorizedException("Admin access required");
        }
    }

    public AdminDashboardStats getDashboardStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByAccountStatus(AccountStatus.ACTIVE);
        long suspendedUsers = userRepository.countByAccountStatus(AccountStatus.SUSPENDED);
        long bannedUsers = userRepository.countByAccountStatus(AccountStatus.BANNED);
        long totalEvents = eventRepository.count();
        long pendingEvents = eventRepository.countByModerationStatus(EventModerationStatus.PENDING_REVIEW);
        long totalPosts = postRepository.count();

        return AdminDashboardStats.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .suspendedUsers(suspendedUsers)
                .bannedUsers(bannedUsers)
                .totalEvents(totalEvents)
                .pendingEvents(pendingEvents)
                .totalPosts(totalPosts)
                .build();
    }

    @Transactional
    public void suspendUser(Long userId, User admin, AccountActionRequest request) {
        validateAdminAccess(admin);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Cannot suspend admin users");
        }

        user.setAccountStatus(AccountStatus.SUSPENDED);
        user.setSuspensionCount(user.getSuspensionCount() + 1);
        user.setSuspensionStartAt(LocalDateTime.now());
        user.setSuspensionEndAt(LocalDateTime.now().plusDays(request.getDurationDays()));
        userRepository.save(user);

        logModerationAction(admin, user, "SUSPEND", request.getReason());
    }

    @Transactional
    public void banUser(Long userId, User admin, AccountActionRequest request) {
        validateAdminAccess(admin);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Cannot ban admin users");
        }

        user.setAccountStatus(AccountStatus.BANNED);
        userRepository.save(user);

        logModerationAction(admin, user, "BAN", request.getReason());
    }

    @Transactional
    public void unsuspendUser(Long userId, User admin) {
        validateAdminAccess(admin);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setSuspensionStartAt(null);
        user.setSuspensionEndAt(null);
        userRepository.save(user);

        logModerationAction(admin, user, "UNSUSPEND", "Account reactivated by admin");
    }

    @Transactional
    public void approveEvent(Long eventId, User admin) {
        validateAdminAccess(admin);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        event.setModerationStatus(EventModerationStatus.APPROVED);
        eventRepository.save(event);

        notificationService.createNotification(
                event.getOrganizer(),
                "Your event '" + event.getTitle() + "' has been approved"
        );
    }

    @Transactional
    public void rejectEvent(Long eventId, User admin, String reason) {
        validateAdminAccess(admin);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        event.setModerationStatus(EventModerationStatus.REJECTED);
        eventRepository.save(event);

        notificationService.createNotification(
                event.getOrganizer(),
                "Your event '" + event.getTitle() + "' was rejected. Reason: " + reason
        );
    }

    private void logModerationAction(User admin, User targetUser, String actionType, String reason) {
        ModerationAction action = ModerationAction.builder()
                .moderator(admin)
                .targetUser(targetUser)
                .actionType(actionType)
                .reason(reason)
                .build();

        moderationActionRepository.save(action);
    }
}
