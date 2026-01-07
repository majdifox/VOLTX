package com.voltx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberCardResponse {

    private Long membershipId;
    private UserCardResponse user;
    private String status;
    private String kickReason;
    private String appliedAt;
    private String decidedAt;
}
