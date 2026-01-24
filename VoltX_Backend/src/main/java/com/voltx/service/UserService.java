package com.voltx.service;

import com.voltx.dto.UserDTO;
import com.voltx.entity.User;
import com.voltx.enums.AccountStatus;
import com.voltx.enums.Role;
import com.voltx.exception.VoltXException;
import com.voltx.repository.UserRepository;
import com.voltx.util.UserMapper;
import com.voltx.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final LevelService levelService;

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new VoltXException("User not found", HttpStatus.NOT_FOUND));
        return UserMapper.toDTO(user);
    }

    @Transactional
    public UserDTO updateProfile(Long userId, UserDTO userDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new VoltXException("User not found", HttpStatus.NOT_FOUND));

        if (!ValidationUtils.isValidName(userDTO.getFirstName())) {
            throw new VoltXException("Invalid first name", HttpStatus.BAD_REQUEST);
        }

        user.setFirstName(ValidationUtils.sanitizeInput(userDTO.getFirstName()));
        user.setLastName(ValidationUtils.sanitizeInput(userDTO.getLastName()));
        user.setUpdatedAt(LocalDateTime.now());

        return UserMapper.toDTO(userRepository.save(user));
    }

    @Transactional
    public UserDTO addAdrenalinePoints(Long userId, int points) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new VoltXException("User not found", HttpStatus.NOT_FOUND));

        user.setAdrenalinePoints(user.getAdrenalinePoints() + points);
        int newLevel = levelService.calculateLevel(user.getAdrenalinePoints());
        user.setLevel(newLevel);
        user.setUpdatedAt(LocalDateTime.now());

        return UserMapper.toDTO(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByAccountStatus(AccountStatus.ACTIVE);
        
        return Map.of(
                "total", totalUsers,
                "active", activeUsers
        );
    }
}
