package com.airwise.service;

import com.airwise.entity.HelpArticle;
import com.airwise.repository.HelpArticleRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HelpArticleService {

    private final HelpArticleRepository helpArticleRepository;

    public HelpArticleService(HelpArticleRepository helpArticleRepository) {
        this.helpArticleRepository = helpArticleRepository;
    }

    @PostConstruct
    public void seedInitialHelpArticles() {
        if (helpArticleRepository.count() == 0) {
            seedHelpGuides();
        }
    }

    private void seedHelpGuides() {
        List<HelpArticle> articles = List.of(
            // CITIZEN ARTICLES
            new HelpArticle(
                "CITIZEN",
                "GETTING_STARTED",
                "How to Search Cities and Interpret AQI",
                "शहर कैसे खोजें और वायु गुणवत्ता सूचकांक (AQI) को कैसे समझें",
                "To explore air quality in your area, select your State and City from the search filters or click directly on any monitoring pin on the interactive India map. AIRWISE presents the official Central Pollution Control Board (CPCB) AQI value alongside its category: Good (0-50), Satisfactory (51-100), Moderate (101-200), Poor (201-300), Very Poor (301-400), and Severe (401-500).",
                "अपने क्षेत्र में वायु गुणवत्ता जानने के लिए, सर्च फ़िल्टर से अपना राज्य और शहर चुनें या सीधे भारत के इंटरेक्टिव मानचित्र पर किसी भी निगरानी स्टेशन पर क्लिक करें। AIRWISE आधिकारिक केंद्रीय प्रदूषण नियंत्रण बोर्ड (CPCB) AQI मान को उसकी श्रेणी के साथ प्रदर्शित करता है: अच्छा (0-50), संतोषजनक (51-100), मध्यम (101-200), खराब (201-300), बहुत खराब (301-400), और गंभीर (401-500)।",
                1,
                false
            ),
            new HelpArticle(
                "CITIZEN",
                "AQI_EXPLANATION",
                "Understanding Key Air Pollutants",
                "प्रमुख वायु प्रदूषकों को समझना",
                "Particulate Matter (PM2.5 and PM10) are fine inhalable particles from vehicular exhaust, dust, and burning. NO2 and SO2 originate from fuel combustion and thermal power generation. Carbon Monoxide (CO) impairs oxygen delivery in the bloodstream, and Ozone (O3) forms via sunlight photochemical reactions. Always refer to official threshold warnings during elevated pollution days.",
                "पार्टिकुलेट मैटर (PM2.5 और PM10) वाहनों के धुएं, धूल और दहन से उत्पन्न होने वाले महीन कण हैं। NO2 और SO2 ईंधन दहन और ताप विद्युत संयंत्रों से निकलते हैं। कार्बन मोनोऑक्साइड (CO) रक्तप्रवाह में ऑक्सीजन संचरण को बाधित करता है, और ओजोन (O3) सूर्य के प्रकाश की रासायनिक प्रतिक्रियाओं से बनता है। अत्यधिक प्रदूषण के दिनों में हमेशा आधिकारिक स्वास्थ्य सावधानियों का पालन करें।",
                2,
                false
            ),
            new HelpArticle(
                "CITIZEN",
                "TOOLS",
                "Setting Up Watchlists and Personalized Alerts",
                "वॉचलिस्ट और व्यक्तिगत अलर्ट सेट करना",
                "Registered citizens can bookmark frequently monitored stations using the 'Add to Watchlist' star icon. You can also configure automated email notifications when air quality at your station deteriorates beyond Moderate, Poor, or Severe categories.",
                "पंजीकृत नागरिक 'वॉचलिस्ट में जोड़ें' स्टार आइकन का उपयोग करके अक्सर निगरानी किए जाने वाले स्टेशनों को सहेज सकते हैं। जब आपके चुने हुए स्टेशन पर वायु गुणवत्ता मध्यम, खराब या गंभीर स्तर से अधिक हो जाती है, तो आप स्वचालित अलर्ट भी कॉन्फ़िगर कर सकते हैं।",
                3,
                true
            ),

            // RESEARCHER ARTICLES
            new HelpArticle(
                "RESEARCHER",
                "GETTING_STARTED",
                "Researcher Access and Account Verification",
                "शोधकर्ता पहुंच और खाता सत्यापन प्रक्रिया",
                "Environmental analysts, university students, and researchers must submit an institutional affiliation, research discipline, and statement of justification. Platform administrators manually verify credentials before activating advanced analytical features.",
                "पर्यावरण विश्लेषकों, विश्वविद्यालय के छात्रों और शोधकर्ताओं को संस्थागत संबद्धता, अनुसंधान क्षेत्र और औचित्य प्रस्तुत करना आवश्यक है। उन्नत विश्लेषणात्मक सुविधाओं को सक्रिय करने से पहले प्लेटफ़ॉर्म प्रशासक इन क्रेडेंशियल्स की मैन्युअल समीक्षा करते हैं।",
                10,
                false
            ),
            new HelpArticle(
                "RESEARCHER",
                "TOOLS",
                "Utilizing the Advanced Data Explorer & Statistical Tools",
                "उन्नत डेटा एक्सप्लोरर और सांख्यिकीय उपकरणों का उपयोग",
                "The Researcher Portal provides continuous observation filtering across stations, pollutants, and time ranges. Advanced modules include Pollutant Fingerprinting (multi-pollutant average profiles), Persistence Analysis (% observation hours exceeding NAAQS standards), and Statistical Spike/Anomaly Detection (z-score identification of localized events).",
                "शोधकर्ता पोर्टल स्टेशनों, प्रदूषकों और समय सीमाओं में निरंतर अवलोकन फ़िल्टरिंग प्रदान करता है। उन्नत मॉड्यूल में प्रदूषक फ़िंगरप्रिंटिंग (मल्टी-प्रदूषक औसत प्रोफाइल), दृढ़ता विश्लेषण (NAAQS मानकों से अधिक घंटों का %), और सांख्यिकीय स्पाइक/विसंगति पहचान (z-स्कोर आधारित स्थानीय घटनाओं का पता लगाना) शामिल हैं।",
                11,
                false
            ),
            new HelpArticle(
                "RESEARCHER",
                "TOOLS",
                "Exporting Genuine Datasets and Generating PDF Dossiers",
                "प्रामाणिक डेटासेट निर्यात और पीडीएफ शोध रिपोर्ट तैयार करना",
                "Export traceable observation records to Excel (.xlsx) and CSV formats complete with CAAQMS station coordinates, observation timestamps (IST), source attribution, and data quality flags. Generate formatted PDF research dossiers for citations and academic publications.",
                "CAAQMS स्टेशन निर्देशांक, अवलोकन समय (IST), स्रोत संदर्भ और डेटा गुणवत्ता फ़्लैग के साथ एक्सेल (.xlsx) और सीएसवी प्रारूपों में वास्तविक अवलोकन रिकॉर्ड निर्यात करें। अकादमिक शोध और संदर्भों के लिए व्यवस्थित पीडीएफ रिपोर्ट तैयार करें।",
                12,
                true
            ),

            // ADMIN ARTICLES
            new HelpArticle(
                "ADMIN",
                "GETTING_STARTED",
                "Hierarchical Governance and Administrator Roles",
                "पदानुक्रमित शासन और प्रशासक भूमिकाएं",
                "AIRWISE implements a three-tier administrative hierarchy: Super Admin (full platform control and initialization), Central Admin (national-level monitoring and researcher approvals), and State Admin (strictly scoped to monitoring stations and quality reviews within their assigned Indian state).",
                "AIRWISE तीन-स्तरीय प्रशासनिक पदानुक्रम लागू करता है: सुपर एडमिन (पूर्ण प्लेटफ़ॉर्म नियंत्रण और प्रारंभिक सेटअप), सेंट्रल एडमिन (राष्ट्रीय स्तर की निगरानी और शोधकर्ता अनुमोदन), और स्टेट एडमिन (विशेष रूप से अपने आवंटित भारतीय राज्य के भीतर स्टेशनों और गुणवत्ता की समीक्षा तक सीमित)।",
                20,
                false
            ),
            new HelpArticle(
                "ADMIN",
                "DATA_SOURCES",
                "Data Source Ingestion & Synchronization Management",
                "डेटा स्रोत अंतर्ग्रहण और सिंक्रनाइज़ेशन प्रबंधन",
                "Manage upstream connections with CPCB CAAQMS transmission endpoints and Government of India Open Data APIs. Monitor automated background cron synchronization logs, trigger manual on-demand sync cycles, and audit any ingestion anomalies.",
                "CPCB CAAQMS ट्रांसमिशन एंडपॉइंट्स और भारत सरकार के ओपन डेटा एपीआई के साथ कनेक्शन प्रबंधित करें। स्वचालित पृष्ठभूमि क्रॉन सिंक लॉग की निगरानी करें, मांग पर मैन्युअल सिंक चक्र ट्रिगर करें, और किसी भी अंतर्ग्रहण विसंगतियों का ऑडिट करें।",
                21,
                false
            )
        );

        helpArticleRepository.saveAll(articles);
    }

    public List<HelpArticle> getArticlesForRole(String role) {
        if (role == null || role.isBlank() || role.equals("ROLE_CITIZEN")) {
            return helpArticleRepository.findByTargetRoleInOrderBySortOrderAsc(List.of("CITIZEN", "GENERAL"));
        } else if (role.equals("ROLE_RESEARCHER")) {
            return helpArticleRepository.findByTargetRoleInOrderBySortOrderAsc(List.of("RESEARCHER", "CITIZEN", "GENERAL"));
        } else {
            // Admin sees all
            return helpArticleRepository.findAll();
        }
    }

    public List<HelpArticle> getAllArticles() {
        return helpArticleRepository.findAll();
    }

    @Transactional
    public HelpArticle saveOrUpdateArticle(HelpArticle article) {
        article.setUpdatedAt(LocalDateTime.now());
        return helpArticleRepository.save(article);
    }

    @Transactional
    public void deleteArticle(Long id) {
        helpArticleRepository.deleteById(id);
    }
}

