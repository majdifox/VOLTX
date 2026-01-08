package com.voltx.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerificationReviewRequest {

    @NotBlank(message = "Decision is required")
    private String decision;

    private String reviewNote;
}
