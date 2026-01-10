package com.voltx.config;

import com.voltx.entity.User;
import com.voltx.enums.AccountStatus;
import com.voltx.enums.Role;
import com.voltx.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createAdminUser();
    }

    private void createAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("User")
                    .username("admin")
                    .email("admin@voltx.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .accountStatus(AccountStatus.ACTIVE)
                    .verified(true)
                    .adrenalinePoints(10000)
                    .level(15)
                    .suspensionCount(0)
                    .build();

            userRepository.save(admin);
            log.info("Created admin user: admin/admin123");
        }
    }
}