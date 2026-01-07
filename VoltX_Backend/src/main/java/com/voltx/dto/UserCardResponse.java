package com.voltx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCardResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String profilePicture;
    private String country;
    private String countryFlag;
    private String role;
    private boolean verified;
    private int adrenalinePoints;
    private int level;
}
