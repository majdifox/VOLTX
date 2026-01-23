package com.voltx.util;

import com.voltx.dto.UserDTO;
import com.voltx.entity.User;

public final class UserMapper {

    public static UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }

        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .adrenalinePoints(user.getAdrenalinePoints())
                .level(user.getLevel())
                .levelTitle(getLevelTitle(user.getLevel()))
                .suspensionCount(user.getSuspensionCount())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public static User toEntity(UserDTO userDTO) {
        if (userDTO == null) {
            return null;
        }

        User user = new User();
        user.setId(userDTO.getId());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setRole(userDTO.getRole());
        user.setAccountStatus(userDTO.getAccountStatus());
        user.setAdrenalinePoints(userDTO.getAdrenalinePoints());
        user.setLevel(userDTO.getLevel());
        user.setSuspensionCount(userDTO.getSuspensionCount());
        return user;
    }

    private static String getLevelTitle(int level) {
        // This will be replaced with proper level service lookup later
        return switch (level) {
            case 1 -> "Novice Explorer";
            case 2 -> "Thrill Seeker";
            case 3 -> "Risk Taker";
            case 4 -> "Adrenaline Junkie";
            case 5 -> "Extreme Athlete";
            default -> level <= 15 ? "VoltX Warrior" : "VoltX Master";
        };
    }

    private UserMapper() {}
}