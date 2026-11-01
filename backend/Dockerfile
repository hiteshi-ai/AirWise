# ---- Build Stage ----
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---- Run Stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/airwise-backend-1.0.0.jar app.jar

# Render injects PORT (default 10000); Spring Boot reads ${PORT} from application.yml
ENV PORT=10000
EXPOSE 10000

ENTRYPOINT exec java -Dserver.port=${PORT} -jar app.jar

