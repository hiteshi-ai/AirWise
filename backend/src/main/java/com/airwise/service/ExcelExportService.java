package com.airwise.service;

import com.airwise.entity.MonitoringStation;
import com.airwise.entity.PollutantObservation;
import com.airwise.repository.MonitoringStationRepository;
import com.airwise.repository.PollutantObservationRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExcelExportService {

    private final PollutantObservationRepository observationRepository;
    private final MonitoringStationRepository stationRepository;

    public ExcelExportService(PollutantObservationRepository observationRepository,
                              MonitoringStationRepository stationRepository) {
        this.observationRepository = observationRepository;
        this.stationRepository = stationRepository;
    }

    public byte[] exportObservationsToExcel(Long stationId, String pollutantCode, LocalDateTime start, LocalDateTime end) throws IOException {
        MonitoringStation station = stationRepository.findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Station not found."));

        List<PollutantObservation> observations;
        if (pollutantCode != null && !pollutantCode.equalsIgnoreCase("ALL")) {
            observations = observationRepository.findByStationIdAndPollutantCodeAndObservationTimeBetweenOrderByObservationTimeAsc(
                    stationId, pollutantCode, start, end);
        } else {
            observations = observationRepository.findByStationIdAndObservationTimeBetweenOrderByObservationTimeAsc(stationId, start, end);
        }

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("AIRWISE Observations");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] headers = {
                "Observation ID", "Station Code", "Station Name", "City", "State",
                "Latitude", "Longitude", "Pollutant", "Measurement", "Unit",
                "CPCB Sub-Index", "Observation Timestamp (IST)", "Source", "Quality Status"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            int rowIdx = 1;
            for (PollutantObservation obs : observations) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(obs.getId());
                row.createCell(1).setCellValue(station.getStationCode());
                row.createCell(2).setCellValue(station.getStationName());
                row.createCell(3).setCellValue(station.getCity());
                row.createCell(4).setCellValue(station.getState());
                row.createCell(5).setCellValue(station.getLatitude());
                row.createCell(6).setCellValue(station.getLongitude());
                row.createCell(7).setCellValue(obs.getPollutantCode());
                row.createCell(8).setCellValue(obs.getMeasurement());
                row.createCell(9).setCellValue(obs.getUnit());
                row.createCell(10).setCellValue(obs.getSubIndex() != null ? obs.getSubIndex().toString() : "N/A");
                row.createCell(11).setCellValue(obs.getObservationTime().format(dtf));
                row.createCell(12).setCellValue(obs.getDataSource());
                row.createCell(13).setCellValue(obs.getQualityFlag());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}

