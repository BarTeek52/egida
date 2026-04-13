import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInAnonymously, 
  signInWithCustomToken, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  onSnapshot, 
  serverTimestamp
} from 'firebase/firestore';
import { 
  Shield, 
  RefreshCcw, 
  FileText, 
  Zap, 
  BarChart3, 
  Database, 
  Users, 
  Search, 
  Plus, 
  LogOut,
  ChevronRight,
  UserCircle,
  Download,
  RotateCcw,
  AlertCircle,
  Loader2,
  Menu,
  X,
  CheckSquare,
  LayoutDashboard,
  Layers,
  ArrowUpRight,
  MapPin,
  Trash2,
  Car,
  ShieldCheck,
  Save,
  CheckCircle2,
  XCircle,
  Building2,
  Settings2,
  PackagePlus,
  UserPlus,
  ShieldAlert,
  Briefcase,
  Star,
  Activity,
  Scale,
  FilePlus,
  Fingerprint,
  Wrench,
  Calendar
} from 'lucide-react';

// --- KONFIGURACJA I INICJALIZACJA FIREBASE (EGIDA) ---
const firebaseConfig = {
    apiKey: "AIzaSyD8ioxiSNO3mI_ppLRezGdj-b5hCB7-hwg",
    authDomain: "egida-os.firebaseapp.com",
    projectId: "egida-os",
    storageBucket: "egida-os.firebasestorage.app",
    messagingSenderId: "263654193064",
    appId: "1:263654193064:web:70adeef7eefbd944364f9d"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'pallada-eigda';

// --- SYSTEM CACHE DLA PDF (PRZYSPIESZENIE GENEROWANIA) ---
const pdfAssetsCache = {
  jsPdfLoaded: false,
  fonts: {},
  logos: {},
  mainLogo: null
};

// --- STAŁE I STYLE (EGIDA) ---
const TOWARZYSTWA = [
    "PZU S.A.", "STU ERGO HESTIA S.A.", "GENERALI TU S.A.", "TUiR WARTA S.A.",
    "Compensa TU S.A", "Aviva S.A.", "ALLIANZ Polska S.A. TUiR", "BENEFIA TU S.A.",
    "InterRisk TU S.A.", "LINK4 TU S.A.", "Proama (Generali TU S.A.)", "TUW TUW",
    "TUZ TUW", "UNIQA TU S.A.", "MTU ( STU ERGO HESTIA S.A.)",
    "Pocztowe Towarzystwo Ubezpieczeń Wzajemnych", "Balcia Insurance SE",
    "Wiener TU S.A.", "Accredited Insurance", "INSURANCE COMPANY EUROINS AD",
    "ZAVAROVALNICA TRIGLAV D.D. (Trasti)", "WEFOX INSURANCE AG ODDZIAŁ W POLSCE",
    "PKO Towarzystwo Ubezpieczeń S.A."
];

const styles = {
  header: { fontFamily: "'Semplicita Pro', sans-serif" },
  body: { fontFamily: "'Kiro', sans-serif" }
};

// --- SYMBOL: Szyba (OFERTOWANIE) ---
const WindshieldIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 18C2 18 3.5 6 12 6C20.5 6 22 18 22 18H2Z" />
    <path d="M2 18L12 18L22 18" />
    <path d="M7 11L17 11" />
  </svg>
);

// --- LOGO PALLADA ---
const pallada_trans_logo = "./pallada_trans_logo.png"; 

// --- LOGOTYPY TOWARZYSTW ---
const LOGOS = {
  "Ergo Hestia": "./ergo_hestia_logo.png",
  "Ergo Biznes": "./ergo_hestia_logo.png",
  "PZU S.A.": "./pzu_logo.png",
  "Warta": "./warta_logo.png",
  "Link4": "./link4_logo.png",
  "HDI": "./hdi_logo.png",
  "Compensa": "./compensa_logo.png",
  "Wiener": "./wiener_logo.png",
  "Interrisk": "./interrisk_logo.png",
  "Generali": "./generali_logo.png",
  "Allianz": "./allianz_logo.png",
  "Uniqa": "./uniqa_logo.png",
  "MTU": "./mtu_logo.png"
};

