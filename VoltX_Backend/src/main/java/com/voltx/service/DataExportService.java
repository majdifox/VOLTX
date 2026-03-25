package com.voltx.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voltx.entity.User;
import com.voltx.entity.Activity;
import com.voltx.entity.Achievement;
import com.voltx.entity.UserAchievement;
import com.voltx.repository.UserRepository;
import com.voltx.repository.ActivityRepository;
import com.voltx.repository.AchievementRepository;
import com.voltx.repository.UserAchievementRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Service for exporting data in various formats (CSV, Excel, JSON)
 */
@Service
public class DataExportService {

    private static final Logger logger = LoggerFactory.getLogger(DataExportService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public DataExportService(UserRepository userRepository,
                           ActivityRepository activityRepository,
                           AchievementRepository achievementRepository,
                           UserAchievementRepository userAchievementRepository,
                           ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Export users to CSV format
     */
    public ByteArrayOutputStream exportUsersToCSV(Specification<User> spec, Pageable pageable) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (CSVPrinter csvPrinter = new CSVPrinter(new OutputStreamWriter(outputStream),
                CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

            // Write CSV headers
            csvPrinter.printRecord("ID", "Username", "Email", "First Name", "Last Name",
                                 "Level", "Adrenaline Points", "Status", "Created At", "Last Login", "Bio");

            // Fetch and write user data in batches
            Page<User> userPage = userRepository.findAll(spec, pageable);
            do {
                for (User user : userPage.getContent()) {
                    csvPrinter.printRecord(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getLevel(),
                        user.getAdrenalinePoints(),
                        user.getStatus(),
                        user.getCreatedAt() != null ? user.getCreatedAt().format(DATE_FORMATTER) : "",
                        user.getLastLoginDate() != null ? user.getLastLoginDate().format(DATE_FORMATTER) : "",
                        user.getBio() != null ? user.getBio() : ""
                    );
                }

                if (userPage.hasNext()) {
                    pageable = userPage.nextPageable();
                    userPage = userRepository.findAll(spec, pageable);
                } else {
                    break;
                }
            } while (true);
        }

        return outputStream;
    }

    /**
     * Export activities to CSV format
     */
    public ByteArrayOutputStream exportActivitiesToCSV(Specification<Activity> spec, Pageable pageable) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (CSVPrinter csvPrinter = new CSVPrinter(new OutputStreamWriter(outputStream),
                CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

            // Write CSV headers
            csvPrinter.printRecord("ID", "Title", "Description", "Category", "Difficulty",
                                 "Location", "Adrenaline Points", "Activity Date", "Duration Minutes",
                                 "Max Participants", "Current Participants", "Status", "Created At");

            // Fetch and write activity data in batches
            Page<Activity> activityPage = activityRepository.findAll(spec, pageable);
            do {
                for (Activity activity : activityPage.getContent()) {
                    csvPrinter.printRecord(
                        activity.getId(),
                        activity.getTitle(),
                        activity.getDescription(),
                        activity.getCategory(),
                        activity.getDifficulty(),
                        activity.getLocation(),
                        activity.getAdrenalinePoints(),
                        activity.getActivityDate() != null ? activity.getActivityDate().format(DATE_FORMATTER) : "",
                        activity.getDurationMinutes(),
                        activity.getMaxParticipants(),
                        activity.getCurrentParticipants(),
                        activity.getStatus(),
                        activity.getCreatedAt() != null ? activity.getCreatedAt().format(DATE_FORMATTER) : ""
                    );
                }

                if (activityPage.hasNext()) {
                    pageable = activityPage.nextPageable();
                    activityPage = activityRepository.findAll(spec, pageable);
                } else {
                    break;
                }
            } while (true);
        }

        return outputStream;
    }

    /**
     * Export achievements to CSV format
     */
    public ByteArrayOutputStream exportAchievementsToCSV(Specification<Achievement> spec, Pageable pageable) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (CSVPrinter csvPrinter = new CSVPrinter(new OutputStreamWriter(outputStream),
                CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

            // Write CSV headers
            csvPrinter.printRecord("ID", "Name", "Description", "Category", "Rarity",
                                 "Points", "Icon URL", "Criteria", "Is Active", "Created At");

            // Fetch and write achievement data in batches
            Page<Achievement> achievementPage = achievementRepository.findAll(spec, pageable);
            do {
                for (Achievement achievement : achievementPage.getContent()) {
                    csvPrinter.printRecord(
                        achievement.getId(),
                        achievement.getName(),
                        achievement.getDescription(),
                        achievement.getCategory(),
                        achievement.getRarity(),
                        achievement.getPoints(),
                        achievement.getIconUrl(),
                        achievement.getCriteria(),
                        achievement.isActive(),
                        achievement.getCreatedAt() != null ? achievement.getCreatedAt().format(DATE_FORMATTER) : ""
                    );
                }

                if (achievementPage.hasNext()) {
                    pageable = achievementPage.nextPageable();
                    achievementPage = achievementRepository.findAll(spec, pageable);
                } else {
                    break;
                }
            } while (true);
        }

        return outputStream;
    }

    /**
     * Export users to Excel format
     */
    public ByteArrayOutputStream exportUsersToExcel(Specification<User> spec, Pageable pageable) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Users");

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Username", "Email", "First Name", "Last Name",
                              "Level", "Adrenaline Points", "Status", "Created At", "Last Login", "Bio"};

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Fetch and write user data
            int rowNum = 1;
            Page<User> userPage = userRepository.findAll(spec, pageable);
            do {
                for (User user : userPage.getContent()) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(user.getId());
                    row.createCell(1).setCellValue(user.getUsername());
                    row.createCell(2).setCellValue(user.getEmail());
                    row.createCell(3).setCellValue(user.getFirstName());
                    row.createCell(4).setCellValue(user.getLastName());
                    row.createCell(5).setCellValue(user.getLevel());
                    row.createCell(6).setCellValue(user.getAdrenalinePoints());
                    row.createCell(7).setCellValue(user.getStatus());
                    row.createCell(8).setCellValue(user.getCreatedAt() != null ? user.getCreatedAt().format(DATE_FORMATTER) : "");
                    row.createCell(9).setCellValue(user.getLastLoginDate() != null ? user.getLastLoginDate().format(DATE_FORMATTER) : "");
                    row.createCell(10).setCellValue(user.getBio() != null ? user.getBio() : "");
                }

                if (userPage.hasNext()) {
                    pageable = userPage.nextPageable();
                    userPage = userRepository.findAll(spec, pageable);
                } else {
                    break;
                }
            } while (true);

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
        }

        return outputStream;
    }

    /**
     * Export data to JSON format
     */
    public ByteArrayOutputStream exportToJSON(ExportRequest request) throws IOException {
        Map<String, Object> exportData = new HashMap<>();
        exportData.put("exportTimestamp", LocalDateTime.now().format(DATE_FORMATTER));
        exportData.put("exportType", request.getDataType());
        exportData.put("filters", request.getFilters());

        switch (request.getDataType()) {
            case USERS:
                List<User> users = getAllUsers(request.getSpecification(), request.getPageable());
                exportData.put("users", users.stream().map(this::sanitizeUser).collect(Collectors.toList()));
                exportData.put("totalCount", users.size());
                break;

            case ACTIVITIES:
                List<Activity> activities = getAllActivities(request.getSpecification(), request.getPageable());
                exportData.put("activities", activities.stream().map(this::sanitizeActivity).collect(Collectors.toList()));
                exportData.put("totalCount", activities.size());
                break;

            case ACHIEVEMENTS:
                List<Achievement> achievements = getAllAchievements(request.getSpecification(), request.getPageable());
                exportData.put("achievements", achievements.stream().map(this::sanitizeAchievement).collect(Collectors.toList()));
                exportData.put("totalCount", achievements.size());
                break;

            case ALL:
                exportData.put("users", getAllUsers(null, Pageable.unpaged()).stream().map(this::sanitizeUser).collect(Collectors.toList()));
                exportData.put("activities", getAllActivities(null, Pageable.unpaged()).stream().map(this::sanitizeActivity).collect(Collectors.toList()));
                exportData.put("achievements", getAllAchievements(null, Pageable.unpaged()).stream().map(this::sanitizeAchievement).collect(Collectors.toList()));
                break;

            case ANALYTICS:
                exportData.putAll(generateAnalyticsData());
                break;
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        objectMapper.writeValue(outputStream, exportData);
        return outputStream;
    }

    /**
     * Generate comprehensive analytics export
     */
    @Async
    public CompletableFuture<ByteArrayOutputStream> generateAnalyticsExport() throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try (Workbook workbook = new XSSFWorkbook()) {
            // User Analytics Sheet
            createUserAnalyticsSheet(workbook);

            // Activity Analytics Sheet
            createActivityAnalyticsSheet(workbook);

            // Achievement Analytics Sheet
            createAchievementAnalyticsSheet(workbook);

            // Summary Sheet
            createSummarySheet(workbook);

            workbook.write(outputStream);
        }

        return CompletableFuture.completedFuture(outputStream);
    }

    private void createUserAnalyticsSheet(Workbook workbook) {
        Sheet sheet = workbook.createSheet("User Analytics");

        // Headers and styling
        CellStyle headerStyle = createHeaderStyle(workbook);
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Metric", "Value", "Percentage"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 1;

        // User statistics
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus("ACTIVE");
        long inactiveUsers = totalUsers - activeUsers;

        addAnalyticsRow(sheet, rowNum++, "Total Users", totalUsers, 100.0);
        addAnalyticsRow(sheet, rowNum++, "Active Users", activeUsers, (double) activeUsers / totalUsers * 100);
        addAnalyticsRow(sheet, rowNum++, "Inactive Users", inactiveUsers, (double) inactiveUsers / totalUsers * 100);

        // Level distribution
        Map<Integer, Long> levelDistribution = userRepository.findAll().stream()
            .collect(Collectors.groupingBy(User::getLevel, Collectors.counting()));

        for (Map.Entry<Integer, Long> entry : levelDistribution.entrySet()) {
            addAnalyticsRow(sheet, rowNum++, "Level " + entry.getKey() + " Users",
                          entry.getValue(), (double) entry.getValue() / totalUsers * 100);
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createActivityAnalyticsSheet(Workbook workbook) {
        Sheet sheet = workbook.createSheet("Activity Analytics");

        CellStyle headerStyle = createHeaderStyle(workbook);
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Metric", "Value", "Percentage"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 1;

        // Activity statistics
        long totalActivities = activityRepository.count();

        addAnalyticsRow(sheet, rowNum++, "Total Activities", totalActivities, 100.0);

        // Category distribution
        Map<String, Long> categoryDistribution = activityRepository.findAll().stream()
            .collect(Collectors.groupingBy(activity ->
                activity.getCategory() != null ? activity.getCategory().toString() : "Unknown",
                Collectors.counting()));

        for (Map.Entry<String, Long> entry : categoryDistribution.entrySet()) {
            addAnalyticsRow(sheet, rowNum++, entry.getKey() + " Activities",
                          entry.getValue(), (double) entry.getValue() / totalActivities * 100);
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createAchievementAnalyticsSheet(Workbook workbook) {
        Sheet sheet = workbook.createSheet("Achievement Analytics");

        CellStyle headerStyle = createHeaderStyle(workbook);
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Metric", "Value", "Percentage"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 1;

        // Achievement statistics
        long totalAchievements = achievementRepository.count();
        long totalUserAchievements = userAchievementRepository.count();

        addAnalyticsRow(sheet, rowNum++, "Total Achievements", totalAchievements, 100.0);
        addAnalyticsRow(sheet, rowNum++, "Total User Achievements", totalUserAchievements, 0.0);

        // Rarity distribution
        Map<String, Long> rarityDistribution = achievementRepository.findAll().stream()
            .collect(Collectors.groupingBy(achievement ->
                achievement.getRarity() != null ? achievement.getRarity().toString() : "Unknown",
                Collectors.counting()));

        for (Map.Entry<String, Long> entry : rarityDistribution.entrySet()) {
            addAnalyticsRow(sheet, rowNum++, entry.getKey() + " Achievements",
                          entry.getValue(), (double) entry.getValue() / totalAchievements * 100);
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createSummarySheet(Workbook workbook) {
        Sheet sheet = workbook.createSheet("Summary");

        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);

        int rowNum = 0;

        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("VoltX Platform Summary Report");
        titleCell.setCellStyle(titleStyle);

        rowNum++; // Empty row

        // Summary statistics
        Row headerRow = sheet.createRow(rowNum++);
        String[] headers = {"Category", "Total Count", "Active/Available"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        addSummaryRow(sheet, rowNum++, "Users", userRepository.count(), userRepository.countByStatus("ACTIVE"));
        addSummaryRow(sheet, rowNum++, "Activities", activityRepository.count(), activityRepository.countByStatus("ACTIVE"));
        addSummaryRow(sheet, rowNum++, "Achievements", achievementRepository.count(), achievementRepository.countByIsActive(true));
        addSummaryRow(sheet, rowNum++, "User Achievements", userAchievementRepository.count(), 0);

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    // Helper methods
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return headerStyle;
    }

    private void addAnalyticsRow(Sheet sheet, int rowNum, String metric, long value, double percentage) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(metric);
        row.createCell(1).setCellValue(value);
        row.createCell(2).setCellValue(String.format("%.2f%%", percentage));
    }

    private void addSummaryRow(Sheet sheet, int rowNum, String category, long total, long active) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(category);
        row.createCell(1).setCellValue(total);
        row.createCell(2).setCellValue(active);
    }

    private List<User> getAllUsers(Specification<User> spec, Pageable pageable) {
        if (spec == null) {
            return userRepository.findAll();
        }
        return userRepository.findAll(spec, pageable).getContent();
    }

    private List<Activity> getAllActivities(Specification<Activity> spec, Pageable pageable) {
        if (spec == null) {
            return activityRepository.findAll();
        }
        return activityRepository.findAll(spec, pageable).getContent();
    }

    private List<Achievement> getAllAchievements(Specification<Achievement> spec, Pageable pageable) {
        if (spec == null) {
            return achievementRepository.findAll();
        }
        return achievementRepository.findAll(spec, pageable).getContent();
    }

    private Map<String, Object> sanitizeUser(User user) {
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("username", user.getUsername());
        userData.put("email", user.getEmail());
        userData.put("firstName", user.getFirstName());
        userData.put("lastName", user.getLastName());
        userData.put("level", user.getLevel());
        userData.put("adrenalinePoints", user.getAdrenalinePoints());
        userData.put("status", user.getStatus());
        userData.put("createdAt", user.getCreatedAt());
        userData.put("lastLoginDate", user.getLastLoginDate());
        // Exclude sensitive data like password, email verification tokens, etc.
        return userData;
    }

    private Map<String, Object> sanitizeActivity(Activity activity) {
        Map<String, Object> activityData = new HashMap<>();
        activityData.put("id", activity.getId());
        activityData.put("title", activity.getTitle());
        activityData.put("description", activity.getDescription());
        activityData.put("category", activity.getCategory());
        activityData.put("difficulty", activity.getDifficulty());
        activityData.put("location", activity.getLocation());
        activityData.put("adrenalinePoints", activity.getAdrenalinePoints());
        activityData.put("activityDate", activity.getActivityDate());
        activityData.put("durationMinutes", activity.getDurationMinutes());
        activityData.put("maxParticipants", activity.getMaxParticipants());
        activityData.put("currentParticipants", activity.getCurrentParticipants());
        activityData.put("status", activity.getStatus());
        activityData.put("createdAt", activity.getCreatedAt());
        return activityData;
    }

    private Map<String, Object> sanitizeAchievement(Achievement achievement) {
        Map<String, Object> achievementData = new HashMap<>();
        achievementData.put("id", achievement.getId());
        achievementData.put("name", achievement.getName());
        achievementData.put("description", achievement.getDescription());
        achievementData.put("category", achievement.getCategory());
        achievementData.put("rarity", achievement.getRarity());
        achievementData.put("points", achievement.getPoints());
        achievementData.put("iconUrl", achievement.getIconUrl());
        achievementData.put("criteria", achievement.getCriteria());
        achievementData.put("isActive", achievement.isActive());
        achievementData.put("createdAt", achievement.getCreatedAt());
        return achievementData;
    }

    private Map<String, Object> generateAnalyticsData() {
        Map<String, Object> analytics = new HashMap<>();

        analytics.put("userStats", Map.of(
            "totalUsers", userRepository.count(),
            "activeUsers", userRepository.countByStatus("ACTIVE"),
            "avgLevel", userRepository.findAll().stream().mapToInt(User::getLevel).average().orElse(0.0),
            "totalPoints", userRepository.findAll().stream().mapToInt(User::getAdrenalinePoints).sum()
        ));

        analytics.put("activityStats", Map.of(
            "totalActivities", activityRepository.count(),
            "activeActivities", activityRepository.countByStatus("ACTIVE"),
            "avgDuration", activityRepository.findAll().stream().mapToInt(Activity::getDurationMinutes).average().orElse(0.0)
        ));

        analytics.put("achievementStats", Map.of(
            "totalAchievements", achievementRepository.count(),
            "activeAchievements", achievementRepository.countByIsActive(true),
            "totalUserAchievements", userAchievementRepository.count()
        ));

        return analytics;
    }

    // Export request DTO
    public static class ExportRequest {
        private ExportDataType dataType;
        private Specification<?> specification;
        private Pageable pageable;
        private Map<String, Object> filters;

        // Getters and Setters
        public ExportDataType getDataType() { return dataType; }
        public void setDataType(ExportDataType dataType) { this.dataType = dataType; }

        public Specification<?> getSpecification() { return specification; }
        public void setSpecification(Specification<?> specification) { this.specification = specification; }

        public Pageable getPageable() { return pageable; }
        public void setPageable(Pageable pageable) { this.pageable = pageable; }

        public Map<String, Object> getFilters() { return filters; }
        public void setFilters(Map<String, Object> filters) { this.filters = filters; }
    }

    public enum ExportDataType {
        USERS,
        ACTIVITIES,
        ACHIEVEMENTS,
        ALL,
        ANALYTICS
    }

    public enum ExportFormat {
        CSV,
        EXCEL,
        JSON
    }
}