package com.voltx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationRequestResponse {

    private Long id;
    private UserCardResponse user;
    private String documentType;
    private String documentImagePath;
    private String status;
    private String reviewNote;
    private String createdAt;
    private String reviewedAt;
}
