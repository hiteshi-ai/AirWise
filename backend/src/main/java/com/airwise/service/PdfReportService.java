package com.airwise.service;

import com.airwise.entity.MonitoringStation;
import com.airwise.entity.OfficialAqiRecord;
import com.airwise.repository.MonitoringStationRepository;
import com.airwise.repository.OfficialAqiRecordRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PdfReportService {

    private final MonitoringStationRepository stationRepository;
    private final OfficialAqiRecordRepository aqiRecordRepository;

    public PdfReportService(MonitoringStationRepository stationRepository,
                            OfficialAqiRecordRepository aqiRecordRepository) {
        this.stationRepository = stationRepository;
        this.aqiRecordRepository = aqiRecordRepository;
    }

    public byte[] generateResearchReport(String title, Long stationId, int days, String researcherName) throws IOException {
        MonitoringStation station = stationRepository.findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Station not found."));

        LocalDateTime start = LocalDateTime.now().minusDays(days);
        LocalDateTime end = LocalDateTime.now();
        List<OfficialAqiRecord> records = aqiRecordRepository.findByStationIdAndObservationTimeBetweenOrderByObservationTimeAsc(
                stationId, start, end);

        try (PDDocument document = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                content.beginText();
                content.setFont(PDType1Font.HELVETICA_BOLD, 18);
                content.newLineAtOffset(50, 750);
                content.showText("AIRWISE - Air Quality Research Dossier");
                content.endText();

                content.beginText();
                content.setFont(PDType1Font.HELVETICA, 10);
                content.newLineAtOffset(50, 735);
                content.showText("Official Indian Air Quality Intelligence Platform | Traceable CPCB Source Records");
                content.endText();

                // Horizontal line
                content.moveTo(50, 725);
                content.lineTo(550, 725);
                content.stroke();

                int y = 700;
                content.beginText();
                content.setFont(PDType1Font.HELVETICA_BOLD, 13);
                content.newLineAtOffset(50, y);
                content.showText("Report Title: " + (title != null && !title.isBlank() ? title : "Air Quality Assessment"));
                content.endText();

                y -= 25;
                content.beginText();
                content.setFont(PDType1Font.HELVETICA, 11);
                content.newLineAtOffset(50, y);
                content.showText("Investigator: " + (researcherName != null ? researcherName : "Authorized Environmental Researcher"));
                content.endText();

                y -= 20;
                content.beginText();
                content.setFont(PDType1Font.HELVETICA, 11);
                content.newLineAtOffset(50, y);
                content.showText("Station: " + station.getStationName() + " (" + station.getStationCode() + ")");
                content.endText();

                y -= 20;
                content.beginText();
                content.setFont(PDType1Font.HELVETICA, 11);
                content.newLineAtOffset(50, y);
                content.showText("Location: " + station.getCity() + ", " + station.getState() + " [Lat: " + station.getLatitude() + ", Lng: " + station.getLongitude() + "]");
                content.endText();

                y -= 20;
                content.beginText();
                content.setFont(PDType1Font.HELVETICA, 11);
                content.newLineAtOffset(50, y);
                content.showText("Observation Period: " + start.format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")) + " to " + end.format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")) + " (" + days + " days)");
                content.endText();

                y -= 30;
                content.beginText();
                content.setFont(PDType1Font.HELVETICA_BOLD, 12);
                content.newLineAtOffset(50, y);
                content.showText("Statistical Summary (Official CPCB IND-AQI Records):");
                content.endText();

                if (!records.isEmpty()) {
                    double avg = records.stream().filter(r -> r.getAqiValue() != null).mapToInt(OfficialAqiRecord::getAqiValue).average().orElse(0.0);
                    int max = records.stream().filter(r -> r.getAqiValue() != null).mapToInt(OfficialAqiRecord::getAqiValue).max().orElse(0);
                    int min = records.stream().filter(r -> r.getAqiValue() != null).mapToInt(OfficialAqiRecord::getAqiValue).min().orElse(0);

                    y -= 20;
                    content.beginText();
                    content.setFont(PDType1Font.HELVETICA, 10);
                    content.newLineAtOffset(70, y);
                    content.showText("- Total Official AQI Records: " + records.size());
                    content.endText();

                    y -= 18;
                    content.beginText();
                    content.setFont(PDType1Font.HELVETICA, 10);
                    content.newLineAtOffset(70, y);
                    content.showText("- Average AQI: " + Math.round(avg) + " (IND-AQI Scale)");
                    content.endText();

                    y -= 18;
                    content.beginText();
                    content.setFont(PDType1Font.HELVETICA, 10);
                    content.newLineAtOffset(70, y);
                    content.showText("- Peak Recorded AQI: " + max);
                    content.endText();

                    y -= 18;
                    content.beginText();
                    content.setFont(PDType1Font.HELVETICA, 10);
                    content.newLineAtOffset(70, y);
                    content.showText("- Minimum Recorded AQI: " + min);
                    content.endText();
                } else {
                    y -= 20;
                    content.beginText();
                    content.setFont(PDType1Font.HELVETICA_OBLIQUE, 10);
                    content.newLineAtOffset(70, y);
                    content.showText("No validated records published for this station within the selected timeframe.");
                    content.endText();
                }

                y -= 40;
                content.beginText();
                content.setFont(PDType1Font.HELVETICA_BOLD, 12);
                content.newLineAtOffset(50, y);
                content.showText("Data Integrity and Attribution Notice:");
                content.endText();

                y -= 20;
                content.beginText();
                content.setFont(PDType1Font.HELVETICA, 9);
                content.newLineAtOffset(50, y);
                content.showText("Data Source: Central Pollution Control Board (CPCB) and Open Government Data (data.gov.in).");
                content.endText();

                y -= 15;
                content.beginText();
                content.setFont(PDType1Font.HELVETICA, 9);
                content.newLineAtOffset(50, y);
                content.showText("AIRWISE is an independent analytical platform and preserves genuine government readings without fabrication.");
                content.endText();

                y -= 15;
                content.beginText();
                content.setFont(PDType1Font.HELVETICA, 9);
                content.newLineAtOffset(50, y);
                content.showText("Report generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm:ss IST")));
                content.endText();
            }

            document.save(out);
            return out.toByteArray();
        }
    }
}