// --- BAZA KLAUZUL HESTII (OFERTOWANIE) ---
const KLAUZULE_HESTIA_BAZA = {
  OC: [
    "K120 Pojazd zastępczy - motocykl",
    "K072 Wydłużenie okresu najmu (Wariant Turbo)",
    "K074 Pojazd zastępczy (Seg. D)",
    "K092 Zwrot udziału własnego (do 2000 zł)",
    "K119 Ubezpieczenie opon - zwrot kosztów",
    "K118 Holowanie pojazdu w Polsce",
    "K084 Zwiększenie limitu usługi Kontynuacja podróży (Wypadek)",
    "K082 Zwiększenie limitu usługi Kontynuacja podróży (Wyp. i Awaria)",
    "K076 Bagaż – rzeczy motocyklisty",
    "K094 Bagaż – suma do 15 000 zł",
    "K095 Bagaż – suma do 20 000 zł"
  ],
  AC: [
    "K076 Bagaż – rzeczy motocyklisty",
    "K094 Bagaż do 15 000 zł",
    "K095 Bagaż do 20 000 zł",
    "K120 Pojazd zastępczy - motocykl",
    "K072 Wydłużenie okresu najmu (Wariant Turbo)",
    "K074 Pojazd zastępczy segmentu D (Car ASS)",
    "K092 Zwrot kosztów udziału własnego (do 2000 zł) - Car ASS",
    "K119 Ubezpieczenie opon - zwrot kosztów",
    "K118 Holowanie pojazdu w Polsce",
    "K084 Zwiększenie limitu (Wypadek)",
    "K082 Zwiększenie limitu (Wypadek i Awaria)",
    "K078 Ubezpieczenie powłoki ceramicznej (do 3 lat)",
    "K088 Rozszerzenie Wyposażenie Dodatkowe",
    "K090 Zwrot kosztów udziału własnego (do 2000 zł) - AC",
    "K096 Podwyższenie granicy dla powłok ceramicznych",
    "K122 Powłoka elastomerowa (SU 5000 zł)",
    "K124 Powłoka elastomerowa (SU 8000 zł)",
    "K128 Zwiększenie SU w Wyposażeniu dodatkowym",
    "K070 Stała Suma Ubezpieczenia (Wariant II)",
    "K126 II AC o powłokę elastomerową (SU 5000 zł)",
    "K098 II AC o powłokę ceramiczną",
    "K135 Niezdolność do pracy (NNW KiP)"
  ],
  OC_AC: [
    "K076 Rozszerzenie Bagaż – rzeczy motocyklisty",
    "K094 Bagaż do 15 000 zł",
    "K095 Bagaż do 20 000 zł",
    "K120 Pojazd zastępczy - motocykl",
    "K072 Wydłużenie najmu (Turbo)",
    "K074 Pojazd zastępczy segment D",
    "K092 Zwrot udziału własnego (Car ASS)",
    "K119 Ubezpieczenie opon",
    "K118 Holowanie w Polsce",
    "K084 Zwiększenie limitu (Wypadek)",
    "K082 Zwiększenie limitu (Wypadek i Awaria)",
    "K088 Rozszerzenie Wyposażenie Dodatkowe",
    "K090 Zwrot udziału własnego (AC)",
    "K096 Podwyższenie granicy dla powłok ceramicznych",
    "K122 Powłoka elastomerowa (5000 zł)",
    "K124 Powłoka elastomerowa (8000 zł)",
    "K128 Zwiększenie SU Wyposażenie dodatkowe",
    "K070 Stała Suma Ubezpieczenia (Wariant II)",
    "K126 II AC o powłokę elastomerową (5000 zł)",
    "K098 II AC o powłokę ceramiczną",
    "K135 Niezdolność do pracy (NNW KiP)",
    "K066 Zniesienie udziału w szybach"
  ]
};

