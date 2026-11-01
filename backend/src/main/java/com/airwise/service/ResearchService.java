package com.airwise.service;

import com.airwise.entity.MonitoringStation;
import com.airwise.entity.PollutantObservation;
import com.airwise.entity.ResearchProject;
import com.airwise.repository.MonitoringStationRepository;
import com.airwise.repository.PollutantObservationRepository;
import com.airwise.repository.ResearchProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ResearchService {

    private final PollutantObservationRepository observationRepository;
    private final MonitoringStationRepository stationRepository;
    private final ResearchProjectRepository projectRepository;

    public ResearchService(PollutantObservationRepository observationRepository,
                           MonitoringStationRepository stationRepository,
                           ResearchProjectRepository projectRepository) {
        this.observationRepository = observationRepository;
        this.stationRepository = stationRepository;
        this.projectRepository = projectRepository;
    }

    public List<PollutantObservation> queryObservations(Long stationId, String pollutantCode, LocalDateTime start, LocalDateTime end) {
        if (pollutantCode != null && !pollutantCode.equalsIgnoreCase("ALL")) {
            return observationRepository.findByStationIdAndPollutantCodeAndObservationTimeBetweenOrderByObservationTimeAsc(
                    stationId, pollutantCode, start, end);
        }
        return observationRepository.findByStationIdAndObservationTimeBetweenOrderByObservationTimeAsc(stationId, start, end);
    }

    /**
     * Pollutant Fingerprint: average concentration profile of each pollutant at a station.
     */
    public Map<String, Object> getPollutantFingerprint(Long stationId, int days) {
        LocalDateTime start = LocalDateTime.now().minusDays(days);
        LocalDateTime end = LocalDateTime.now();

        List<PollutantObservation> obsList = observationRepository.findByStationIdAndObservationTimeBetweenOrderByObservationTimeAsc(
                stationId, start, end);

        Map<String, List<Double>> grouped = new HashMap<>();
        for (PollutantObservation o : obsList) {
            grouped.computeIfAbsent(o.getPollutantCode(), k -> new ArrayList<>()).add(o.getMeasurement());
        }

        Map<String, Object> fingerprint = new LinkedHashMap<>();
        for (Map.Entry<String, List<Double>> entry : grouped.entrySet()) {
            List<Double> vals = entry.getValue();
            double avg = vals.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            double max = vals.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
            double min = vals.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);

            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("averageConcentration", Math.round(avg * 100.0) / 100.0);
            stats.put("maxConcentration", Math.round(max * 100.0) / 100.0);
            stats.put("minConcentration", Math.round(min * 100.0) / 100.0);
            stats.put("sampleCount", vals.size());
            fingerprint.put(entry.getKey(), stats);
        }

        return fingerprint;
    }

    /**
     * Pollution Persistence: Exceedance frequency of official standards.
     * Official CPCB 24-hr standards:
     * PM2.5: 60 ug/m3
     * PM10: 100 ug/m3
     * NO2: 80 ug/m3
     * SO2: 80 ug/m3
     * CO: 2.0 mg/m3
     * O3: 100 ug/m3
     */
    public Map<String, Object> calculatePersistence(Long stationId, String pollutantCode, Double customThreshold, int days) {
        LocalDateTime start = LocalDateTime.now().minusDays(days);
        LocalDateTime end = LocalDateTime.now();

        double standardThreshold = switch (pollutantCode.toUpperCase()) {
            case "PM2.5", "PM25" -> 60.0;
            case "PM10" -> 100.0;
            case "NO2" -> 80.0;
            case "SO2" -> 80.0;
            case "CO" -> 2.0;
            case "O3" -> 100.0;
            default -> 50.0;
        };

        double threshold = (customThreshold != null && customThreshold > 0) ? customThreshold : standardThreshold;

        List<PollutantObservation> obs = observationRepository.findByStationIdAndPollutantCodeAndObservationTimeBetweenOrderByObservationTimeAsc(
                stationId, pollutantCode, start, end);

        if (obs.isEmpty()) {
            return Map.of("pollutant", pollutantCode, "totalSamples", 0, "persistencePercentage", 0.0, "status", "NO_DATA");
        }

        long exceedances = obs.stream().filter(o -> o.getMeasurement() > threshold).count();
        double percentage = (double) exceedances / obs.size() * 100.0;

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("pollutant", pollutantCode);
        res.put("thresholdApplied", threshold);
        res.put("isOfficialCpcbThreshold", (customThreshold == null || customThreshold.equals(standardThreshold)));
        res.put("totalObservations", obs.size());
        res.put("exceedanceCount", exceedances);
        res.put("persistencePercentage", Math.round(percentage * 10.0) / 10.0);
        res.put("startDate", start);
        res.put("endDate", end);
        return res;
    }

    /**
     * Anomaly Detection: flags values that deviate > 2.2 standard deviations from station mean.
     */
    public List<Map<String, Object>> detectAnomalies(Long stationId, String pollutantCode, int days) {
        LocalDateTime start = LocalDateTime.now().minusDays(days);
        LocalDateTime end = LocalDateTime.now();

        List<PollutantObservation> obs = observationRepository.findByStationIdAndPollutantCodeAndObservationTimeBetweenOrderByObservationTimeAsc(
                stationId, pollutantCode, start, end);

        if (obs.size() < 10) return Collections.emptyList();

        double sum = 0.0;
        for (PollutantObservation o : obs) sum += o.getMeasurement();
        double mean = sum / obs.size();

        double varianceSum = 0.0;
        for (PollutantObservation o : obs) varianceSum += Math.pow(o.getMeasurement() - mean, 2);
        double stdDev = Math.sqrt(varianceSum / obs.size());

        List<Map<String, Object>> anomalies = new ArrayList<>();
        if (stdDev == 0) return anomalies;

        for (PollutantObservation o : obs) {
            double zScore = Math.abs((o.getMeasurement() - mean) / stdDev);
            if (zScore >= 2.2) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("observationId", o.getId());
                item.put("observationTime", o.getObservationTime());
                item.put("measurement", o.getMeasurement());
                item.put("unit", o.getUnit());
                item.put("mean", Math.round(mean * 10.0) / 10.0);
                item.put("zScore", Math.round(zScore * 100.0) / 100.0);
                item.put("confidenceLabel", "Potential Anomaly (requires meteorological verification)");
                anomalies.add(item);
            }
        }

        return anomalies;
    }

    /**
     * Coverage Gap Analysis
     */
    public Map<String, Object> getCoverageGapAnalysis() {
        List<MonitoringStation> all = stationRepository.findAll();
        LocalDateTime threshold = LocalDateTime.now().minusHours(24);

        int reporting = 0;
        int delayed = 0;
        int offline = 0;

        List<Map<String, Object>> stationStatuses = new ArrayList<>();
        for (MonitoringStation s : all) {
            Map<String, Object> info = new HashMap<>();
            info.put("id", s.getId());
            info.put("name", s.getStationName());
            info.put("city", s.getCity());
            info.put("state", s.getState());
            info.put("lastReportedAt", s.getLastReportedAt());

            if (s.getLastReportedAt() != null && s.getLastReportedAt().isAfter(threshold)) {
                reporting++;
                info.put("coverageStatus", "REPORTING_ACTIVE");
            } else if (s.getLastReportedAt() != null) {
                delayed++;
                info.put("coverageStatus", "DATA_DELAYED");
            } else {
                offline++;
                info.put("coverageStatus", "NO_PUBLISHED_COVERAGE");
            }
            stationStatuses.add(info);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalMonitoredStations", all.size());
        result.put("activeReportingStations", reporting);
        result.put("delayedReportingStations", delayed);
        result.put("uncoveredStations", offline);
        result.put("stations", stationStatuses);
        return result;
    }

    // Saved projects
    public List<ResearchProject> getUserProjects(Long userId) {
        return projectRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    @Transactional
    public ResearchProject saveProject(Long userId, String title, String description, String configJson, String notes) {
        ResearchProject project = new ResearchProject(userId, title, description, configJson, notes);
        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long projectId, Long userId) {
        projectRepository.findById(projectId).ifPresent(p -> {
            if (p.getUserId().equals(userId)) {
                projectRepository.delete(p);
            }
        });
    }
}

