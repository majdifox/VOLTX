package com.voltx.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateEventRequest {

    @NotBlank(message = "Event name is required")
    private String name;

    private String description;

    @NotBlank(message = "Risk level is required")
    private String riskLevel;

    private String location;

    private String safetyRules;

    @NotNull(message = "Event date is required")
    private String eventDate;

    private String deadline;

    private Integer memberLimit;

    private Integer minLevel;

    private Integer rewardPoints;
}
