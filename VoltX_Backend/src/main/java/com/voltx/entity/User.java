package com.voltx.entity;

import com.voltx.enums.AccountStatus;
import com.voltx.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String gender;

    private LocalDate birthday;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String profilePicture;

    private String bannerPicture;

    private String country;

    private String countryFlag;

    private String city;

    private String phoneNumber;

    @Column(length = 500)
    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    private AccountStatus accountStatus;

    private boolean verified;

    private int adrenalinePoints;

    private int level;

    private LocalDateTime suspensionStartAt;

    private LocalDateTime suspensionEndAt;

    private int suspensionCount;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (accountStatus == null) {
            accountStatus = AccountStatus.ACTIVE;
        }
    }
}
