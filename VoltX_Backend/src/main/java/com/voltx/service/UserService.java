package com.voltx.service;

import com.voltx.dto.UpdateProfileRequest;
import com.voltx.dto.UserCardResponse;
import com.voltx.dto.UserProfileResponse;
import com.voltx.entity.Follow;
import com.voltx.entity.User;
import com.voltx.exception.BadRequestException;
import com.voltx.exception.ResourceNotFoundException;
import com.voltx.repository.FollowRepository;
import com.voltx.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final GamificationService gamificationService;
    private final FileStorageService fileStorageService;

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

    @Transactional
    public User updateProfile(User user, UpdateProfileRequest request) {
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getBirthday() != null) {
            LocalDate birthday = LocalDate.parse(request.getBirthday(), DateTimeFormatter.ISO_DATE);
            user.setBirthday(birthday);
        }
        if (request.getCountry() != null) {
            user.setCountry(request.getCountry());
        }
        if (request.getCountryFlag() != null) {
            user.setCountryFlag(request.getCountryFlag());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        return userRepository.save(user);
    }

    @Transactional
    public void followUser(User follower, Long followingId) {
        if (follower.getId().equals(followingId)) {
            throw new BadRequestException("Cannot follow yourself");
        }

        User following = findById(followingId);

        if (followRepository.existsByFollowerAndFollowing(follower, following)) {
            throw new BadRequestException("Already following this user");
        }

        Follow follow = Follow.builder()
                .follower(follower)
                .following(following)
                .build();

        followRepository.save(follow);
    }

    @Transactional
    public void unfollowUser(User follower, Long followingId) {
        User following = findById(followingId);

        Follow follow = followRepository.findByFollowerAndFollowing(follower, following)
                .orElseThrow(() -> new BadRequestException("Not following this user"));

        followRepository.delete(follow);
    }

    @Transactional
    public User updateProfilePicture(User user, MultipartFile file) throws IOException {
        if (user.getProfilePicture() != null) {
            fileStorageService.deleteFile(user.getProfilePicture());
        }

        String filePath = fileStorageService.storeFile(file, "profiles");
        user.setProfilePicture(filePath);
        return userRepository.save(user);
    }

    @Transactional
    public User updateBannerPicture(User user, MultipartFile file) throws IOException {
        if (user.getBannerPicture() != null) {
            fileStorageService.deleteFile(user.getBannerPicture());
        }

        String filePath = fileStorageService.storeFile(file, "banners");
        user.setBannerPicture(filePath);
        return userRepository.save(user);
    }
}
