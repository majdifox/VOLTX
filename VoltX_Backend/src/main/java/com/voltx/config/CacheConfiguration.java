package com.voltx.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Advanced caching configuration with multiple cache providers
 */
@Configuration
@EnableCaching
public class CacheConfiguration {

    /**
     * Primary cache manager using Caffeine for local caching
     */
    @Bean
    @Primary
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "caffeine", matchIfMissing = true)
    public CacheManager caffeineCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();

        // Configure different cache specifications for different cache names
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterAccess(10, TimeUnit.MINUTES)
                .recordStats()
                .build());

        // Set cache names
        cacheManager.setCacheNames(
                "users",
                "achievements",
                "leaderboard",
                "points",
                "activities",
                "statistics",
                "configurations"
        );

        return cacheManager;
    }

    /**
     * Redis cache manager for distributed caching
     */
    @Bean
    @ConditionalOnProperty(name = "spring.redis.host")
    public CacheManager redisCacheManager(RedisConnectionFactory redisConnectionFactory) {
        RedisCacheManager.Builder builder = RedisCacheManager.RedisCacheManagerBuilder
                .fromConnectionFactory(redisConnectionFactory)
                .cacheDefaults(
                        org.springframework.data.redis.cache.RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(10))
                                .disableCachingNullValues()
                );

        // Configure specific TTL for different caches
        builder.withCacheConfiguration("users",
                org.springframework.data.redis.cache.RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofMinutes(30)));

        builder.withCacheConfiguration("leaderboard",
                org.springframework.data.redis.cache.RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofMinutes(5)));

        builder.withCacheConfiguration("achievements",
                org.springframework.data.redis.cache.RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofHours(1)));

        builder.withCacheConfiguration("statistics",
                org.springframework.data.redis.cache.RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofMinutes(15)));

        return builder.build();
    }

    /**
     * Redis template for custom caching operations
     */
    @Bean
    @ConditionalOnProperty(name = "spring.redis.host")
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);

        // Use String serializer for keys
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // Use JSON serializer for values
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());

        template.setDefaultSerializer(new GenericJackson2JsonRedisSerializer());
        template.afterPropertiesSet();

        return template;
    }

    /**
     * Cache configuration for specific cache names with custom settings
     */
    @Bean
    public Caffeine<Object, Object> usersCacheSpec() {
        return Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterAccess(30, TimeUnit.MINUTES)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .recordStats();
    }

    @Bean
    public Caffeine<Object, Object> achievementsCacheSpec() {
        return Caffeine.newBuilder()
                .maximumSize(200)
                .expireAfterAccess(1, TimeUnit.HOURS)
                .expireAfterWrite(6, TimeUnit.HOURS)
                .recordStats();
    }

    @Bean
    public Caffeine<Object, Object> leaderboardCacheSpec() {
        return Caffeine.newBuilder()
                .maximumSize(100)
                .expireAfterAccess(5, TimeUnit.MINUTES)
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .recordStats();
    }

    @Bean
    public Caffeine<Object, Object> statisticsCacheSpec() {
        return Caffeine.newBuilder()
                .maximumSize(300)
                .expireAfterAccess(15, TimeUnit.MINUTES)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .recordStats();
    }
}