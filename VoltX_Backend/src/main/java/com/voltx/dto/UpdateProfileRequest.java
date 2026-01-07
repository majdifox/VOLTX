package com.voltx.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {

    private String firstName;
    private String lastName;
    private String gender;
    private String birthday;
    private String country;
    private String countryFlag;
    private String city;
    private String phoneNumber;
    private String bio;
}
