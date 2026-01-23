package com.voltx.dto;

import com.voltx.enums.AccountStatus;
import com.voltx.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private Role role;
    private AccountStatus accountStatus;
    private int adrenalinePoints;
    private int level;
    private String levelTitle;
    private int suspensionCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Helper method to get full name
    public String getFullName() {
        return firstName + " " + lastName;
    }

    // Helper method to check if user is active
    public boolean isActive() {
        return AccountStatus.ACTIVE.equals(accountStatus);
    }
}