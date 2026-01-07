package com.voltx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String gender;
    private String birthday;
    private String profilePicture;
    private String bannerPicture;
    private String country;
    private String countryFlag;
    private String city;
    private String phoneNumber;
    private String bio;
    private String role;
    private String accountStatus;
    private boolean verified;
    private int adrenalinePoints;
    private int level;
    private String suspensionEndAt;
    private int suspensionCount;
    private long followersCount;
    private long followingCount;
    private boolean isFollowing;
    private String createdAt;
}
