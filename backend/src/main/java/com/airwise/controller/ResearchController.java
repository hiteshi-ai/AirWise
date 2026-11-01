package com.airwise.controller;

import com.airwise.entity.PollutantObservation;
import com.airwise.entity.ResearchProject;
import com.airwise.entity.User;
import com.airwise.repository.UserRepository;
import com.airwise.service.ExcelExportService;
import com.airwise.service.PdfReportService;
import com.airwise.service.ResearchService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/research")
public class ResearchController {

    private final ResearchService researchService;
    private final ExcelExportService excelExportService;
    private final PdfReportService pdfReportService;
    private final UserRepository userRepository;

    public ResearchController(ResearchService researchService,
                              ExcelExportService excelExportService,
                              PdfReportService pdfReportService,
                              UserRepository userRepository) {
        this.researchService = researchService;
        this.excelExportService = excelExportService;
        this.pdfReportService = pdfReportService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new SecurityException("User not authenticated."));
    }

    @GetMapping("/query")
    public ResponseEntity<List<PollutantObservation>> queryData(
            @RequestParam Long stationId,
            @RequestParam(required = false, defaultValue = "ALL") String pollutant,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        LocalDateTime s = (start != null) ? start : LocalDateTime.now().minusDays(7);
        LocalDateTime e = (end != null) ? end : LocalDateTime.now();
        return ResponseEntity.ok(researchService.queryObservations(stationId, pollutant, s, e));
    }

    @GetMapping("/fingerprint/{stationId}")
    public ResponseEntity<Map<String, Object>> getFingerprint(
            @PathVariable Long stationId,
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(researchService.getPollutantFingerprint(stationId, days));
    }

    @GetMapping("/persistence")
    public ResponseEntity<Map<String, Object>> getPersistence(
            @RequestParam Long stationId,
            @RequestParam String pollutant,
            @RequestParam(required = false) Double threshold,
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(researchService.calculatePersistence(stationId, pollutant, threshold, days));
    }

    @GetMapping("/anomalies")
    public ResponseEntity<List<Map<String, Object>>> getAnomalies(
            @RequestParam Long stationId,
            @RequestParam String pollutant,
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(researchService.detectAnomalies(stationId, pollutant, days));
    }

    @GetMapping("/coverage-gaps")
    public ResponseEntity<Map<String, Object>> getCoverageGaps() {
        return ResponseEntity.ok(researchService.getCoverageGapAnalysis());
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam Long stationId,
            @RequestParam(required = false, defaultValue = "ALL") String pollutant,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) throws IOException {

        LocalDateTime s = (start != null) ? start : LocalDateTime.now().minusDays(7);
        LocalDateTime e = (end != null) ? end : LocalDateTime.now();

        byte[] excelBytes = excelExportService.exportObservationsToExcel(stationId, pollutant, s, e);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"AIRWISE_Station_" + stationId + "_Dataset.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    @PostMapping("/report/pdf")
    public ResponseEntity<byte[]> generatePdf(
            Authentication auth,
            @RequestBody Map<String, Object> body) throws IOException {

        String title = (String) body.getOrDefault("title", "Air Quality Analytical Dossier");
        Long stationId = Long.valueOf(body.get("stationId").toString());
        int days = body.get("days") != null ? Integer.parseInt(body.get("days").toString()) : 7;
        String researcherName = auth != null ? auth.getName() : "Researcher";

        byte[] pdfBytes = pdfReportService.generateResearchReport(title, stationId, days, researcherName);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"AIRWISE_Research_Report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/projects")
    public ResponseEntity<List<ResearchProject>> getProjects(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return ResponseEntity.ok(researchService.getUserProjects(user.getId()));
    }

    @PostMapping("/projects")
    public ResponseEntity<ResearchProject> saveProject(Authentication auth, @RequestBody Map<String, String> body) {
        User user = getAuthenticatedUser(auth);
        String title = body.get("title");
        String description = body.get("description");
        String configJson = body.get("configJson");
        String notes = body.get("notes");

        ResearchProject project = researchService.saveProject(user.getId(), title, description, configJson, notes);
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<?> deleteProject(Authentication auth, @PathVariable Long id) {
        User user = getAuthenticatedUser(auth);
        researchService.deleteProject(id, user.getId());
        return ResponseEntity.ok(Map.of("message", "Project deleted successfully."));
    }
}

