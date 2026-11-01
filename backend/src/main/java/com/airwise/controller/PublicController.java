package com.airwise.controller;

import com.airwise.entity.MonitoringStation;
import com.airwise.entity.OfficialAqiRecord;
import com.airwise.entity.PollutantObservation;
import com.airwise.service.StationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final StationService stationService;

    public PublicController(StationService stationService) {
        this.stationService = stationService;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getNationalOverview() {
        return ResponseEntity.ok(stationService.getNationalOverview());
    }

    @GetMapping("/stations")
    public ResponseEntity<List<Map<String, Object>>> getStationsWithLatestAqi() {
        return ResponseEntity.ok(stationService.getAllStationsWithLatestAqi());
    }

    @GetMapping("/states")
    public ResponseEntity<List<String>> getStates() {
        return ResponseEntity.ok(stationService.getAllStates());
    }

    @GetMapping("/cities")
    public ResponseEntity<List<String>> getCities(@RequestParam(required = false) String state) {
        if (state != null && !state.isBlank()) {
            return ResponseEntity.ok(stationService.getCitiesByState(state));
        }
        return ResponseEntity.ok(stationService.getAllCities());
    }

    @GetMapping("/station/{id}")
    public ResponseEntity<?> getStationDetails(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(stationService.getStationDetailsWithLatestData(id));
        } catch (Exception ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/station/{id}/history/aqi")
    public ResponseEntity<List<OfficialAqiRecord>> getHistoricalAqi(
            @PathVariable Long id,
            @RequestParam(defaultValue = "168") int hours) {
        return ResponseEntity.ok(stationService.getHistoricalAqi(id, hours));
    }

    @GetMapping("/station/{id}/history/pollutant")
    public ResponseEntity<List<PollutantObservation>> getHistoricalPollutant(
            @PathVariable Long id,
            @RequestParam String pollutant,
            @RequestParam(defaultValue = "168") int hours) {
        return ResponseEntity.ok(stationService.getHistoricalPollutant(id, pollutant, hours));
    }

    @GetMapping("/pollutants/info")
    public ResponseEntity<List<Map<String, String>>> getPollutantsInfo() {
        List<Map<String, String>> info = List.of(
            Map.of("code", "PM2.5", "name", "Particulate Matter < 2.5 µm", "standard", "60 µg/m³ (24-hr)", "source", "Vehicle exhaust, biomass burning, industrial combustion", "health", "Penetrates deep into lungs and bloodstream; impacts respiratory and cardiovascular systems."),
            Map.of("code", "PM10", "name", "Particulate Matter < 10 µm", "standard", "100 µg/m³ (24-hr)", "source", "Road dust, construction, fly ash, windblown soil", "health", "Irritates upper respiratory tract, causes coughing and exacerbates asthma."),
            Map.of("code", "NO2", "name", "Nitrogen Dioxide", "standard", "80 µg/m³ (24-hr)", "source", "High-temperature fuel combustion in vehicles and power plants", "health", "Inflammation of the airways, reduced lung function, precursor to ground-level ozone."),
            Map.of("code", "SO2", "name", "Sulphur Dioxide", "standard", "80 µg/m³ (24-hr)", "source", "Coal-fired thermal power stations, oil refineries, industrial boilers", "health", "Bronchoconstriction, wheezing, throat irritation, acid rain formation."),
            Map.of("code", "CO", "name", "Carbon Monoxide", "standard", "2.0 mg/m³ (8-hr)", "source", "Incomplete combustion in motor vehicles and household biomass stoves", "health", "Binds to hemoglobin forming carboxyhemoglobin, reducing oxygen carriage to vital organs."),
            Map.of("code", "O3", "name", "Ground-Level Ozone", "standard", "100 µg/m³ (8-hr)", "source", "Secondary photochemical reaction between NOx and VOCs under sunlight", "health", "Chest pain, airway reactivity, damage to lung tissue; powerful oxidant."),
            Map.of("code", "NH3", "name", "Ammonia", "standard", "400 µg/m³ (24-hr)", "source", "Agricultural fertilizer use, livestock waste, wastewater treatment", "health", "Eye and respiratory tract irritation, contributor to secondary ammonium particulate aerosols."),
            Map.of("code", "Pb", "name", "Lead", "standard", "1.0 µg/m³ (24-hr)", "source", "Battery recycling, metal smelters, industrial emissions", "health", "Accumulates in bones, damages nervous system, impairs cognitive development in children.")
        );
        return ResponseEntity.ok(info);
    }
}

