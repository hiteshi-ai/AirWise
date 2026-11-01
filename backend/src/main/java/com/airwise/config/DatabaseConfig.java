package com.airwise.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Robust DataSource Configuration for Cloud Deployments (Render / Neon / Railway).
 * Automatically parses and normalizes standard cloud DATABASE_URL strings
 * (e.g., postgresql://user:pass@host:port/db?sslmode=require) into valid JDBC configuration.
 */
@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties, Environment env) {
        String url = properties.getUrl();
        if (!StringUtils.hasText(url)) {
            url = env.getProperty("DATABASE_URL");
        }

        if (StringUtils.hasText(url) && (url.startsWith("postgres://") || url.startsWith("postgresql://") || url.contains("@"))) {
            try {
                String cleanUrl = url;
                if (cleanUrl.startsWith("jdbc:")) {
                    cleanUrl = cleanUrl.substring(5);
                }
                URI uri = URI.create(cleanUrl);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    if (!StringUtils.hasText(properties.getUsername())) {
                        properties.setUsername(parts[0]);
                    }
                    if (!StringUtils.hasText(properties.getPassword())) {
                        properties.setPassword(parts[1]);
                    }
                }

                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String query = StringUtils.hasText(uri.getQuery()) ? "?" + uri.getQuery() : "?sslmode=require";
                if (!query.contains("sslmode=")) {
                    query += (query.contains("?") ? "&" : "?") + "sslmode=require";
                }

                String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getPath() + query;
                log.info("Normalized Cloud PostgreSQL JDBC URL to: jdbc:postgresql://{}:{}{}", uri.getHost(), port, uri.getPath());
                properties.setUrl(jdbcUrl);
                properties.setDriverClassName("org.postgresql.Driver");
            } catch (Exception ex) {
                log.warn("Could not parse DATABASE_URL as URI, using configured URL as-is: {}", ex.getMessage());
            }
        }

        return properties.initializeDataSourceBuilder().build();
    }
}
