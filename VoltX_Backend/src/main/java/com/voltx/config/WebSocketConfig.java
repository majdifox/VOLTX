package com.voltx.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration for real-time messaging
 * Enables STOMP protocol over WebSocket for bi-directional communication
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configure message broker for handling WebSocket messages
     * - /topic: for broadcasting to multiple clients (public messages)
     * - /queue: for point-to-point messaging (private messages)
     * - /app: prefix for messages that are routed to controller methods
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple broker for destinations prefixed with /topic and /queue
        config.enableSimpleBroker("/topic", "/queue");

        // Routes messages whose destination header begins with /app to controller methods
        config.setApplicationDestinationPrefixes("/app");

        // Set prefix for user-specific destinations
        config.setUserDestinationPrefix("/user");
    }

    /**
     * Register STOMP endpoints for WebSocket connections
     * - /ws: primary WebSocket endpoint
     * - SockJS fallback for browsers that don't support WebSocket
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register WebSocket endpoint with SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Allow all origins in development
                .withSockJS();

        // Register native WebSocket endpoint (without SockJS)
        registry.addEndpoint("/ws-native")
                .setAllowedOriginPatterns("*");
    }
}
