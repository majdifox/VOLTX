package com.voltx.controller;

import com.voltx.dto.ApiResponse;
import com.voltx.service.DataExportService;
import com.voltx.service.DataExportService.ExportDataType;
import com.voltx.service.DataExportService.ExportFormat;
import com.voltx.service.DataExportService.ExportRequest;
import com.voltx.util.SearchUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * REST controller for data export operations
 */
@RestController
@RequestMapping("/api/export")
@Tag(name = "Data Export", description = "Export data in various formats")
public class DataExportController {

    private final DataExportService dataExportService;

    @Autowired
    public DataExportController(DataExportService dataExportService) {
        this.dataExportService = dataExportService;
    }

    /**
     * Export users data
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @Operation(summary = "Export users", description = "Export users data in specified format")
    public ResponseEntity<?> exportUsers(
            @Parameter(description = "Export format") @RequestParam(defaultValue = "CSV") ExportFormat format,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "1000") int size,
            @Parameter(description = "Status filter") @RequestParam(required = false) String status,
            @Parameter(description = "Level filter") @RequestParam(required = false) Integer level,
            HttpServletResponse response
    ) {
        try {
            SearchUtils.SpecificationBuilder<?> specBuilder = new SearchUtils.SpecificationBuilder<>();

            if (status != null && !status.trim().isEmpty()) {
                specBuilder.with("status", "eq", status);
            }
            if (level != null) {
                specBuilder.with("level", "eq", level);
            }

            Specification<?> spec = specBuilder.build();
            Pageable pageable = PageRequest.of(page, size);

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            ByteArrayOutputStream outputStream;
            String filename;
            String contentType;

            switch (format) {
                case CSV:
                    outputStream = dataExportService.exportUsersToCSV((Specification) spec, pageable);
                    filename = String.format("users_export_%s.csv", timestamp);
                    contentType = "text/csv";
                    break;
                case EXCEL:
                    outputStream = dataExportService.exportUsersToExcel((Specification) spec, pageable);
                    filename = String.format("users_export_%s.xlsx", timestamp);
                    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    break;
                case JSON:
                    ExportRequest request = new ExportRequest();
                    request.setDataType(ExportDataType.USERS);
                    request.setSpecification(spec);
                    request.setPageable(pageable);
                    outputStream = dataExportService.exportToJSON(request);
                    filename = String.format("users_export_%s.json", timestamp);
                    contentType = "application/json";
                    break;
                default:
                    return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Unsupported export format: " + format));
            }

            return createDownloadResponse(outputStream, filename, contentType);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Export failed: " + e.getMessage()));
        }
    }

    /**
     * Export activities data
     */
    @GetMapping("/activities")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @Operation(summary = "Export activities", description = "Export activities data in specified format")
    public ResponseEntity<?> exportActivities(
            @Parameter(description = "Export format") @RequestParam(defaultValue = "CSV") ExportFormat format,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "1000") int size,
            @Parameter(description = "Category filter") @RequestParam(required = false) String category,
            @Parameter(description = "Difficulty filter") @RequestParam(required = false) String difficulty,
            @Parameter(description = "Status filter") @RequestParam(required = false) String status,
            HttpServletResponse response
    ) {
        try {
            SearchUtils.SpecificationBuilder<?> specBuilder = new SearchUtils.SpecificationBuilder<>();

            if (category != null && !category.trim().isEmpty()) {
                specBuilder.with("category", "eq", category);
            }
            if (difficulty != null && !difficulty.trim().isEmpty()) {
                specBuilder.with("difficulty", "eq", difficulty);
            }
            if (status != null && !status.trim().isEmpty()) {
                specBuilder.with("status", "eq", status);
            }

            Specification<?> spec = specBuilder.build();
            Pageable pageable = PageRequest.of(page, size);

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            ByteArrayOutputStream outputStream;
            String filename;
            String contentType;

            switch (format) {
                case CSV:
                    outputStream = dataExportService.exportActivitiesToCSV((Specification) spec, pageable);
                    filename = String.format("activities_export_%s.csv", timestamp);
                    contentType = "text/csv";
                    break;
                case EXCEL:
                    // For Excel format, we'll use JSON export for activities (can be extended)
                    ExportRequest request = new ExportRequest();
                    request.setDataType(ExportDataType.ACTIVITIES);
                    request.setSpecification(spec);
                    request.setPageable(pageable);
                    outputStream = dataExportService.exportToJSON(request);
                    filename = String.format("activities_export_%s.json", timestamp);
                    contentType = "application/json";
                    break;
                case JSON:
                    ExportRequest jsonRequest = new ExportRequest();
                    jsonRequest.setDataType(ExportDataType.ACTIVITIES);
                    jsonRequest.setSpecification(spec);
                    jsonRequest.setPageable(pageable);
                    outputStream = dataExportService.exportToJSON(jsonRequest);
                    filename = String.format("activities_export_%s.json", timestamp);
                    contentType = "application/json";
                    break;
                default:
                    return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Unsupported export format: " + format));
            }

            return createDownloadResponse(outputStream, filename, contentType);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Export failed: " + e.getMessage()));
        }
    }

    /**
     * Export achievements data
     */
    @GetMapping("/achievements")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @Operation(summary = "Export achievements", description = "Export achievements data in specified format")
    public ResponseEntity<?> exportAchievements(
            @Parameter(description = "Export format") @RequestParam(defaultValue = "CSV") ExportFormat format,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "1000") int size,
            @Parameter(description = "Category filter") @RequestParam(required = false) String category,
            @Parameter(description = "Rarity filter") @RequestParam(required = false) String rarity,
            @Parameter(description = "Active only") @RequestParam(defaultValue = "true") boolean activeOnly,
            HttpServletResponse response
    ) {
        try {
            SearchUtils.SpecificationBuilder<?> specBuilder = new SearchUtils.SpecificationBuilder<>();

            if (category != null && !category.trim().isEmpty()) {
                specBuilder.with("category", "eq", category);
            }
            if (rarity != null && !rarity.trim().isEmpty()) {
                specBuilder.with("rarity", "eq", rarity);
            }
            if (activeOnly) {
                specBuilder.with("isActive", "eq", true);
            }

            Specification<?> spec = specBuilder.build();
            Pageable pageable = PageRequest.of(page, size);

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            ByteArrayOutputStream outputStream;
            String filename;
            String contentType;

            switch (format) {
                case CSV:
                    outputStream = dataExportService.exportAchievementsToCSV((Specification) spec, pageable);
                    filename = String.format("achievements_export_%s.csv", timestamp);
                    contentType = "text/csv";
                    break;
                case EXCEL:
                case JSON:
                    ExportRequest request = new ExportRequest();
                    request.setDataType(ExportDataType.ACHIEVEMENTS);
                    request.setSpecification(spec);
                    request.setPageable(pageable);
                    outputStream = dataExportService.exportToJSON(request);
                    filename = String.format("achievements_export_%s.json", timestamp);
                    contentType = "application/json";
                    break;
                default:
                    return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Unsupported export format: " + format));
            }

            return createDownloadResponse(outputStream, filename, contentType);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Export failed: " + e.getMessage()));
        }
    }

    /**
     * Export all data
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export all data", description = "Export entire platform data")
    public ResponseEntity<?> exportAllData(
            @Parameter(description = "Export format") @RequestParam(defaultValue = "JSON") ExportFormat format,
            HttpServletResponse response
    ) {
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            ByteArrayOutputStream outputStream;
            String filename;
            String contentType;

            switch (format) {
                case JSON:
                    ExportRequest request = new ExportRequest();
                    request.setDataType(ExportDataType.ALL);
                    request.setFilters(new HashMap<>());
                    outputStream = dataExportService.exportToJSON(request);
                    filename = String.format("voltx_full_export_%s.json", timestamp);
                    contentType = "application/json";
                    break;
                case EXCEL:
                    // For full data export in Excel, use analytics export
                    CompletableFuture<ByteArrayOutputStream> futureStream = dataExportService.generateAnalyticsExport();
                    outputStream = futureStream.get(); // This will block, consider async handling
                    filename = String.format("voltx_analytics_export_%s.xlsx", timestamp);
                    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    break;
                default:
                    return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Unsupported export format for full data: " + format));
            }

            return createDownloadResponse(outputStream, filename, contentType);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Full export failed: " + e.getMessage()));
        }
    }

    /**
     * Export analytics report
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @Operation(summary = "Export analytics", description = "Export comprehensive analytics report")
    public ResponseEntity<?> exportAnalytics(
            @Parameter(description = "Export format") @RequestParam(defaultValue = "EXCEL") ExportFormat format,
            HttpServletResponse response
    ) {
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            ByteArrayOutputStream outputStream;
            String filename;
            String contentType;

            switch (format) {
                case EXCEL:
                    CompletableFuture<ByteArrayOutputStream> futureStream = dataExportService.generateAnalyticsExport();
                    outputStream = futureStream.get();
                    filename = String.format("voltx_analytics_%s.xlsx", timestamp);
                    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    break;
                case JSON:
                    ExportRequest request = new ExportRequest();
                    request.setDataType(ExportDataType.ANALYTICS);
                    outputStream = dataExportService.exportToJSON(request);
                    filename = String.format("voltx_analytics_%s.json", timestamp);
                    contentType = "application/json";
                    break;
                default:
                    return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Unsupported export format for analytics: " + format));
            }

            return createDownloadResponse(outputStream, filename, contentType);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Analytics export failed: " + e.getMessage()));
        }
    }

    /**
     * Get export status and available formats
     */
    @GetMapping("/status")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Get export status", description = "Get available export formats and data types")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getExportStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("availableFormats", ExportFormat.values());
        status.put("availableDataTypes", ExportDataType.values());
        status.put("maxBatchSize", 10000);
        status.put("supportedFilters", Map.of(
            "users", new String[]{"status", "level", "dateRange"},
            "activities", new String[]{"category", "difficulty", "status", "dateRange"},
            "achievements", new String[]{"category", "rarity", "isActive"}
        ));
        status.put("exportLimitations", Map.of(
            "adminOnly", new String[]{"all", "analytics"},
            "moderatorAccess", new String[]{"users", "activities", "achievements"},
            "userAccess", new String[]{"status"}
        ));

        return ResponseEntity.ok(ApiResponse.success("Export status retrieved", status));
    }

    /**
     * Initiate async export (for large datasets)
     */
    @PostMapping("/async")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Initiate async export", description = "Start asynchronous export for large datasets")
    public ResponseEntity<ApiResponse<Map<String, Object>>> initiateAsyncExport(
            @RequestBody AsyncExportRequest request
    ) {
        try {
            // This would typically use a job queue system like Redis or RabbitMQ
            String exportId = "export_" + System.currentTimeMillis();

            Map<String, Object> response = new HashMap<>();
            response.put("exportId", exportId);
            response.put("status", "INITIATED");
            response.put("estimatedCompletionTime", "5-10 minutes");
            response.put("checkStatusUrl", "/api/export/async/" + exportId + "/status");
            response.put("downloadUrl", "/api/export/async/" + exportId + "/download");

            return ResponseEntity.ok(ApiResponse.success("Async export initiated", response));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to initiate async export: " + e.getMessage()));
        }
    }

    private ResponseEntity<ByteArrayResource> createDownloadResponse(
            ByteArrayOutputStream outputStream, String filename, String contentType) {

        ByteArrayResource resource = new ByteArrayResource(outputStream.toByteArray());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .contentLength(resource.contentLength())
                .body(resource);
    }

    // DTOs
    public static class AsyncExportRequest {
        private ExportDataType dataType;
        private ExportFormat format;
        private Map<String, Object> filters;
        private String email; // For notification when export is ready

        // Getters and Setters
        public ExportDataType getDataType() { return dataType; }
        public void setDataType(ExportDataType dataType) { this.dataType = dataType; }

        public ExportFormat getFormat() { return format; }
        public void setFormat(ExportFormat format) { this.format = format; }

        public Map<String, Object> getFilters() { return filters; }
        public void setFilters(Map<String, Object> filters) { this.filters = filters; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
}