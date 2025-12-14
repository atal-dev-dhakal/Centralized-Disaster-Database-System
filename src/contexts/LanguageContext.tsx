import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "np";

interface Translations {
  [key: string]: {
    en: string;
    np: string;
  };
}

// All translatable strings
export const translations: Translations = {
  // Header
  login: { en: "Login", np: "लग इन" },
  logout: { en: "Logout", np: "लग आउट" },
  welcome: { en: "Welcome", np: "स्वागत छ" },

  // Landing Page
  heroTitle: { en: "Disaster Response, Simplified for Nepal.", np: "आपदा प्रतिक्रिया, नेपालको लागि सरलीकृत।" },
  heroSubtitle: {
    en: "A centralized platform connecting communities with responders. Report incidents fast, track updates, and coordinate aid effectively.",
    np: "समुदायलाई प्रतिक्रियाकर्ताहरूसँग जोड्ने केन्द्रीकृत प्लेटफर्म। घटनाहरू छिटो रिपोर्ट गर्नुहोस्, अपडेटहरू ट्र्याक गर्नुहोस्, र सहायता प्रभावकारी रूपमा समन्वय गर्नुहोस्।"
  },
  loginSignup: { en: "Log In / Sign Up", np: "लग इन / साइन अप" },
  preciseLocation: { en: "Precise Location", np: "सटीक स्थान" },
  preciseLocationDesc: { en: "Pinpoint incidents exactly where they happen to help teams reach you faster.", np: "घटनाहरू जहाँ हुन्छन् त्यहाँ ठ्याक्कै पत्ता लगाउनुहोस् ताकि टोलीहरू तपाईंलाई छिटो पुग्न सकून्।" },
  verifiedData: { en: "Verified Data", np: "प्रमाणित डाटा" },
  verifiedDataDesc: { en: "Administrators verify every report to ensure resources go where needed.", np: "प्रशासकहरूले प्रत्येक रिपोर्ट प्रमाणित गर्छन् ताकि स्रोतहरू आवश्यक ठाउँमा पुगून्।" },
  communityPowered: { en: "Community Powered", np: "समुदाय संचालित" },
  communityPoweredDesc: { en: "Built for citizens and officials to work together in real-time.", np: "नागरिक र अधिकारीहरूले वास्तविक समयमा सँगै काम गर्न बनाइएको।" },

  // Auth Page
  logIn: { en: "Log In", np: "लग इन" },
  createAccount: { en: "Create Account", np: "खाता बनाउनुहोस्" },
  iAmA: { en: "I am a:", np: "म हुँ:" },
  user: { en: "User", np: "प्रयोगकर्ता" },
  administrator: { en: "Administrator", np: "प्रशासक" },
  fullName: { en: "Full Name", np: "पूरा नाम" },
  emailAddress: { en: "Email Address", np: "इमेल ठेगाना" },
  password: { en: "Password", np: "पासवर्ड" },
  enterPortal: { en: "Enter Portal", np: "पोर्टलमा प्रवेश गर्नुहोस्" },
  pleaseWait: { en: "Please wait...", np: "कृपया पर्खनुहोस्..." },

  // Respond Hub
  reportIncident: { en: "Report an Incident", np: "घटना रिपोर्ट गर्नुहोस्" },
  selectToReport: { en: "Select what you need to report and fill in the details.", np: "तपाईंले रिपोर्ट गर्नुपर्ने कुरा छान्नुहोस् र विवरणहरू भर्नुहोस्।" },
  missingPerson: { en: "Missing Person", np: "हराएको व्यक्ति" },
  missingPersonDesc: { en: "Report a person who has gone missing during or after a disaster.", np: "आपदाको समयमा वा पछि हराएको व्यक्तिको रिपोर्ट गर्नुहोस्।" },
  damageHazard: { en: "Damage / Hazard", np: "क्षति / खतरा" },
  damageHazardDesc: { en: "Report structural damage, hazards, or emergency situations.", np: "संरचनात्मक क्षति, खतराहरू, वा आपतकालीन परिस्थितिहरूको रिपोर्ट गर्नुहोस्।" },
  missingPersonReport: { en: "Missing Person Report", np: "हराएको व्यक्तिको रिपोर्ट" },
  damageHazardReport: { en: "Damage / Hazard Report", np: "क्षति / खतरा रिपोर्ट" },
  fullNameMissing: { en: "Full Name of Missing Person", np: "हराएको व्यक्तिको पूरा नाम" },
  lastSeenLocation: { en: "Last Seen Location", np: "अन्तिम पटक देखिएको स्थान" },
  contactNumber: { en: "Contact Number for Updates", np: "अपडेटहरूको लागि सम्पर्क नम्बर" },
  uploadPhoto: { en: "Upload Photo", np: "फोटो अपलोड गर्नुहोस्" },
  clickToUpload: { en: "Click to upload", np: "अपलोड गर्न क्लिक गर्नुहोस्" },
  pinLocation: { en: "Pin Last Seen Location on Map", np: "नक्सामा अन्तिम पटक देखिएको स्थान पिन गर्नुहोस्" },
  submitMissingReport: { en: "Submit Missing Report", np: "हराएको रिपोर्ट पेश गर्नुहोस्" },
  incidentType: { en: "Incident Type", np: "घटनाको प्रकार" },
  landslide: { en: "Landslide", np: "पहिरो" },
  flood: { en: "Flood", np: "बाढी" },
  fire: { en: "Fire", np: "आगलागी" },
  earthquake: { en: "Earthquake Damage", np: "भूकम्प क्षति" },
  other: { en: "Other", np: "अन्य" },
  description: { en: "Description of Situation", np: "परिस्थितिको विवरण" },
  descriptionPlaceholder: { en: "Briefly describe what help is needed...", np: "कस्तो सहायता चाहिन्छ संक्षेपमा वर्णन गर्नुहोस्..." },
  areThereCasualties: { en: "Are there casualties?", np: "मृत्यु/घाइतेहरू छन्?" },
  yes: { en: "Yes", np: "छ" },
  no: { en: "No", np: "छैन" },
  criticalPriority: { en: "⚠ This report will be marked as critical priority.", np: "⚠ यो रिपोर्ट महत्वपूर्ण प्राथमिकताको रूपमा चिन्ह लगाइनेछ।" },
  pinIncidentLocation: { en: "Pin Incident Location on Map", np: "नक्सामा घटना स्थान पिन गर्नुहोस्" },
  sendEmergencyReport: { en: "Send Emergency Report", np: "आपतकालीन रिपोर्ट पठाउनुहोस्" },
  yourRecentReports: { en: "Your Recent Reports", np: "तपाईंको भर्खरका रिपोर्टहरू" },
  noReportsYet: { en: "No reports submitted yet.", np: "अझै कुनै रिपोर्ट पेश गरिएको छैन।" },
  submitting: { en: "Submitting...", np: "पेश गर्दै..." },

  // Admin Dashboard
  adminCommandCenter: { en: "Admin Command Center", np: "प्रशासक नियन्त्रण केन्द्र" },
  activeReports: { en: "Active Reports", np: "सक्रिय रिपोर्टहरू" },
  criticalHazards: { en: "Critical Hazards", np: "गम्भीर खतराहरू" },
  verifiedResolved: { en: "Verified / Resolved", np: "प्रमाणित / समाधान" },
  liveIncidentFeed: { en: "Live Incident Feed", np: "लाइभ घटना फिड" },
  noReportsYetAdmin: { en: "No reports yet.", np: "अझै कुनै रिपोर्ट छैन।" },
  verify: { en: "Verify", np: "प्रमाणित गर्नुहोस्" },
  viewOnMap: { en: "View on Map", np: "नक्सामा हेर्नुहोस्" },
  verified: { en: "Verified", np: "प्रमाणित" },
  critical: { en: "CRITICAL", np: "गम्भीर" },
  legend: { en: "Legend", np: "व्याख्या" },
  damageUnverified: { en: "Damage (Unverified)", np: "क्षति (अप्रमाणित)" },
  photoGallery: { en: "Photo Gallery", np: "फोटो ग्यालेरी" },
  exportData: { en: "Export Data", np: "डाटा निर्यात गर्नुहोस्" },
  exportCSV: { en: "Export CSV", np: "CSV निर्यात गर्नुहोस्" },
  exportPDF: { en: "Export PDF", np: "PDF निर्यात गर्नुहोस्" },
  map: { en: "Map", np: "नक्सा" },
  feed: { en: "Feed", np: "फिड" },
  gallery: { en: "Gallery", np: "ग्यालेरी" },
  noPhotosYet: { en: "No photos uploaded yet.", np: "अझै कुनै फोटो अपलोड गरिएको छैन।" },

  // Dispatch Module
  dispatch: { en: "Dispatch", np: "पठाउनुहोस्" },
  dispatchTeam: { en: "Dispatch Team", np: "टोली पठाउनुहोस्" },
  assignTeam: { en: "Assign Team", np: "टोली तोक्नुहोस्" },
  selectTeam: { en: "Select a team to dispatch", np: "पठाउने टोली छान्नुहोस्" },
  teamPolice: { en: "Nepal Police", np: "नेपाल प्रहरी" },
  teamArmy: { en: "Nepal Army", np: "नेपाली सेना" },
  teamRedCross: { en: "Red Cross Nepal", np: "रेड क्रस नेपाल" },
  teamFireBrigade: { en: "Fire Brigade", np: "दमकल" },
  teamMedical: { en: "Medical Team", np: "चिकित्सा टोली" },
  teamRescue: { en: "Search & Rescue", np: "खोज तथा उद्धार" },
  teamExcavator: { en: "Heavy Equipment", np: "भारी उपकरण" },
  teamVolunteers: { en: "Volunteers", np: "स्वयंसेवकहरू" },
  addNote: { en: "Add Note (Optional)", np: "नोट थप्नुहोस् (ऐच्छिक)" },
  notePlaceholder: { en: "Any special instructions...", np: "कुनै विशेष निर्देशनहरू..." },
  confirmDispatch: { en: "Confirm Dispatch", np: "पठाउने पुष्टि गर्नुहोस्" },
  cancel: { en: "Cancel", np: "रद्द गर्नुहोस्" },
  dispatched: { en: "Dispatched", np: "पठाइयो" },
  inProgress: { en: "In Progress", np: "कार्यमा" },
  resolved: { en: "Resolved", np: "समाधान भयो" },
  pending: { en: "Pending", np: "पर्खिरहेको" },
  markResolved: { en: "Mark Resolved", np: "समाधान चिन्ह लगाउनुहोस्" },
  dispatchedTo: { en: "Dispatched to", np: "पठाइएको" },
  dispatchedReports: { en: "Dispatched", np: "पठाइएको" },
  statusPending: { en: "Pending", np: "पर्खिरहेको" },
  statusDispatched: { en: "Team Dispatched", np: "टोली पठाइयो" },
  statusInProgress: { en: "Work in Progress", np: "काम भइरहेको छ" },
  statusResolved: { en: "Resolved", np: "समाधान भयो" },
  dispatchSuccess: { en: "Team dispatched successfully", np: "टोली सफलतापूर्वक पठाइयो" },
  resolveSuccess: { en: "Report marked as resolved", np: "रिपोर्ट समाधान भएको चिन्ह लगाइयो" },

  // Footer
  copyright: { en: "© 2025 SajhaSahayog. Built for Nepal.", np: "© २०२५ सझासहयोग। नेपालको लागि बनाइएको।" },
  privacy: { en: "Privacy", np: "गोपनीयता" },
  contactSupport: { en: "Contact Support", np: "सम्पर्क सहायता" },

  // Rehabilitation Module
  rehabilitation: { en: "Rehabilitation", np: "पुनर्स्थापना" },
  rehabCases: { en: "Rehab Cases", np: "पुनर्स्थापना केसहरू" },
  createRehabCase: { en: "Create Rehab Case", np: "पुनर्स्थापना केस बनाउनुहोस्" },
  convertToRehab: { en: "Convert to Rehab", np: "पुनर्स्थापनामा रूपान्तरण" },
  rehabNeeds: { en: "Rehabilitation Needs", np: "पुनर्स्थापना आवश्यकताहरू" },
  needTempShelter: { en: "Temporary Shelter", np: "अस्थायी आश्रय" },
  needFoodSupport: { en: "Food Support", np: "खाद्य सहायता" },
  needMedicalFollowup: { en: "Medical Follow-up", np: "चिकित्सा अनुगमन" },
  needPsychosocial: { en: "Psychosocial Support", np: "मनोसामाजिक सहायता" },
  needHouseRepair: { en: "House Repair", np: "घर मर्मत" },
  needSchoolRestoration: { en: "School Restoration", np: "विद्यालय पुनर्निर्माण" },
  needRoadRepair: { en: "Road/Bridge Repair", np: "सडक/पुल मर्मत" },
  priorityLow: { en: "Low", np: "कम" },
  priorityMedium: { en: "Medium", np: "मध्यम" },
  priorityHigh: { en: "High", np: "उच्च" },
  assignedOrg: { en: "Assigned Organization/Team", np: "तोकिएको संस्था/टोली" },
  targetDate: { en: "Target Completion Date", np: "लक्षित पूरा मिति" },
  rehabNotes: { en: "Notes", np: "टिप्पणीहरू" },
  rehabOpen: { en: "Open", np: "खुला" },
  rehabInProgress: { en: "In Progress", np: "कार्यमा" },
  rehabCompleted: { en: "Completed", np: "पूरा भयो" },
  saveRehabCase: { en: "Save Rehab Case", np: "पुनर्स्थापना केस सुरक्षित गर्नुहोस्" },
  rehabCreatedSuccess: { en: "Rehab case created successfully", np: "पुनर्स्थापना केस सफलतापूर्वक बनाइयो" },
  rehabUpdatedSuccess: { en: "Rehab case updated successfully", np: "पुनर्स्थापना केस सफलतापूर्वक अपडेट गरियो" },
  noRehabCases: { en: "No rehabilitation cases yet.", np: "अझै कुनै पुनर्स्थापना केस छैन।" },
  linkedDamageReport: { en: "Linked to Damage Report", np: "क्षति रिपोर्टसँग जोडिएको" },
  viewAidLogs: { en: "View Aid Logs", np: "सहायता लगहरू हेर्नुहोस्" },

  // Aid Distribution
  aidDistribution: { en: "Aid Distribution", np: "सहायता वितरण" },
  logAidDistribution: { en: "Log Aid Distribution", np: "सहायता वितरण लग गर्नुहोस्" },
  addAidLog: { en: "Add Aid Log", np: "सहायता लग थप्नुहोस्" },
  itemType: { en: "Item Type", np: "वस्तुको प्रकार" },
  itemRice: { en: "Rice", np: "चामल" },
  itemWater: { en: "Water", np: "पानी" },
  itemTarpaulin: { en: "Tarpaulin", np: "त्रिपाल" },
  itemMedicine: { en: "Medicine", np: "औषधि" },
  itemBlankets: { en: "Blankets", np: "कम्बल" },
  itemTents: { en: "Tents", np: "टेन्ट" },
  itemClothing: { en: "Clothing", np: "कपडा" },
  itemCash: { en: "Cash Assistance", np: "नगद सहायता" },
  itemOther: { en: "Other", np: "अन्य" },
  quantity: { en: "Quantity", np: "मात्रा" },
  unit: { en: "Unit", np: "एकाइ" },
  unitKg: { en: "kg", np: "केजी" },
  unitLiters: { en: "liters", np: "लिटर" },
  unitPieces: { en: "pieces", np: "थान" },
  unitPackets: { en: "packets", np: "प्याकेट" },
  unitRupees: { en: "Rs.", np: "रु." },
  deliveredBy: { en: "Delivered By (Team/Org)", np: "वितरण गर्ने (टोली/संस्था)" },
  deliveredTo: { en: "Delivered To (Household/Point)", np: "वितरण गरिएको (घरधुरी/स्थान)" },
  ward: { en: "Ward", np: "वडा" },
  proofPhoto: { en: "Proof Photo (Optional)", np: "प्रमाण फोटो (ऐच्छिक)" },
  aidNotes: { en: "Notes", np: "टिप्पणीहरू" },
  saveAidLog: { en: "Save Aid Log", np: "सहायता लग सुरक्षित गर्नुहोस्" },
  aidLogSuccess: { en: "Aid distribution logged successfully", np: "सहायता वितरण सफलतापूर्वक लग गरियो" },
  noAidLogs: { en: "No aid distribution logs yet.", np: "अझै कुनै सहायता वितरण लग छैन।" },
  totalAidItems: { en: "Total Items Distributed", np: "वितरित कुल वस्तुहरू" },
  recentDistributions: { en: "Recent Distributions", np: "भर्खरका वितरणहरू" },
  error: { en: "Error", np: "त्रुटि" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
