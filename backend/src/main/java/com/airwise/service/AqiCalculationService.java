package com.airwise.service;

import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AqiCalculationService {

    public static class SubIndexResult {
        private final Integer subIndex;
        private final String category;

        public SubIndexResult(Integer subIndex, String category) {
            this.subIndex = subIndex;
            this.category = category;
        }

        public Integer getSubIndex() { return subIndex; }
        public String getCategory() { return category; }
    }

    public static class OverallAqiResult {
        private final Integer aqi;
        private final String category;
        private final String prominentPollutant;
        private final boolean valid;
        private final String message;

        public OverallAqiResult(Integer aqi, String category, String prominentPollutant, boolean valid, String message) {
            this.aqi = aqi;
            this.category = category;
            this.prominentPollutant = prominentPollutant;
            this.valid = valid;
            this.message = message;
        }

        public Integer getAqi() { return aqi; }
        public String getCategory() { return category; }
        public String getProminentPollutant() { return prominentPollutant; }
        public boolean isValid() { return valid; }
        public String getMessage() { return message; }
    }

    public Integer calculateSubIndex(String pollutantCode, Double concentration) {
        if (concentration == null || concentration < 0) return null;
        String code = pollutantCode.toUpperCase().replace(".", "");

        return switch (code) {
            case "PM25" -> calcSubIndex(concentration, new double[]{0, 30, 60, 90, 120, 250, 380}, new int[]{0, 50, 100, 200, 300, 400, 500});
            case "PM10" -> calcSubIndex(concentration, new double[]{0, 50, 100, 250, 350, 430, 510}, new int[]{0, 50, 100, 200, 300, 400, 500});
            case "NO2" -> calcSubIndex(concentration, new double[]{0, 40, 80, 180, 280, 400, 500}, new int[]{0, 50, 100, 200, 300, 400, 500});
            case "SO2" -> calcSubIndex(concentration, new double[]{0, 40, 80, 380, 800, 1600, 2000}, new int[]{0, 50, 100, 200, 300, 400, 500});
            case "CO" -> calcSubIndex(concentration, new double[]{0, 1.0, 2.0, 10.0, 17.0, 34.0, 50.0}, new int[]{0, 50, 100, 200, 300, 400, 500});
            case "O3" -> calcSubIndex(concentration, new double[]{0, 50, 100, 168, 208, 748, 1000}, new int[]{0, 50, 100, 200, 300, 400, 500});
            case "NH3" -> calcSubIndex(concentration, new double[]{0, 200, 400, 800, 1200, 1800, 2200}, new int[]{0, 50, 100, 200, 300, 400, 500});
            case "PB" -> calcSubIndex(concentration, new double[]{0, 0.5, 1.0, 2.0, 3.0, 3.5, 5.0}, new int[]{0, 50, 100, 200, 300, 400, 500});
            default -> null;
        };
    }

    private int calcSubIndex(double c, double[] b, int[] i) {
        for (int k = 0; k < b.length - 1; k++) {
            if (c >= b[k] && c <= b[k + 1]) {
                double sub = i[k] + ((double)(i[k + 1] - i[k]) / (b[k + 1] - b[k])) * (c - b[k]);
                return (int) Math.round(sub);
            }
        }
        if (c > b[b.length - 1]) return 500;
        return 0;
    }

    public String getAqiCategory(int aqi) {
        if (aqi <= 50) return "Good";
        if (aqi <= 100) return "Satisfactory";
        if (aqi <= 200) return "Moderate";
        if (aqi <= 300) return "Poor";
        if (aqi <= 400) return "Very Poor";
        return "Severe";
    }

    /**
     * CPCB Overall AQI Rule:
     * Minimum 3 pollutants required.
     * At least one must be PM2.5 or PM10.
     * AQI = Max of available sub-indices.
     */
    public OverallAqiResult calculateOverallAqi(Map<String, Double> pollutantConcentrations) {
        if (pollutantConcentrations == null || pollutantConcentrations.size() < 3) {
            return new OverallAqiResult(null, "Insufficient Data", null, false, "Minimum 3 pollutants required for official CPCB calculation.");
        }

        boolean hasParticulate = pollutantConcentrations.containsKey("PM2.5") || pollutantConcentrations.containsKey("PM25")
                || pollutantConcentrations.containsKey("PM10");

        if (!hasParticulate) {
            return new OverallAqiResult(null, "Insufficient Data", null, false, "At least one particulate parameter (PM2.5 or PM10) is required.");
        }

        int maxSubIndex = -1;
        String prominent = null;

        for (Map.Entry<String, Double> entry : pollutantConcentrations.entrySet()) {
            Integer sub = calculateSubIndex(entry.getKey(), entry.getValue());
            if (sub != null && sub > maxSubIndex) {
                maxSubIndex = sub;
                prominent = entry.getKey().toUpperCase();
            }
        }

        if (maxSubIndex < 0) {
            return new OverallAqiResult(null, "Insufficient Data", null, false, "Could not determine valid sub-indices.");
        }

        return new OverallAqiResult(maxSubIndex, getAqiCategory(maxSubIndex), prominent, true, "Calculated using CPCB IND-AQI methodology");
    }
}

