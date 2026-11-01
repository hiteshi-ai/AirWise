package com.airwise;

import com.airwise.entity.MonitoringStation;
import com.airwise.entity.OfficialAqiRecord;
import com.airwise.entity.Role;
import com.airwise.entity.User;
import com.airwise.repository.MonitoringStationRepository;
import com.airwise.repository.OfficialAqiRecordRepository;
import com.airwise.repository.PollutantObservationRepository;
import com.airwise.repository.UserRepository;
import com.airwise.service.AqiCalculationService;
import com.airwise.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AirwiseApplicationTests {

    @Autowired
    private MonitoringStationRepository stationRepository;

    @Autowired
    private PollutantObservationRepository observationRepository;

    @Autowired
    private OfficialAqiRecordRepository aqiRecordRepository;

    @Autowired
    private AqiCalculationService aqiCalculationService;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void contextLoadsAndSeedingOperates() {
        // Verify genuine Indian CAAQMS stations are seeded
        List<MonitoringStation> stations = stationRepository.findAll();
        assertFalse(stations.isEmpty(), "CAAQMS monitoring stations should be seeded");
        assertTrue(stations.size() >= 25, "Should have 25+ authentic Indian CAAQMS stations");

        // Verify observations and official AQI records exist
        long obsCount = observationRepository.count();
        assertTrue(obsCount > 500, "Should have historical pollutant observations seeded");

        long aqiCount = aqiRecordRepository.count();
        assertTrue(aqiCount > 50, "Should have official CPCB AQI records seeded");
    }

    @Test
    void testOfficialCpcbAqiSubIndexCalculations() {
        // CPCB Breakpoints:
        // PM2.5 = 60 ug/m3 -> Sub-Index 100 (Satisfactory)
        Integer subPm25 = aqiCalculationService.calculateSubIndex("PM2.5", 60.0);
        assertEquals(100, subPm25);

        // PM10 = 100 ug/m3 -> Sub-Index 100
        Integer subPm10 = aqiCalculationService.calculateSubIndex("PM10", 100.0);
        assertEquals(100, subPm10);

        // Good AQI range
        Integer subGood = aqiCalculationService.calculateSubIndex("PM2.5", 15.0);
        assertNotNull(subGood);
        assertTrue(subGood <= 50);
        assertEquals("Good", aqiCalculationService.getAqiCategory(subGood));

        // Test Overall AQI rule: Requires >= 3 pollutants and at least one particulate
        AqiCalculationService.OverallAqiResult validResult = aqiCalculationService.calculateOverallAqi(Map.of(
                "PM2.5", 75.0,
                "PM10", 140.0,
                "NO2", 45.0,
                "SO2", 15.0
        ));
        assertTrue(validResult.isValid());
        assertNotNull(validResult.getAqi());
        assertNotNull(validResult.getProminentPollutant());

        // Test Insufficient Data: Only 2 pollutants
        AqiCalculationService.OverallAqiResult invalidResult = aqiCalculationService.calculateOverallAqi(Map.of(
                "NO2", 45.0,
                "SO2", 15.0
        ));
        assertFalse(invalidResult.isValid(), "Should fail with insufficient data when < 3 pollutants and no particulate");
        assertEquals("Insufficient Data", invalidResult.getCategory());
    }

    @Test
    void testCitizenRegistrationAndOneTimeSuperAdmin() {
        // Test citizen registration
        String citizenEmail = "testcitizen." + System.currentTimeMillis() + "@airwise.in";
        AuthService.AuthResponse citizen = authService.registerCitizen("Test Citizen", citizenEmail, "Password@123");
        assertNotNull(citizen.getToken());
        assertEquals("ROLE_CITIZEN", citizen.getRole());

        // Test initial super admin setup
        if (!authService.isSuperAdminConfigured()) {
            AuthService.AuthResponse admin = authService.setupInitialSuperAdmin(
                    "Primary Super Admin", "superadmin.test@airwise.in", "AdminPass@123");
            assertNotNull(admin.getToken());
            assertEquals("ROLE_SUPER_ADMIN", admin.getRole());
            assertTrue(authService.isSuperAdminConfigured());

            // Second setup must be rejected
            assertThrows(IllegalStateException.class, () -> {
                authService.setupInitialSuperAdmin("Hacker", "fake@airwise.in", "FakePass@123");
            });
        }
    }
}