// --- KONFIGURACJA DODATKÓW PER FIRMA (OFERTOWANIE) ---
const DODATKI_KONFIG = {
  "PZU S.A.": [
    { id: "nnw", label: "NNW", icon: UserPlus, options: ["5.000 zł", "10.000 zł", "15.000 zł"] },
    { id: "ass", label: "Assistance", icon: Zap },
    { id: "szyby", label: "Szyby", icon: WindshieldIcon, options: ["Zamiennik (Suma 5.000 zł)", "Oryginał (Suma 5.000 zł)"] },
    { id: "ochrona_znizek_oc", label: "Ochrona zniżki OC", icon: ShieldAlert, showIn: ['OC', 'OC+AC'] },
    { id: "ochrona_znizek_ac", label: "Ochrona zniżki AC", icon: ShieldAlert, showIn: ['AC', 'OC+AC'] }
  ],
  "Ergo Hestia": [
    { id: "nnw", label: "NNW", icon: UserPlus, options: ["5.000 zł", "10.000 zł", "15.000 zł", "30.000 zł", "60.000 zł"] },
    { id: "car_ass", label: "Assistance", icon: Zap, options: ["Wypadek", "Wypadek i Awaria", "Turbo"] },
    { id: "szyby", label: "Szyby", icon: WindshieldIcon, options: ["Zamiennik (Suma 5.000 zł)", "Oryginał (Suma 5.000 zł)"] },
    { id: "ochrona_znizek_oc", label: "Ochrona zniżki OC", icon: ShieldAlert, showIn: ['OC', 'OC+AC'] },
    { id: "ochrona_znizek_ac", label: "Ochrona zniżki AC", icon: ShieldAlert, showIn: ['AC', 'OC+AC'] },
    { 
      id: "klauzule_katalog", label: "Katalog Klauzul", icon: FilePlus, 
      getMultiOptions: (tryb) => {
        if (tryb === 'OC') return KLAUZULE_HESTIA_BAZA.OC;
        if (tryb === 'AC') return KLAUZULE_HESTIA_BAZA.AC;
        return KLAUZULE_HESTIA_BAZA.OC_AC;
      }
    },
    { id: "bagaz", label: "Bagaż", icon: Briefcase },
    { id: "ochrona_prawna", label: "Ochrona Prawna", icon: Scale }
  ],
  "Ergo Biznes": [
    { id: "nnw", label: "NNW Biznes", icon: UserPlus, options: ["5.000 zł", "10.000 zł", "15.000 zł", "30.000 zł", "60.000 zł"] },
    { id: "car_ass", label: "Assistance Biznes", icon: Zap, options: ["Biznes (Polska)", "Biznes (Europa 200km)", "Biznes (Europa 500km)", "Biznes (Europa 1000km)"] },
    { id: "szyby", label: "Szyby", icon: WindshieldIcon, options: ["Zamiennik (Suma 5.000 zł)", "Oryginał (Suma 5.000 zł)"] },
    { id: "ochrona_znizek_oc", label: "Ochrona zniżki OC", icon: ShieldAlert, showIn: ['OC', 'OC+AC'] },
    { id: "ochrona_znizek_ac", label: "Ochrona zniżki AC", icon: ShieldAlert, showIn: ['AC', 'OC+AC'] },
    { 
      id: "klauzule_katalog_biznes", label: "Katalog Klauzul Biznes", icon: FilePlus, 
      getMultiOptions: (tryb) => {
        if (tryb === 'OC') return KLAUZULE_HESTIA_BAZA.OC;
        if (tryb === 'AC') return KLAUZULE_HESTIA_BAZA.AC;
        return KLAUZULE_HESTIA_BAZA.OC_AC;
      }
    },
    { id: "ochrona_prawna", label: "Ochrona Prawna Biznes", icon: Scale }
  ],
  "Warta": [
    { id: "nnw", label: "NNW", icon: UserPlus, options: ["5.000 zł", "10.000 zł", "15.000 zł"] },
    { id: "warta_pomoc", label: "Warta Pomoc", icon: Zap },
    { id: "szyby", label: "Szyby", icon: WindshieldIcon, options: ["Zamiennik (Suma 5.000 zł)", "Oryginał (Suma 5.000 zł)"] },
    { id: "ochrona_znizek_oc", label: "Ochrona zniżek OC", icon: ShieldAlert, showIn: ['OC', 'OC+AC'] },
    { id: "ochrona_znizek_ac", label: "Ochrona zniżki AC", icon: ShieldAlert, showIn: ['AC', 'OC+AC'] }
  ],
  "Link4": [
    { id: "nnw", label: "NNW", icon: UserPlus, options: ["5.000 zł", "10.000 zł", "15.000 zł"] },
    { id: "ass", label: "Auto Assistance", icon: Zap },
    { id: "szyby", label: "Szyby 24", icon: WindshieldIcon, options: ["Zamiennik (Suma 5.000 zł)", "Oryginał (Suma 5.000 zł)"] },
    { id: "ochrona_znizek_oc", label: "Ochrona zniżki OC", icon: ShieldAlert, showIn: ['OC', 'OC+AC'] },
    { id: "ochrona_znizek_ac", label: "Ochrona zniżki AC", icon: ShieldAlert, showIn: ['AC', 'OC+AC'] },
    { id: "auto_zastepcze", label: "Auto Zastępcze", icon: Car }
  ],
  "Default": [
    { id: "nnw", label: "NNW", icon: UserPlus, options: ["5.000 zł", "10.000 zł", "15.000 zł"] },
    { id: "ass", label: "Assistance", icon: Zap },
    { id: "szyby", label: "Szyby", icon: WindshieldIcon, options: ["Zamiennik (Suma 5.000 zł)", "Oryginał (Suma 5.000 zł)"] },
    { id: "ochrona_znizek_oc", label: "Ochrona zniżki OC", icon: ShieldAlert, showIn: ['OC', 'OC+AC'] },
    { id: "ochrona_znizek_ac", label: "Ochrona zniżki AC", icon: ShieldAlert, showIn: ['AC', 'OC+AC'] }
  ]
};

const BAZA_UBEZPIECZYCIELI = [
  "Ergo Hestia", "Ergo Biznes", "PZU S.A.", "Warta", "Link4", "HDI", "Compensa", 
  "Wiener", "Interrisk", "Generali", "Allianz", "Uniqa", "MTU"
];

// --- FUNKCJE FORMATUJĄCE ---
const formatPlate = (val) => val.toUpperCase().replace(/[^A-Z0-9 ]/g, '');
const formatTitleCase = (text) => text ? text.toLowerCase().replace(/(?:^|\s|-)\p{L}/gu, (match) => match.toUpperCase()) : '';
const formatTitleCaseOferty = (str) => {
  if (!str) return "";
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};
const formatPostalCode = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 5);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
};
const formatToPLDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr;
};
const formatAsKsiega = (val) => {
  if (!val) return "";
  let clean = val.replace(/[^\d,]/g, '');
  let p = clean.split(',');
  if (p.length > 2) clean = p[0] + ',' + p.slice(1).join('');
  p = clean.split(',');
  if (p[1] && p[1].length > 2) p[1] = p[1].substring(0, 2);
  p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return p.join(',');
};
const calculateInstallment = (valStr, divider) => {
  if (!valStr) return "";
  const raw = parseFloat(valStr.replace(/\s/g, '').replace(',', '.'));
  if (isNaN(raw) || divider <= 0) return "";
  const part = (raw / divider).toFixed(2);
  return formatAsKsiega(part.replace('.', ','));
};

