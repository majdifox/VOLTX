package com.voltx.entity;

import com.voltx.enums.RiskLevel;
import com.voltx.enums.EventModerationStatus;
import com.voltx.enums.EventLifecycleStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    private String location;

    @Column(length = 1000)
    private String safetyRules;

    private LocalDateTime eventDate;

    private LocalDateTime deadline;

    private Integer memberLimit;

    private Integer minLevel;

    private Integer rewardPoints;

    @Enumerated(EnumType.STRING)
    private EventModerationStatus moderationStatus;

    @Enumerated(EnumType.STRING)
    private EventLifecycleStatus lifecycleStatus;

    private String eventCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (moderationStatus == null) {
            moderationStatus = EventModerationStatus.PENDING_REVIEW;
        }
        if (lifecycleStatus == null) {
            lifecycleStatus = EventLifecycleStatus.UPCOMING;
        }
    }
}
