package com.airwise.service;

import com.airwise.entity.MonitoringStation;
import com.airwise.entity.OfficialAqiRecord;
import com.airwise.entity.PollutantObservation;
import com.airwise.repository.MonitoringStationRepository;
import com.airwise.repository.OfficialAqiRecordRepository;
import com.airwise.repository.PollutantObservationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class StationService {

    private final MonitoringStationRepository stationRepository;
    private final OfficialAqiRecordRepository aqiRecordRepository;
    private final PollutantObservationRepository observationRepository;

    public StationService(MonitoringStationRepository stationRepository,
                          OfficialAqiRecordRepository aqiRecordRepository,
                          PollutantObservationRepository observationRepository) {
        this.stationRepository = stationRepository;
        this.aqiRecordRepository = aqiRecordRepository;
        this.observationRepository = observationRepository;
    }

    public List<MonitoringStation> getAllStations() {
        return stationRepository.findAll();
    }

    public List<String> getAllStates() {
        return stationRepository.findDistinctStates();
    }

    public List<String> getCitiesByState(String state) {
        return stationRepository.findCitiesByState(state);
    }

    public List<String> getAllCities() {
        return stationRepository.findAllCities();
    }

    public Optional<MonitoringStation> getStationById(Long id) {
        return stationRepository.findById(id);
    }

    public Map<String, Object> getStationDetailsWithLatestData(Long stationId) {
        MonitoringStation station = stationRepository.findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Station not found."));

        Optional<OfficialAqiRecord> latestAqi = aqiRecordRepository.findFirstByStationIdOrderByObservationTimeDesc(stationId);
        List<PollutantObservation> latestObservations = observationRepository.findLatestObservationsForStation(stationId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("station", station);
        result.put("aqiRecord", latestAqi.orElse(null));
        result.put("pollutants", latestObservations);
        result.put("lastUpdated", latestAqi.map(OfficialAqiRecord::getObservationTime).orElse(null));
        return result;
    }

    public List<Map<String, Object>> getAllStationsWithLatestAqi() {
        List<MonitoringStation> stations = stationRepository.findAll();
        List<OfficialAqiRecord> latestAqis = aqiRecordRepository.findLatestAqiForEveryStation();

        Map<Long, OfficialAqiRecord> aqiMap = new HashMap<>();
        for (OfficialAqiRecord rec : latestAqis) {
            aqiMap.put(rec.getStationId(), rec);
        }

        List<Map<String, Object>> list = new ArrayList<>();
        for (MonitoringStation s : stations) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", s.getId());
            item.put("stationCode", s.getStationCode());
            item.put("stationName", s.getStationName());
            item.put("city", s.getCity());
            item.put("state", s.getState());
            item.put("latitude", s.getLatitude());
            item.put("longitude", s.getLongitude());
            item.put("agency", s.getAgency());
            item.put("status", s.getStatus());
            item.put("lastReportedAt", s.getLastReportedAt());

            OfficialAqiRecord aqi = aqiMap.get(s.getId());
            if (aqi != null) {
                item.put("aqiValue", aqi.getAqiValue());
                item.put("aqiCategory", aqi.getAqiCategory());
                item.put("prominentPollutant", aqi.getProminentPollutant());
                item.put("observationTime", aqi.getObservationTime());
            } else {
                item.put("aqiValue", null);
                item.put("aqiCategory", "No Monitoring Data Available");
                item.put("prominentPollutant", null);
                item.put("observationTime", null);
            }
            list.add(item);
        }
        return list;
    }

    public Map<String, Object> getNationalOverview() {
        List<MonitoringStation> stations = stationRepository.findAll();
        List<OfficialAqiRecord> latestAqis = aqiRecordRepository.findLatestAqiForEveryStation();
        Optional<LocalDateTime> lastObsTime = aqiRecordRepository.findLatestObservationTime();

        Set<String> reportingStates = new HashSet<>();
        int operationalStations = 0;
        int good = 0, satisfactory = 0, moderate = 0, poor = 0, veryPoor = 0, severe = 0;

        for (MonitoringStation s : stations) {
            if ("OPERATIONAL".equalsIgnoreCase(s.getStatus())) {
                operationalStations++;
            }
            reportingStates.add(s.getState());
        }

        for (OfficialAqiRecord aqi : latestAqis) {
            if (aqi.getAqiValue() != null) {
                switch (aqi.getAqiCategory()) {
                    case "Good" -> good++;
                    case "Satisfactory" -> satisfactory++;
                    case "Moderate" -> moderate++;
                    case "Poor" -> poor++;
                    case "Very Poor" -> veryPoor++;
                    case "Severe" -> severe++;
                }
            }
        }

        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("totalStationsConfigured", stations.size());
        overview.put("reportingStations", operationalStations);
        overview.put("statesCount", reportingStates.size());
        overview.put("reportingStates", reportingStates);
        overview.put("lastSuccessfulUpdate", lastObsTime.orElse(null));
        overview.put("totalOfficialAqiReadings", latestAqis.size());
        overview.put("categoryDistribution", Map.of(
                "Good", good,
                "Satisfactory", satisfactory,
                "Moderate", moderate,
                "Poor", poor,
                "Very Poor", veryPoor,
                "Severe", severe
        ));
        return overview;
    }

    public List<OfficialAqiRecord> getHistoricalAqi(Long stationId, int hours) {
        LocalDateTime start = LocalDateTime.now().minusHours(hours);
        LocalDateTime end = LocalDateTime.now();
        return aqiRecordRepository.findByStationIdAndObservationTimeBetweenOrderByObservationTimeAsc(stationId, start, end);
    }

    public List<PollutantObservation> getHistoricalPollutant(Long stationId, String pollutantCode, int hours) {
        LocalDateTime start = LocalDateTime.now().minusHours(hours);
        LocalDateTime end = LocalDateTime.now();
        return observationRepository.findByStationIdAndPollutantCodeAndObservationTimeBetweenOrderByObservationTimeAsc(
                stationId, pollutantCode, start, end);
    }
}

