package com.voltx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {

    private Long id;
    private UserCardResponse organizer;
    private String name;
    private String description;
    private String riskLevel;
    private String location;
    private String safetyRules;
    private String eventDate;
    private String deadline;
    private Integer memberLimit;
    private Integer minLevel;
    private Integer rewardPoints;
    private String moderationStatus;
    private String lifecycleStatus;
    private String eventCode;
    private int acceptedMembersCount;
    private int pendingMembersCount;
    private boolean hasApplied;
    private String membershipStatus;
    private List<MemberCardResponse> members;
    private String createdAt;
}
