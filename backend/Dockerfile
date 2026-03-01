# ── Build stage ─────────────────────────────────────────────────────────────
# Uses an official Maven + JDK 17 image — no mvnw wrapper needed
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml first so Docker can cache the dependency layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build the production JAR (skip tests for speed)
COPY src ./src
RUN mvn package -DskipTests -B

# ── Runtime stage ────────────────────────────────────────────────────────────
# Minimal JRE image for a smaller final container (~200MB vs 500MB)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Security: run as non-root user
RUN addgroup -S chatapp && adduser -S chatapp -G chatapp
USER chatapp

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Port the app listens on
EXPOSE 8080

# Start the app — SPRING_PROFILES_ACTIVE env var set on Railway dashboard
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
