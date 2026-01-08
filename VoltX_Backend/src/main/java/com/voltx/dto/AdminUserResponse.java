package com.voltx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String profilePicture;
    private String role;
    private String accountStatus;
    private boolean verified;
    private int adrenalinePoints;
    private int level;
    private String suspensionEndAt;
    private int suspensionCount;
    private String createdAt;
}