// --- NAZWA UŻYTKOWNIKA Z EMAILA ---
const getUserDisplayName = (email) => {
  if (!email) return "Niezalogowany";
  const namePart = email.split('@')[0];
  const parts = namePart.split('.');
  if (parts.length === 2) {
    const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
    return `${firstName} ${lastName}`;
  }
  return namePart;
};

// --- FUNKCJA WSPOMAGAJĄCA ŁADOWANIE SKRYPTU ---
const loadJsPdfScript = async () => {
    if (window.jspdf) return true;
    if (pdfAssetsCache.jsPdfLoaded) return true;
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        script.onload = () => {
            pdfAssetsCache.jsPdfLoaded = true;
            resolve(true);
        };
        document.head.appendChild(script);
    });
};

// --- EKRAN LOGOWANIA ---
const LoginScreen = ({ onLogin, error }) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onLogin(email, pass);
        setLoading(false);
    };

    return (
        <div className="h-screen flex items-center justify-center p-4 bg-gray-50" style={styles.body}>
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-100 space-y-8 animate-in zoom-in-95 duration-500">
                <div className="text-center space-y-3">
                    <div className="w-20 h-20 bg-[#0067b1] rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-xl">
                        <Shield size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter" style={styles.header}>Egida</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Panel Agenta</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-4">Adres E-mail</label>
                      <input type="email" placeholder="email@pallada.pl" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all placeholder:text-slate-300" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-4">Hasło dostępu</label>
                      <input type="password" placeholder="••••••••" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all placeholder:text-slate-300" value={pass} onChange={e => setPass(e.target.value)} required />
                    </div>
                    {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest bg-red-50 p-3 rounded-xl">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-black shadow-xl active:scale-[0.98] transition-all">
                        {loading ? "Łączenie..." : "Zaloguj do systemu"}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- KOMPONENT: DYNAMICZNE LOGO FIRMY Z FALLBACKIEM NA TEKST ---
const CompanyLogo = ({ firma }) => {
  const [imgError, setImgError] = useState(false);
  const src = LOGOS[firma];

  if (src && !imgError) {
    return (
      <img 
        src={src} 
        alt={firma} 
        className="max-h-8 max-w-[130px] object-contain object-center mix-blend-multiply transition-opacity duration-300" 
        onError={() => setImgError(true)} 
      />
    );
  }
  return <h3 className="text-sm font-black text-[#0067b1] uppercase tracking-[0.15em] text-center">{firma}</h3>;
};


// --- MODUŁ OFERTOWANIA (NATYWNY PDF) ---
const OfertyModule = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [pdfMode, setPdfMode] = useState(false);
  
  const [errors, setErrors] = useState({ skladka: false, suma: false, metodaNaprawy: false });
  const [validationError, setValidationError] = useState("");
  
  const [expandedDodatek, setExpandedDodatek] = useState(null);

  const [oferta, setOferta] = useState({
    numerOferty: `OFR/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
    dataKalkulacji: new Date().toLocaleDateString('pl-PL'),
    klient: { nazwa: "", czyLeasing: false, wlasciciel: "", typ: "Prywatny" },
    pojazd: { marka: "", model: "", rokProdukcji: "", nrRejestracyjny: "", vin: "" },
    warianty: []
  });

  const [nowyWariant, setNowyWariant] = useState({
    firma: BAZA_UBEZPIECZYCIELI[0],
    skladka: "",
    sumaUbezpieczenia: "", 
    typSumy: "Brutto", 
    tryb: "OC+AC",
    zakresAC: { stalaSuma: false, nieredukcyjna: false, metodaNaprawy: "" },
    dodatki: {},
    liczbaRat: 1
  });

  const aktualnaKonfigDodatkow = useMemo(() => {
    return DODATKI_KONFIG[nowyWariant.firma] || DODATKI_KONFIG["Default"];
  }, [nowyWariant.firma]);

  useEffect(() => {
    if (!user) return;
    try {
        const historyRef = collection(db, 'artifacts', appId, 'users', user.uid, 'oferty');
        const unsubscribe = onSnapshot(historyRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistory(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        }, (err) => console.warn("Błąd pobierania historii (tryb podglądu)", err));
        return () => unsubscribe();
    } catch (e) {
        console.warn("Błąd bazy danych", e)
    }
  }, [user]);

  // LOGIKA NATYWNEGO GENEROWANIA PDF W JSPDF + ZAAWANSOWANY CACHE
  const handleGeneratePdfNative = async () => {
    setPdfMode(true);
    try {
      await loadJsPdfScript();
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      
      const loadFontWithCache = async (url, filename, fontName, fontStyle) => {
          if (!pdfAssetsCache.fonts[filename]) {
              try {
                  const response = await fetch(url);
                  const buffer = await response.arrayBuffer();
                  let binary = '';
                  const bytes = new Uint8Array(buffer);
                  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
                  pdfAssetsCache.fonts[filename] = window.btoa(binary);
              } catch (e) { console.error("Błąd ładowania czcionki", e); }
          }
          if (pdfAssetsCache.fonts[filename]) {
              doc.addFileToVFS(filename, pdfAssetsCache.fonts[filename]);
              doc.addFont(filename, fontName, fontStyle);
          }
      };
      
      // Ładowanie czcionek używając Cache
      await loadFontWithCache('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf', 'Kiro-Regular.ttf', 'Kiro', 'normal');
      await loadFontWithCache('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf', 'Semplicita-Bold.ttf', 'Semplicita', 'bold');
      await loadFontWithCache('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf', 'Kiro-Bold.ttf', 'Kiro', 'bold');

      // Ładowanie logotypów Towarzystw przy użyciu Cache
      const uniqueFirms = [...new Set(oferta.warianty.map(w => w.firma))];
      const preloadedLogos = {};
      
      for (const firma of uniqueFirms) {
          if (LOGOS[firma] && !pdfAssetsCache.logos[firma]) {
              await new Promise((resolve) => {
                  const img = new Image();
                  img.crossOrigin = "Anonymous";
                  img.onload = () => {
                      pdfAssetsCache.logos[firma] = { img, ratio: img.width / img.height };
                      resolve();
                  };
                  img.onerror = resolve; // Ignoruj jeśli błąd
                  img.src = LOGOS[firma];
              });
          }
          if (pdfAssetsCache.logos[firma]) {
              preloadedLogos[firma] = pdfAssetsCache.logos[firma];
          }
      }

      // Ładowanie Loga Pallada
      if (!pdfAssetsCache.mainLogo) {
          await new Promise((resolve) => {
              const img = new Image();
              img.crossOrigin = "Anonymous";
              img.onload = () => {
                  pdfAssetsCache.mainLogo = { img, ratio: img.width / img.height };
                  resolve();
              };
              img.onerror = resolve;
              img.src = pallada_trans_logo;
          });
      }

      const palladaBlue = [0, 103, 177];
      const slate800 = [30, 41, 59];
      const slate500 = [100, 116, 139];
      const slate400 = [148, 163, 184];
      const slate200 = [226, 232, 240];
      const blue50 = [239, 246, 255];
      const getFont = (preferred) => doc.getFontList()[preferred] ? preferred : "helvetica";

      // 1. Logo i nagłówek
      if (pdfAssetsCache.mainLogo) {
          const ml = pdfAssetsCache.mainLogo;
          doc.addImage(ml.img, 'PNG', 15, 15, 28 * ml.ratio, 28, undefined, 'FAST');
      } else {
          doc.setFont(getFont("Semplicita"), "bold");
          doc.setFontSize(22);
          doc.setTextColor(...palladaBlue);
          doc.text("PALLADA", 15, 28);
      }

      doc.setFont(getFont("Kiro"), "bold");
      doc.setFontSize(11);
      doc.setTextColor(...slate800);
      doc.text("PROPOZYCJA UBEZPIECZENIA POJAZDU", 195, 20, { align: 'right' });
      
      doc.setFontSize(7);
      doc.setTextColor(...slate500);
      doc.setFont(getFont("Kiro"), "normal");
      doc.text(`Nr kalkulacji:`, 155, 26, { align: 'right' });
      doc.setFont(getFont("Kiro"), "bold");
      doc.setTextColor(...slate800);
      doc.text(oferta.numerOferty, 195, 26, { align: 'right' });

      doc.setFont(getFont("Kiro"), "normal");
      doc.setTextColor(...slate500);
      doc.text(`Data kalkulacji:`, 155, 30, { align: 'right' });
      doc.setFont(getFont("Kiro"), "bold");
      doc.setTextColor(...slate800);
      doc.text(oferta.dataKalkulacji, 195, 30, { align: 'right' });

      // Gruba niebieska linia
      doc.setDrawColor(...palladaBlue);
      doc.setLineWidth(0.6);
      doc.line(15, 45, 195, 45);

      // 2. Metadane
      let currentY = 52;
      const drawMetaRow = (label, value, label2, value2, y) => {
          doc.setDrawColor(...slate200);
          doc.setLineWidth(0.2);
          doc.line(15, y + 2, 195, y + 2);
          
          doc.setFontSize(8);
          doc.setFont(getFont("Kiro"), "bold");
          doc.setTextColor(...slate400);
          doc.text(label, 15, y);
          doc.setFont(getFont("Kiro"), "bold");
          doc.setTextColor(...slate800);
          doc.text((value || '-').toUpperCase(), 45, y);
          
          if (label2) {
              doc.setFont(getFont("Kiro"), "bold");
              doc.setTextColor(...slate400);
              doc.text(label2, 105, y);
              doc.setFont(getFont("Kiro"), "bold");
              doc.setTextColor(...slate800);
              doc.text((value2 || '-').toUpperCase(), 130, y);
          }
      };

      drawMetaRow("Marka/model:", `${oferta.pojazd.marka} ${oferta.pojazd.model}`, "Ubezpieczony:", oferta.klient.nazwa, currentY);
      currentY += 6;
      drawMetaRow("Nr rejestracyjny:", oferta.pojazd.nrRejestracyjny, oferta.klient.czyLeasing ? "Właściciel:" : "", oferta.klient.czyLeasing ? oferta.klient.wlasciciel : "", currentY);
      currentY += 6;
      drawMetaRow("VIN:", oferta.pojazd.vin, "Rok produkcji:", oferta.pojazd.rokProdukcji, currentY);
      currentY += 14;

      // 3. Warianty - Rysowanie tabeli
      if (oferta.warianty.length > 0) {
          let tableStartY = currentY;
          let pageSeparators = [];
          let isContinued = false;
          
          const drawFrameAndHeader = (hStartY, endY, continued) => {
              doc.setDrawColor(204, 224, 239);
              
              doc.setLineWidth(0.25);
              pageSeparators.forEach(y => {
                  doc.line(15.2, y, 194.8, y);
              });
              
              doc.setLineWidth(0.25);
              doc.line(60, hStartY + 7, 60, endY - 0.2);
              doc.line(105, hStartY + 7, 105, endY - 0.2);
              doc.line(155, hStartY + 7, 155, endY - 0.2);
              
              doc.setLineWidth(0.4);
              doc.roundedRect(15, hStartY, 180, endY - hStartY, 2, 2, 'S');

              doc.setFillColor(...palladaBlue);
              doc.roundedRect(14.8, hStartY - 0.2, 180.4, 7.4, 2.2, 2.2, 'F');
              doc.rect(14.8, hStartY + 3, 180.4, 4.4, 'F'); 
              
              doc.setTextColor(255, 255, 255);
              doc.setFontSize(8);
              doc.setFont(getFont("Kiro"), "bold");
              const title = continued ? "SZCZEGÓŁOWE ZESTAWIENIE OFERT (C.D.)" : "SZCZEGÓŁOWE ZESTAWIENIE OFERT";
              doc.text(title, 20, hStartY + 5);
          };

          currentY += 7; 

          for (let i = 0; i < oferta.warianty.length; i++) {
              const w = oferta.warianty[i];
              let startY = currentY;
              
              // --- KROK 1: SYMULACJA WYSOKOŚCI --- 
              let simMaxY = startY + 36; 
              
              let c2Y_sim = startY + 7;
              const addC2 = () => { c2Y_sim += 5.5; };
              if (w.tryb !== 'AC') addC2();
              if (w.tryb !== 'OC') addC2();
              if (w.dodatki['nnw']) addC2();
              if (w.dodatki['ass'] || w.dodatki['car_ass']) addC2();
              if (w.dodatki['szyby']) addC2();
              if (c2Y_sim > simMaxY) simMaxY = c2Y_sim;

              let c3Y_sim = startY + 7;
              const addC3 = (text) => {
                  const lines = doc.splitTextToSize(text, 43);
                  c3Y_sim += (lines.length * 4);
              };
              if (w.tryb !== 'OC' && w.zakresAC?.stalaSuma) addC3("Auto wartość 100% (stała suma)");
              if (w.tryb !== 'OC' && w.zakresAC?.nieredukcyjna) addC3("Brak redukcji sumy ubezpieczenia");
              if (w.tryb !== 'OC' && w.zakresAC?.metodaNaprawy) addC3(`Naprawa: ${w.zakresAC.metodaNaprawy}`);
              if (w.dodatki['car_ass'] && typeof w.dodatki['car_ass'] === 'string') addC3(`Assistance: ${w.dodatki['car_ass']}`);
              if (w.dodatki['szyby'] && typeof w.dodatki['szyby'] === 'string') addC3(`Szyby: ${w.dodatki['szyby']}`);
              
              Object.entries(w.dodatki).forEach(([id, val]) => {
                  if (!val || ['nnw', 'ass', 'car_ass', 'szyby'].includes(id)) return;
                  const dKonfig = (DODATKI_KONFIG[w.firma] || DODATKI_KONFIG["Default"]).find(d => d.id === id);
                  const label = dKonfig ? dKonfig.label : id;
                  if (Array.isArray(val)) {
                      val.forEach(v => addC3(v));
                  } else {
                      addC3((typeof val === 'string' && val !== 'true') ? `${label}: ${val}` : label);
                  }
              });
              if (c3Y_sim > simMaxY) simMaxY = c3Y_sim;
              
              simMaxY += 4; 
              let maxY = simMaxY;

              // --- KROK 2: WYZNACZANIE NOWEJ STRONY ---
              if (maxY > 260 && i > 0) {
                  drawFrameAndHeader(tableStartY, startY, isContinued); 
                  
                  doc.addPage();
                  currentY = 20;
                  tableStartY = currentY;
                  pageSeparators = [];
                  isContinued = true;
                  
                  currentY += 7;
                  const diff = maxY - startY;
                  startY = currentY;
                  maxY = startY + diff;
              }

              const isLastRow = i === oferta.warianty.length - 1;

              // --- KROK 3: TŁA KOMÓREK ---
              doc.setFillColor(248, 250, 252);
              if (isLastRow) {
                  doc.roundedRect(15, startY, 45, maxY - startY, 2, 2, 'F');
                  doc.rect(18, startY, 42, maxY - startY, 'F'); 
                  doc.rect(15, startY, 45, maxY - startY - 3, 'F'); 
              } else {
                  doc.rect(15, startY, 45, maxY - startY, 'F');
              }

              doc.setFillColor(...blue50);
              if (isLastRow) {
                  doc.roundedRect(155, startY, 40, maxY - startY, 2, 2, 'F');
                  doc.rect(155, startY, 37, maxY - startY, 'F'); 
                  doc.rect(155, startY, 40, maxY - startY - 3, 'F'); 
              } else {
                  doc.rect(155, startY, 40, maxY - startY, 'F');
              }

              // --- KROK 4: RYSOWANIE TREŚCI ---
              
              // ==========================================
              // Kolumna 1: Towarzystwo (Wyśrodkowana w pionie i poziomie)
              // ==========================================
              const colCenterX = 37.5; 
              
              // 1. ZNACZNIK TRYBU (OC/AC)
              doc.setFillColor(...palladaBlue);
              const tagW = 16;
              doc.roundedRect(colCenterX - (tagW / 2), startY + 4, tagW, 4.5, 1, 1, 'F'); 
              doc.setTextColor(255, 255, 255);
              doc.setFontSize(6);
              doc.text(w.tryb, colCenterX, startY + 7.2, { align: 'center' });
              
              // 2. LOGO POD ZNACZNIKIEM
              const logoData = preloadedLogos[w.firma];
              if (logoData) {
                  const powieksozneLoga = ["PZU S.A.", "Interrisk", "Compensa", "Warta"];
                  const isBigger = powieksozneLoga.includes(w.firma);
                  
                  let maxW = isBigger ? 28 : 24;
                  let maxH = isBigger ? 13 : 11;
                  
                  let logoW = maxW;
                  let logoH = logoW / logoData.ratio;
                  
                  if (logoH > maxH) {
                      logoH = maxH;
                      logoW = logoH * logoData.ratio;
                  }
                  
                  let logoX = colCenterX - (logoW / 2);
                  let spaceY = 15.5; 
                  let logoY = startY + 8.5 + (spaceY - logoH) / 2;
                  
                  doc.addImage(logoData.img, 'PNG', logoX, logoY, logoW, logoH, undefined, 'FAST');
              } else {
                  doc.setTextColor(...palladaBlue);
                  doc.setFontSize(10);
                  doc.setFont(getFont("Kiro"), "bold");
                  const fNameLines = doc.splitTextToSize(w.firma.toUpperCase(), 35);
                  doc.text(fNameLines, colCenterX, startY + 16, { align: 'center' });
              }
              
              // 3. SUMA UBEZPIECZENIA POD LOGIEM
              if (w.tryb !== 'OC') {
                  doc.setTextColor(...slate400);
                  doc.setFontSize(6);
                  doc.setFont(getFont("Kiro"), "bold");
                  doc.text("SUMA UBEZPIECZENIA", colCenterX, startY + 27, { align: 'center' });
                  
                  doc.setTextColor(...slate800);
                  doc.setFontSize(10);
                  doc.setFont(getFont("Kiro"), "bold");
                  
                  const valText = `${w.sumaUbezpieczenia} PLN `;
                  const typText = w.typSumy;
                  
                  const valW = doc.getTextWidth(valText);
                  doc.setFontSize(6);
                  doc.setFont(getFont("Kiro"), "normal");
                  const typW = doc.getTextWidth(typText);
                  
                  const totalW = valW + typW;
                  const startValX = colCenterX - (totalW / 2);
                  
                  doc.setFontSize(10);
                  doc.setFont(getFont("Kiro"), "bold");
                  doc.text(valText, startValX, startY + 31.5);
                  
                  doc.setFontSize(6);
                  doc.setFont(getFont("Kiro"), "normal");
                  doc.setTextColor(...slate500);
                  doc.text(typText, startValX + valW, startY + 31.5);
              }

              // ==========================================
              // Kolumna 2: Zakres podstawowy
              // ==========================================
              let c2Y = startY + 7;
              const drawCheckReal = (text) => {
                  doc.setLineWidth(0.4);
                  doc.setDrawColor(...palladaBlue);
                  doc.circle(63.5, c2Y - 0.7, 2.2, 'S'); 
                  
                  doc.setLineWidth(0.5); 
                  doc.line(62.2, c2Y - 0.7, 63.2, c2Y + 0.3);
                  doc.line(63.2, c2Y + 0.3, 64.8, c2Y - 1.5);

                  doc.setTextColor(...slate800);
                  doc.setFontSize(7.5);
                  doc.setFont(getFont("Kiro"), "bold");
                  doc.text(text, 67.5, c2Y);
                  c2Y += 5.5;
              };

              if (w.tryb !== 'AC') drawCheckReal("Ubezpieczenie OC");
              if (w.tryb !== 'OC') drawCheckReal("Autocasco (AC)");
              if (w.dodatki['nnw']) {
                  drawCheckReal(typeof w.dodatki['nnw'] === 'string' && w.dodatki['nnw'] !== 'true' ? `NNW (${w.dodatki['nnw']})` : "Następstwa (NNW)");
              }
              if (w.dodatki['ass'] || w.dodatki['car_ass']) drawCheckReal("Assistance");
              if (w.dodatki['szyby']) drawCheckReal("Ubezpieczenie Szyb");

              // ==========================================
              // Kolumna 3: Rozszerzenia
              // ==========================================
              let c3Y = startY + 7;
              const drawBulletReal = (text) => {
                  doc.setTextColor(...palladaBlue);
                  doc.setFontSize(10);
                  doc.text("•", 107, c3Y);
                  
                  doc.setTextColor(71, 85, 105);
                  doc.setFontSize(7);
                  doc.setFont(getFont("Kiro"), "normal");
                  const lines = doc.splitTextToSize(text, 43);
                  doc.text(lines, 110, c3Y);
                  c3Y += (lines.length * 4);
              };

              if (w.tryb !== 'OC' && w.zakresAC?.stalaSuma) drawBulletReal("Auto wartość 100% (stała suma)");
              if (w.tryb !== 'OC' && w.zakresAC?.nieredukcyjna) drawBulletReal("Brak redukcji sumy ubezpieczenia");
              if (w.tryb !== 'OC' && w.zakresAC?.metodaNaprawy) drawBulletReal(`Naprawa: ${w.zakresAC.metodaNaprawy}`);
              if (w.dodatki['car_ass'] && typeof w.dodatki['car_ass'] === 'string') drawBulletReal(`Assistance: ${w.dodatki['car_ass']}`);
              if (w.dodatki['szyby'] && typeof w.dodatki['szyby'] === 'string') drawBulletReal(`Szyby: ${w.dodatki['szyby']}`);

              Object.entries(w.dodatki).forEach(([id, val]) => {
                  if (!val || ['nnw', 'ass', 'car_ass', 'szyby'].includes(id)) return;
                  const dKonfig = (DODATKI_KONFIG[w.firma] || DODATKI_KONFIG["Default"]).find(d => d.id === id);
                  const label = dKonfig ? dKonfig.label : id;
                  if (Array.isArray(val)) {
                      val.forEach(v => drawBulletReal(v));
                  } else {
                      drawBulletReal((typeof val === 'string' && val !== 'true') ? `${label}: ${val}` : label);
                  }
              });

              // ==========================================
              // Kolumna 4: Składka łączna
              // ==========================================
              const midY = startY + ((maxY - startY) / 2);
              doc.setTextColor(...slate400);
              doc.setFontSize(6.5);
              doc.setFont(getFont("Kiro"), "bold");
              doc.text("SKŁADKA ŁĄCZNA", 175, midY - 6.5, { align: 'center' });
              
              const priceParts = w.skladka.split(',');
              const priceStr1 = priceParts[0];
              const priceStr2 = `,${priceParts[1] || '00'} PLN`;
              
              doc.setFontSize(18);
              doc.setFont(getFont("Kiro"), "bold");
              const p1Width = doc.getTextWidth(priceStr1);
              doc.setFontSize(10);
              const p2Width = doc.getTextWidth(priceStr2);
              
              const totalPWidth = p1Width + p2Width;
              const startX = 175 - (totalPWidth / 2);
              
              doc.setTextColor(...palladaBlue);
              doc.setFontSize(18);
              doc.text(priceStr1, startX, midY + 1);
              doc.setFontSize(10);
              doc.text(priceStr2, startX + p1Width, midY + 1);

              const ratyText = w.liczbaRat === 1 ? 'PŁATNOŚĆ JEDNORAZOWA' : `W ${w.liczbaRat} RATACH PO OK. ${calculateInstallment(w.skladka, w.liczbaRat)} PLN`;
              doc.setFontSize(5.5);
              const ratyWidth = doc.getTextWidth(ratyText) + 4;
              doc.setFillColor(255, 255, 255);
              doc.setDrawColor(204, 224, 239);
              doc.setLineWidth(0.2);
              doc.roundedRect(175 - ratyWidth/2, midY + 4, ratyWidth, 4.5, 1, 1, 'FD'); 
              doc.text(ratyText, 175, midY + 7.2, { align: 'center' });

              if (!isLastRow) {
                  pageSeparators.push(maxY);
              }

              currentY = maxY;
          }
          
          drawFrameAndHeader(tableStartY, currentY, isContinued);
      }

      // 4. Stopka
      if (currentY > 250) {
          doc.addPage();
          currentY = 20;
      }
      
      currentY += 10;
      doc.setDrawColor(...slate200);
      doc.setLineWidth(0.2);
      doc.line(15, currentY, 195, currentY);
      
      currentY += 6;
      doc.setTextColor(...slate800);
      doc.setFontSize(6);
      doc.setFont(getFont("Kiro"), "bold");
      doc.text("INFORMACJA PRAWNA", 15, currentY);
      doc.setTextColor(...slate500);
      doc.setFont(getFont("Kiro"), "normal");
      doc.text("Niniejsza propozycja ma charakter informacyjny i może ulec zmianie w przypadku zmiany parametrów pojazdu lub ostatecznej weryfikacji", 15, currentY + 4);
      doc.text("historii ubezpieczenia w systemie UFG. Niniejszy dokument nie stanowi oferty handlowej w rozumieniu art. 66§1 Kodeksu Cywilnego.", 15, currentY + 7);

      doc.setTextColor(...slate400);
      doc.setFontSize(5);
      doc.setFont(getFont("Kiro"), "bold");
      doc.text("TWÓJ DORADCA", 195, currentY, { align: 'right' });
      doc.setTextColor(...palladaBlue);
      doc.
