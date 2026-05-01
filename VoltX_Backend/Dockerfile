# ============================================
# VoltX Backend Dockerfile (Spring Boot)
# Multi-stage build for smaller image size
# ============================================

# Stage 1: Build the application
FROM maven:3-eclipse-temurin-26 AS build

WORKDIR /app

# Copy pom.xml first (for better Docker caching)
COPY pom.xml .

# Download dependencies (cached if pom.xml hasn't changed)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application (skip tests for faster build)
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Create uploads directory for file storage
RUN mkdir -p /app/uploads

# Expose the backend port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
