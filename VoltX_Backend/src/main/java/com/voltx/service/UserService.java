package com.voltx.service;

import com.voltx.dto.UserCardResponse;
import com.voltx.dto.UserProfileResponse;
import com.voltx.entity.User;
import com.voltx.exception.ResourceNotFoundException;
import com.voltx.repository.FollowRepository;
import com.voltx.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final GamificationService gamificationService;

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserProfileResponse toProfileResponse(User user, Long currentUserId) {
        long followersCount = followRepository.countByFollowing(user);
        long followingCount = followRepository.countByFollower(user);
        boolean isFollowing = false;

        if (currentUserId != null && !currentUserId.equals(user.getId())) {
            User currentUser = findById(currentUserId);
            isFollowing = followRepository.existsByFollowerAndFollowing(currentUser, user);
        }

        return UserProfileResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .gender(user.getGender())
                .birthday(user.getBirthday() != null ? user.getBirthday().toString() : null)
                .profilePicture(user.getProfilePicture())
                .bannerPicture(user.getBannerPicture())
                .country(user.getCountry())
                .countryFlag(user.getCountryFlag())
                .city(user.getCity())
                .phoneNumber(user.getPhoneNumber())
                .bio(user.getBio())
                .role(user.getRole().name())
                .accountStatus(user.getAccountStatus() != null ? user.getAccountStatus().name() : "ACTIVE")
                .verified(user.isVerified())
                .adrenalinePoints(user.getAdrenalinePoints())
                .level(user.getLevel())
                .suspensionEndAt(user.getSuspensionEndAt() != null ? user.getSuspensionEndAt().toString() : null)
                .suspensionCount(user.getSuspensionCount())
                .followersCount(followersCount)
                .followingCount(followingCount)
                .isFollowing(isFollowing)
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }

    public UserCardResponse toCardResponse(User user) {
        return UserCardResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .profilePicture(user.getProfilePicture())
                .country(user.getCountry())
                .countryFlag(user.getCountryFlag())
                .role(user.getRole().name())
                .verified(user.isVerified())
                .adrenalinePoints(user.getAdrenalinePoints())
                .level(user.getLevel())
                .build();
    }
}
