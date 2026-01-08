package com.voltx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStats {

    private long totalUsers;
    private long activeUsers;
    private long suspendedUsers;
    private long bannedUsers;
    private long verifiedUsers;
    private long pendingVerifications;
    private long totalEvents;
    private long pendingEvents;
    private long approvedEvents;
    private long totalPosts;
}
