package com.voltx.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.time.Duration;
import java.util.List;

/**
 * Application-specific configuration properties
 */
@Component
@ConfigurationProperties(prefix = "app")
@Validated
public class ApplicationProperties {

    @NotBlank
    private String name = "VoltX Extreme Sports Platform";

    @NotBlank
    private String version = "1.0.0";

    @NotBlank
    private String description = "Extreme sports adventure platform with real-time features";

    @NotBlank
    private String website = "https://voltx.com";

    @Valid
    @NotNull
    private Admin admin = new Admin();

    @Valid
    @NotNull
    private Api api = new Api();

    @Valid
    @NotNull
    private Features features = new Features();

    @Valid
    @NotNull
    private Business business = new Business();

    @Valid
    @NotNull
    private Cors cors = new Cors();

    @Valid
    @NotNull
    private RateLimiting rateLimiting = new RateLimiting();

    @Valid
    @NotNull
    private External external = new External();

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public Admin getAdmin() { return admin; }
    public void setAdmin(Admin admin) { this.admin = admin; }

    public Api getApi() { return api; }
    public void setApi(Api api) { this.api = api; }

    public Features getFeatures() { return features; }
    public void setFeatures(Features features) { this.features = features; }

    public Business getBusiness() { return business; }
    public void setBusiness(Business business) { this.business = business; }

    public Cors getCors() { return cors; }
    public void setCors(Cors cors) { this.cors = cors; }

    public RateLimiting getRateLimiting() { return rateLimiting; }
    public void setRateLimiting(RateLimiting rateLimiting) { this.rateLimiting = rateLimiting; }

    public External getExternal() { return external; }
    public void setExternal(External external) { this.external = external; }

    // Nested classes
    public static class Admin {
        @NotBlank
        private String email = "admin@voltx.com";

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class Api {
        @NotBlank
        private String version = "v1";

        @NotBlank
        private String basePath = "/api/v1";

        @NotNull
        private Docs docs = new Docs();

        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }

        public String getBasePath() { return basePath; }
        public void setBasePath(String basePath) { this.basePath = basePath; }

        public Docs getDocs() { return docs; }
        public void setDocs(Docs docs) { this.docs = docs; }

        public static class Docs {
            private boolean enabled = true;
            private String path = "/swagger-ui.html";

            public boolean isEnabled() { return enabled; }
            public void setEnabled(boolean enabled) { this.enabled = enabled; }

            public String getPath() { return path; }
            public void setPath(String path) { this.path = path; }
        }
    }

    public static class Features {
        private boolean realTimeChat = true;
        private boolean pushNotifications = true;
        private boolean advancedAnalytics = true;
        private boolean socialSharing = true;
        private boolean achievementSystem = true;
        private boolean debugMode = false;
        private boolean mockExternalApis = false;
        private boolean testDataGeneration = false;

        // Getters and Setters
        public boolean isRealTimeChat() { return realTimeChat; }
        public void setRealTimeChat(boolean realTimeChat) { this.realTimeChat = realTimeChat; }

        public boolean isPushNotifications() { return pushNotifications; }
        public void setPushNotifications(boolean pushNotifications) { this.pushNotifications = pushNotifications; }

        public boolean isAdvancedAnalytics() { return advancedAnalytics; }
        public void setAdvancedAnalytics(boolean advancedAnalytics) { this.advancedAnalytics = advancedAnalytics; }

        public boolean isSocialSharing() { return socialSharing; }
        public void setSocialSharing(boolean socialSharing) { this.socialSharing = socialSharing; }

        public boolean isAchievementSystem() { return achievementSystem; }
        public void setAchievementSystem(boolean achievementSystem) { this.achievementSystem = achievementSystem; }

        public boolean isDebugMode() { return debugMode; }
        public void setDebugMode(boolean debugMode) { this.debugMode = debugMode; }

        public boolean isMockExternalApis() { return mockExternalApis; }
        public void setMockExternalApis(boolean mockExternalApis) { this.mockExternalApis = mockExternalApis; }

        public boolean isTestDataGeneration() { return testDataGeneration; }
        public void setTestDataGeneration(boolean testDataGeneration) { this.testDataGeneration = testDataGeneration; }
    }

    public static class Business {
        @Valid
        @NotNull
        private Achievement achievement = new Achievement();

        @Valid
        @NotNull
        private Leaderboard leaderboard = new Leaderboard();

        @Valid
        @NotNull
        private Points points = new Points();

        @Valid
        @NotNull
        private Notifications notifications = new Notifications();

        @NotNull
        private Duration sessionTimeout = Duration.ofMinutes(30);

        // Getters and Setters
        public Achievement getAchievement() { return achievement; }
        public void setAchievement(Achievement achievement) { this.achievement = achievement; }

