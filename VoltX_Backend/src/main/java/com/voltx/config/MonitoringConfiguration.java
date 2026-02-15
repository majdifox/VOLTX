package com.voltx.config;

import io.micrometer.core.aop.TimedAspect;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.composite.CompositeMeterRegistry;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

/**
 * Monitoring and metrics configuration
 */
@Configuration
@EnableAspectJAutoProxy
public class MonitoringConfiguration {

    /**
     * Customize meter registry with common tags
     */
    @Bean
    public MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
        return registry -> registry.config().commonTags(
                "application", "voltx",
                "service", "voltx-api"
        );
    }

    /**
     * Enable @Timed annotation support
     */
    @Bean
    public TimedAspect timedAspect(MeterRegistry registry) {
        return new TimedAspect(registry);
    }

    /**
     * Custom metrics for business operations
     */
    @Bean
    @ConditionalOnProperty(name = "management.metrics.export.prometheus.enabled", havingValue = "true")
    public MeterRegistryCustomizer<CompositeMeterRegistry> customMetrics() {
        return registry -> {
            // Register custom meters for business metrics
            registry.gauge("voltx.users.active", 0);
            registry.gauge("voltx.achievements.total", 0);
            registry.gauge("voltx.points.total", 0);
            registry.gauge("voltx.activities.today", 0);

            // Custom counters for events
            registry.counter("voltx.user.registrations");
            registry.counter("voltx.user.logins");
            registry.counter("voltx.achievements.earned");
            registry.counter("voltx.points.awarded");
            registry.counter("voltx.activities.completed");
            registry.counter("voltx.api.calls");
            registry.counter("voltx.errors");

            // Custom timers for operations
            registry.timer("voltx.database.query");
            registry.timer("voltx.cache.operation");
            registry.timer("voltx.external.api");
            registry.timer("voltx.achievement.calculation");
            registry.timer("voltx.leaderboard.update");
        };
    }
}