        public Leaderboard getLeaderboard() { return leaderboard; }
        public void setLeaderboard(Leaderboard leaderboard) { this.leaderboard = leaderboard; }

        public Points getPoints() { return points; }
        public void setPoints(Points points) { this.points = points; }

        public Notifications getNotifications() { return notifications; }
        public void setNotifications(Notifications notifications) { this.notifications = notifications; }

        public Duration getSessionTimeout() { return sessionTimeout; }
        public void setSessionTimeout(Duration sessionTimeout) { this.sessionTimeout = sessionTimeout; }

        public static class Achievement {
            @NotNull
            private Duration checkInterval = Duration.ofHours(1);

            public Duration getCheckInterval() { return checkInterval; }
            public void setCheckInterval(Duration checkInterval) { this.checkInterval = checkInterval; }
        }

        public static class Leaderboard {
            @NotNull
            private Duration refreshInterval = Duration.ofMinutes(5);

            public Duration getRefreshInterval() { return refreshInterval; }
            public void setRefreshInterval(Duration refreshInterval) { this.refreshInterval = refreshInterval; }
        }

        public static class Points {
            @Valid
            @NotNull
            private Calculation calculation = new Calculation();

            public Calculation getCalculation() { return calculation; }
            public void setCalculation(Calculation calculation) { this.calculation = calculation; }

            public static class Calculation {
                @Min(1)
                @Max(1000)
                private int batchSize = 100;

                public int getBatchSize() { return batchSize; }
                public void setBatchSize(int batchSize) { this.batchSize = batchSize; }
            }
        }

        public static class Notifications {
            @Min(1)
            @Max(1000)
            private int maxPerUser = 50;

            public int getMaxPerUser() { return maxPerUser; }
            public void setMaxPerUser(int maxPerUser) { this.maxPerUser = maxPerUser; }
        }
    }

    public static class Cors {
        @NotNull
        private List<String> allowedOrigins = List.of("http://localhost:3000", "http://localhost:5173");

        @NotNull
        private List<String> allowedMethods = List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH");

        @NotBlank
        private String allowedHeaders = "*";

        private boolean allowCredentials = true;

        @Min(0)
        @Max(86400)
        private long maxAge = 3600;

        // Getters and Setters
        public List<String> getAllowedOrigins() { return allowedOrigins; }
        public void setAllowedOrigins(List<String> allowedOrigins) { this.allowedOrigins = allowedOrigins; }

        public List<String> getAllowedMethods() { return allowedMethods; }
        public void setAllowedMethods(List<String> allowedMethods) { this.allowedMethods = allowedMethods; }

        public String getAllowedHeaders() { return allowedHeaders; }
        public void setAllowedHeaders(String allowedHeaders) { this.allowedHeaders = allowedHeaders; }

        public boolean isAllowCredentials() { return allowCredentials; }
        public void setAllowCredentials(boolean allowCredentials) { this.allowCredentials = allowCredentials; }

        public long getMaxAge() { return maxAge; }
        public void setMaxAge(long maxAge) { this.maxAge = maxAge; }
    }

    public static class RateLimiting {
        private boolean enabled = true;

        @Min(1)
        @Max(10000)
        private int requestsPerMinute = 60;

        @Min(1)
        @Max(100000)
        private int requestsPerHour = 1000;

        @Min(1)
        @Max(100)
        private int burstCapacity = 10;

        // Getters and Setters
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }

        public int getRequestsPerMinute() { return requestsPerMinute; }
        public void setRequestsPerMinute(int requestsPerMinute) { this.requestsPerMinute = requestsPerMinute; }

        public int getRequestsPerHour() { return requestsPerHour; }
        public void setRequestsPerHour(int requestsPerHour) { this.requestsPerHour = requestsPerHour; }

        public int getBurstCapacity() { return burstCapacity; }
        public void setBurstCapacity(int burstCapacity) { this.burstCapacity = burstCapacity; }
    }

    public static class External {
        @Valid
        @NotNull
        private PaymentGateway paymentGateway = new PaymentGateway();

        @Valid
        @NotNull
        private Analytics analytics = new Analytics();

        public PaymentGateway getPaymentGateway() { return paymentGateway; }
        public void setPaymentGateway(PaymentGateway paymentGateway) { this.paymentGateway = paymentGateway; }

        public Analytics getAnalytics() { return analytics; }
        public void setAnalytics(Analytics analytics) { this.analytics = analytics; }

        public static class PaymentGateway {
            private String url;
            private String apiKey;

            public String getUrl() { return url; }
            public void setUrl(String url) { this.url = url; }

            public String getApiKey() { return apiKey; }
            public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        }

        public static class Analytics {
            private String url;
            private String apiKey;

            public String getUrl() { return url; }
            public void setUrl(String url) { this.url = url; }

            public String getApiKey() { return apiKey; }
            public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        }
    }
}