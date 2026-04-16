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
  Edit2,
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
    { id: "nnw", label: "NNW", icon: UserPlus },
    { id: "warta_pomoc", label: "Warta Pomoc", icon: Zap },
    { id: "szyby", label: "Szyby", icon: WindshieldIcon, options: ["Zamiennik (Suma 5.000 zł)", "Oryginał (Suma 5.000 zł)"] },
    { id: "ochrona_znizek_oc", label: "Ochrona zniżek OC", icon: ShieldAlert, showIn: ['OC', 'OC+AC'] },
    { id: "ochrona_znizek_ac", label: "Ochrona zniżki AC", icon: ShieldAlert, showIn: ['AC', 'OC+AC'] },
    { id: "podwyzszone_ryzyko", label: "Kierujący o podwyższonym ryzyku", icon: AlertCircle, showIn: ['OC', 'OC+AC', 'AC'] }
  ],
  "HDI": [
    { id: "nnw", label: "NNW", icon: UserPlus },
    { id: "ass", label: "Assistance", icon: Zap },
    { id: "szyby", label: "Szyby", icon: WindshieldIcon, options: ["Zamiennik (Suma 5.000 zł)", "Oryginał (Suma 5.000 zł)"] },
    { id: "ochrona_znizek_oc", label: "Ochrona zniżek OC", icon: ShieldAlert, showIn: ['OC', 'OC+AC'] },
    { id: "ochrona_znizek_ac", label: "Ochrona zniżki AC", icon: ShieldAlert, showIn: ['AC', 'OC+AC'] },
    { id: "podwyzszone_ryzyko", label: "Kierujący o podwyższonym ryzyku", icon: AlertCircle, showIn: ['OC', 'OC+AC', 'AC'] }
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
  
  const konfiguratorRef = useRef(null);

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
      doc.setFontSize(10);
      
      // WYKORZYSTANIE NAZWY UŻYTKOWNIKA Z EMAILA
      const displayName = user ? getUserDisplayName(user.email).toUpperCase() : "DORADCA PALLADA";
      doc.text(displayName, 195, currentY + 4, { align: 'right' });
      
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(6);
      doc.text("PALLADA UBEZPIECZENIA", 195, currentY + 7, { align: 'right' });

      // DODANA: NUMERACJA STRON NA KAŻDEJ STRONIE
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFontSize(7);
          doc.setTextColor(...slate400); 
          doc.setFont(getFont("Kiro"), "normal");
          doc.text(`Strona ${i} z ${totalPages}`, 105, 290, { align: 'center' });
      }

      // Zapis PDF
      doc.save(`Oferta_${oferta.numerOferty.replace(/\//g, '_')}.pdf`);
      setPdfMode(false);
      setValidationError("");

    } catch (err) {
      console.error("PDF Native Error:", err);
      setValidationError("Błąd podczas generowania natywnego pliku PDF.");
      setPdfMode(false);
    }
  };

  const handleInputChange = (section, field, value, formatFn) => {
    let finalValue = value;
    if (formatFn) finalValue = formatFn(value);
    setOferta(prev => ({ ...prev, [section]: { ...prev[section], [field]: finalValue } }));
  };

  const handleKwotaChange = (field, value) => {
    setNowyWariant(prev => ({ ...prev, [field]: formatAsKsiega(value) }));
  };

  const handleKwotaBlur = (field) => {
    setNowyWariant(prev => {
      let val = prev[field];
      if (!val) return prev;
      if (!val.includes(',')) {
        return { ...prev, [field]: val + ',00' };
      } else {
        const parts = val.split(',');
        if (parts[1].length === 0) return { ...prev, [field]: val + '00' };
        if (parts[1].length === 1) return { ...prev, [field]: val + '0' };
      }
      return prev;
    });
  };

  const dodajWariant = () => {
    const rawSkladka = (nowyWariant.skladka || "").replace(/\s/g, '').replace(',', '.');
    const rawSuma = (nowyWariant.sumaUbezpieczenia || "").replace(/\s/g, '').replace(',', '.');

    let hasError = false;
    let newErrors = { skladka: false, suma: false, metodaNaprawy: false };
    let missingFields = [];

    if (nowyWariant.tryb !== 'OC') {
      if (!rawSuma || parseFloat(rawSuma) <= 0) {
        newErrors.suma = true;
        missingFields.push("Suma Ubezpieczenia");
        hasError = true;
      }
      if (!nowyWariant.zakresAC || !nowyWariant.zakresAC.metodaNaprawy) {
        newErrors.metodaNaprawy = true;
        missingFields.push("Metoda Naprawy AC");
        hasError = true;
      }
    }

    if (!rawSkladka || parseFloat(rawSkladka) <= 0) {
      newErrors.skladka = true;
      missingFields.push("Łączna składka");
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      setValidationError(`Uzupełnij brakujące dane: ${missingFields.join(", ")}`);
      setTimeout(() => {
        setErrors({ skladka: false, suma: false, metodaNaprawy: false });
        setValidationError("");
      }, 4000);
      return;
    }

    const typLabel = nowyWariant.firma === "Ergo Biznes" ? "Firma" : "Prywatny";
    const wariantZTypem = { ...nowyWariant, typKlienta: typLabel, id: Date.now() };
    
    setOferta(prev => ({ ...prev, warianty: [...prev.warianty, wariantZTypem] }));
    setNowyWariant(prev => ({ ...prev, skladka: "", zakresAC: { ...prev.zakresAC, metodaNaprawy: "" } }));
    setExpandedDodatek(null);
  };

  const edytujWariant = (wariantDoEdycji) => {
    setNowyWariant(wariantDoEdycji);
    setOferta(p => ({...p, warianty: p.warianty.filter(x => x.id !== wariantDoEdycji.id)}));
    setExpandedDodatek(null);
    if (konfiguratorRef.current) {
      konfiguratorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const zapiszWBazie = async () => {
    if (!user || oferta.warianty.length === 0) return;
    setSaving(true);
    try {
      const historyRef = collection(db, 'artifacts', appId, 'users', user.uid, 'oferty');
      await addDoc(historyRef, { ...oferta, createdAt: serverTimestamp(), userId: user.uid });
    } catch (err) { console.error("Błąd zapisu", err); }
    finally { setSaving(false); }
  };

  const handleDodatekToggle = (dodatek) => {
    const isCurrentlyActive = !!nowyWariant.dodatki[dodatek.id];
    
    if (isCurrentlyActive) {
      setNowyWariant(prev => {
        const newDodatki = { ...prev.dodatki };
        delete newDodatki[dodatek.id];
        return { ...prev, dodatki: newDodatki };
      });
      setExpandedDodatek(null);
    } else {
      const isMulti = dodatek.getMultiOptions || (dodatek.multiOptions && dodatek.multiOptions.length > 0);
      const isStandardOptions = dodatek.options && dodatek.options.length > 0;

      if (isStandardOptions || isMulti) {
        setExpandedDodatek(prev => prev === dodatek.id ? null : dodatek.id);
        if (isMulti && !nowyWariant.dodatki[dodatek.id]) {
          setNowyWariant(prev => ({
            ...prev,
            dodatki: { ...prev.dodatki, [dodatek.id]: [] }
          }));
        }
      } else {
        setNowyWariant(prev => ({
          ...prev,
          dodatki: { ...prev.dodatki, [dodatek.id]: true }
        }));
      }
    }
  };

  const handleSubOptionSelect = (id, option, e, isMulti = false) => {
    e.stopPropagation();
    setNowyWariant(prev => {
      if (isMulti) {
        let currentArray = prev.dodatki[id] || [];
        if (!Array.isArray(currentArray)) currentArray = [];
        if (currentArray.includes(option)) {
          currentArray = currentArray.filter(o => o !== option);
        } else {
          currentArray = [...currentArray, option];
        }
        return { ...prev, dodatki: { ...prev.dodatki, [id]: currentArray } };
      } else {
        return { ...prev, dodatki: { ...prev.dodatki, [id]: option } };
      }
    });
    if (!isMulti) setExpandedDodatek(null);
  };

  return (
    <>
      <div className="min-h-screen bg-[#f0f4f8] text-[#1e293b] pb-40 w-full" style={{ fontFamily: 'Kiro, sans-serif' }}>
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#0067b1] rounded-xl flex items-center justify-center text-white shadow-lg">
                <Zap size={20} fill="currentColor" />
              </div>
              <span className="text-lg font-black text-[#0067b1] hidden sm:block tracking-tighter uppercase" style={{ fontFamily: 'Semplicita Pro' }}>EIGDA</span>
            </div>

            <div className="flex-1 max-w-xl relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0067b1] transition-colors" size={16} />
              <input 
                type="text"
                placeholder="Wyszukaj ofertę..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-[#0067b1]/5 focus:border-[#0067b1] outline-none transition-all placeholder:text-slate-400 font-bold text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] font-black text-[#0067b1] uppercase tracking-widest tracking-tight">{user ? getUserDisplayName(user.email) : "Jakub Cendrowski"}</p>
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Menedżer Sprzedaży</p>
                </div>
                <div className="w-10 h-10 bg-[#0067b1] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-inner uppercase border-4 border-white">
                  {user && user.email ? (user.email.charAt(0) + (user.email.split('.')[1] ? user.email.split('.')[1].charAt(0) : '')).toUpperCase() : 'JC'}
                </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md border-t border-slate-100 px-6 py-2.5 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto no-scrollbar text-[10px] font-black uppercase tracking-widest text-slate-500">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-50 animate-pulse"></span>
                  ID: <span className="text-slate-900">{oferta.numerOferty}</span>
                </div>
                {oferta.klient.nazwa && (
                  <div className="flex items-center gap-2 shrink-0 border-l border-slate-200 pl-4 uppercase">
                    KLIENT: <span className="text-[#0067b1] font-black tracking-tight">{oferta.klient.nazwa}</span>
                  </div>
                )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col gap-10">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              <div className="lg:col-span-4 space-y-6">
                <section className="bg-white rounded-[2rem] p-8 shadow-md border border-slate-100 relative overflow-hidden group">
                  <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0067b1] mb-8 flex items-center gap-3">
                    <LayoutDashboard size={18} /> Podmiot ubezpieczony
                  </h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Ubezpieczony (Imię i Nazwisko / Firma)</label>
                      <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0067b1] transition-all text-sm font-black text-slate-800 shadow-sm" value={oferta.klient.nazwa} onChange={(e) => handleInputChange('klient', 'nazwa', e.target.value, formatTitleCaseOferty)} />
                    </div>

                    <div className="flex items-center gap-4 bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-sm">
                        <input type="checkbox" checked={oferta.klient.czyLeasing} onChange={(e) => handleInputChange('klient', 'czyLeasing', e.target.checked)} className="w-6 h-6 rounded-lg text-[#0067b1] border-slate-300 focus:ring-[#0067b1]" />
                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Leasing / Wynajem</span>
                    </div>
                    {oferta.klient.czyLeasing && (
                      <input className="w-full px-5 py-4 bg-amber-50/50 border-2 border-amber-100 rounded-2xl outline-none text-sm font-black text-slate-800 placeholder:text-amber-400/50 shadow-sm" value={oferta.klient.wlasciciel} onChange={(e) => handleInputChange('klient', 'wlasciciel', e.target.value)} placeholder="Wpisz leasingodawcę..." />
                    )}
                  </div>
                </section>

                <section className="bg-white rounded-[2rem] p-8 shadow-md border border-slate-100 relative overflow-hidden group">
                  <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0067b1] mb-8 flex items-center gap-3">
                    <Car size={18} /> Specyfikacja pojazdu
                  </h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Marka</label>
                        <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0067b1] transition-all text-sm font-black uppercase tracking-tight" value={oferta.pojazd.marka} onChange={(e) => handleInputChange('pojazd', 'marka', e.target.value, formatTitleCaseOferty)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Model</label>
                        <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0067b1] transition-all text-sm font-black uppercase tracking-tight" value={oferta.pojazd.model} onChange={(e) => handleInputChange('pojazd', 'model', e.target.value, formatTitleCaseOferty)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Rok produkcji</label>
                        <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0067b1] transition-all text-sm font-black uppercase tracking-tight" value={oferta.pojazd.rokProdukcji || ""} onChange={(e) => handleInputChange('pojazd', 'rokProdukcji', e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nr Rejestracyjny</label>
                        <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0067b1] transition-all text-sm font-black uppercase tracking-[0.3em] text-[#0067b1]" value={oferta.pojazd.nrRejestracyjny} onChange={(e) => handleInputChange('pojazd', 'nrRejestracyjny', e.target.value.toUpperCase())} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Fingerprint size={12} className="text-[#0067b1]"/> Numer VIN</label>
                      <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0067b1] transition-all text-sm font-black uppercase tracking-[0.2em] text-slate-600" value={oferta.pojazd.vin} onChange={(e) => handleInputChange('pojazd', 'vin', e.target.value.toUpperCase())} />
                    </div>
                  </div>
                </section>
              </div>

              <div className="lg:col-span-8 space-y-10">
                <section className="bg-white rounded-[2.5rem] p-10 shadow-xl border-t-8 border-[#0067b1] relative overflow-hidden shadow-slate-200/60">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
                    
                    <div className="md:col-span-5 space-y-8" ref={konfiguratorRef}>
                      <div className="flex bg-blue-100/30 p-1.5 rounded-2xl border border-blue-200/50 shadow-inner">
                        {['OC', 'OC+AC', 'AC'].map(id => (
                          <button 
                            key={id} 
                            onClick={() => {
                              setNowyWariant({...nowyWariant, tryb: id});
                              setNowyWariant(prev => {
                                const dod = {...prev.dodatki};
                                delete dod['klauzule_katalog'];
                                delete dod['klauzule_katalog_biznes'];
                                return {...prev, dodatki: dod};
                              });
                            }} 
                            className={`flex-1 py-3.5 rounded-xl text-[11px] font-black transition-all uppercase tracking-[0.2em] ${nowyWariant.tryb === id ? 'bg-gradient-to-br from-[#0067b1] to-blue-700 text-white shadow-lg' : 'text-slate-500 hover:text-[#0067b1] hover:bg-white'}`}
                          > 
                            {id} 
                          </button>
                        ))}
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em] ml-1 flex items-center gap-2"><Building2 size={16} className="text-[#0067b1]"/> Towarzystwo</label>
                          <select className="w-full px-5 py-5 bg-white shadow-sm border-2 border-slate-200 rounded-2xl outline-none font-black text-[#0067b1] text-lg appearance-none cursor-pointer hover:border-[#0067b1]/50 transition-colors focus:border-[#0067b1]" value={nowyWariant.firma} onChange={(e) => { setNowyWariant({...nowyWariant, firma: e.target.value, dodatki: {}}); setExpandedDodatek(null); }}>
                            {BAZA_UBEZPIECZYCIELI.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>

                        {nowyWariant.tryb !== 'OC' && (
                          <div className="space-y-3 relative">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em] ml-1 flex items-center gap-2"><ShieldCheck size={16} className="text-[#0067b1]"/> Suma Ubezpieczenia</label>
                            <div className="relative">
                              <input type="text" className={`w-full pl-6 pr-16 py-5 bg-white shadow-sm border-2 rounded-2xl outline-none font-black text-slate-800 text-xl transition-all ${errors.suma ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 focus:border-[#0067b1]'}`} value={nowyWariant.sumaUbezpieczenia} onChange={(e) => handleKwotaChange('sumaUbezpieczenia', e.target.value)} onBlur={() => handleKwotaBlur('sumaUbezpieczenia')} placeholder="Suma" />
                              <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm tracking-widest">PLN</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2 relative">
                          <label className="text-[10px] font-black text-[#0067b1] uppercase tracking-[0.15em] ml-1 flex items-center gap-2"><Activity size={16} /> Łączna składka</label>
                          <div className="relative">
                            <input type="text" className={`w-full pl-6 pr-16 py-5 bg-blue-50/40 border-2 rounded-2xl outline-none font-black text-[#0067b1] text-xl transition-all shadow-inner ${errors.skladka ? 'border-red-500 ring-2 ring-red-100' : 'border-[#0067b1]/40 focus:border-[#0067b1]'}`} value={nowyWariant.skladka} onChange={(e) => handleKwotaChange('skladka', e.target.value)} onBlur={() => handleKwotaBlur('skladka')} placeholder="0,00" />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-[#0067b1]/40 text-sm tracking-widest">PLN</span>
                          </div>
                          <div className="flex bg-blue-100/30 p-1.5 rounded-2xl border border-blue-200/50 mt-3">
                            {[1, 2, 4, 12].map(raty => (
                              <button key={raty} onClick={() => setNowyWariant({...nowyWariant, liczbaRat: raty})} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black transition-all uppercase tracking-wider ${nowyWariant.liczbaRat === raty ? 'bg-[#0067b1] text-white' : 'text-slate-500'}`}> {raty === 1 ? '1 Rata' : `${raty} Raty`} </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:block mt-8">
                         {validationError && (
                           <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center gap-3 font-bold text-[11px] uppercase tracking-wider mb-4 animate-in fade-in zoom-in shadow-sm">
                             <XCircle size={18} /> {validationError}
                           </div>
                         )}
                         <button onClick={dodajWariant} className={`w-full bg-gradient-to-r from-[#0067b1] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.25em] shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-4`}>
                           <Plus size={26} /> Dodaj wariant
                         </button>
                      </div>
                    </div>

                    <div className="md:col-span-7 space-y-8">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                        <p className="text-[12px] font-black text-[#0067b1] uppercase tracking-[0.2em] flex items-center gap-3"><PackagePlus size={20} /> Konfiguracja Rozszerzeń</p>
                        <Layers size={20} className="text-[#0067b1]/30" />
                      </div>

                      <div className="space-y-10 bg-blue-50/40 p-8 rounded-[3.5rem] border border-blue-100 shadow-inner">
                        {(nowyWariant.tryb === 'OC+AC' || nowyWariant.tryb === 'AC') && (
                          <div className="space-y-4">
                            <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.25em] ml-2 flex items-center gap-2"><ShieldCheck size={14}/> Zakres Autocasco</p>
                            
                            <div className={`grid grid-cols-2 lg:grid-cols-4 bg-white/50 p-1.5 rounded-[2rem] border-2 shadow-sm gap-1 transition-colors ${errors.metodaNaprawy ? 'border-red-400 bg-red-50/50' : 'border-blue-100'}`}>
                              {['Kosztorys', 'Minicasco', 'Partnerski', 'ASO'].map(metoda => (
                                <button key={metoda} onClick={() => setNowyWariant({...nowyWariant, zakresAC: {...nowyWariant.zakresAC, metodaNaprawy: metoda}})} className={`py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-tighter ${nowyWariant.zakresAC.metodaNaprawy === metoda ? 'bg-[#0067b1] text-white shadow-md' : 'text-slate-500 hover:text-[#0067b1] hover:bg-white'}`}> {metoda} </button>
                              ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <button onClick={() => setNowyWariant({...nowyWariant, zakresAC: {...nowyWariant.zakresAC, stalaSuma: !nowyWariant.zakresAC.stalaSuma}})} className={`flex flex-row items-center justify-center px-5 py-4 rounded-[1.5rem] border-2 transition-all gap-3 min-h-[4rem] group ${nowyWariant.zakresAC.stalaSuma ? 'bg-gradient-to-br from-[#0067b1] to-blue-800 text-white border-[#0067b1] shadow-md' : 'bg-white border-blue-100 text-[#0067b1] hover:border-blue-200'}`}>
                                <Activity size={20} className="shrink-0" /> <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">Stała wartość pojazdu</span>
                              </button>
                              <button onClick={() => setNowyWariant({...nowyWariant, zakresAC: {...nowyWariant.zakresAC, nieredukcyjna: !nowyWariant.zakresAC.nieredukcyjna}})} className={`flex flex-row items-center justify-center px-5 py-4 rounded-[1.5rem] border-2 transition-all gap-3 min-h-[4rem] group ${nowyWariant.zakresAC.nieredukcyjna ? 'bg-gradient-to-br from-[#0067b1] to-blue-800 text-white border-[#0067b1] shadow-md' : 'bg-white border-blue-100 text-[#0067b1] hover:border-blue-200'}`}>
                                <ShieldCheck size={20} className="shrink-0" /> <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">Brak redukcji sumy</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.25em] ml-2 flex items-center gap-2"><Star size={14}/> Dodatki ubezpieczyciela</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {aktualnaKonfigDodatkow
                              .filter(dodatek => !dodatek.showIn || dodatek.showIn.includes(nowyWariant.tryb))
                              .map(dodatek => {
                                const IconComponent = dodatek.icon || PackagePlus;
                                const isActive = !!nowyWariant.dodatki[dodatek.id];
                                const isExpanded = expandedDodatek === dodatek.id;
                                
                                const isMulti = !!dodatek.getMultiOptions;
                                const currentMultiOptions = isMulti ? dodatek.getMultiOptions(nowyWariant.tryb) : [];
                                
                                let displayLabel = dodatek.label;
                                if (isActive && !isMulti && typeof nowyWariant.dodatki[dodatek.id] === 'string' && nowyWariant.dodatki[dodatek.id] !== 'true') {
                                  displayLabel = `${dodatek.label}: ${nowyWariant.dodatki[dodatek.id]}`;
                                } else if (isActive && isMulti && Array.isArray(nowyWariant.dodatki[dodatek.id])) {
                                  displayLabel = `${dodatek.label} (${nowyWariant.dodatki[dodatek.id].length})`;
                                }

                                return (
                                  <div key={dodatek.id} className="flex flex-col gap-2">
                                    <button onClick={() => handleDodatekToggle(dodatek)} className={`flex flex-col items-center justify-center p-4 rounded-[2rem] border-2 transition-all gap-3 h-28 relative ${isActive ? 'bg-gradient-to-br from-[#0067b1] to-blue-800 text-white border-[#0067b1]' : 'bg-white border-blue-100 text-slate-700'}`}>
                                      <div className={`p-2.5 rounded-2xl ${isActive ? 'bg-white/20' : 'bg-blue-50'}`}><IconComponent size={24} /></div>
                                      <span className="text-[9px] font-black uppercase tracking-widest leading-tight text-center">{displayLabel}</span>
                                      {isActive && <CheckCircle2 size={16} className="absolute top-3 right-3 text-white/80" />}
                                    </button>
                                    
                                    {isExpanded && !isMulti && dodatek.options && (
                                      <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2">
                                        {dodatek.options.map(opt => (
                                          <button key={opt} onClick={(e) => handleSubOptionSelect(dodatek.id, opt, e)} className="py-3 px-2 rounded-xl text-[8px] font-black uppercase tracking-widest bg-white border-2 border-blue-50 text-[#0067b1] hover:bg-[#0067b1] hover:text-white shadow-sm"> {opt} </button>
                                        ))}
                                      </div>
                                    )}

                                    {isExpanded && isMulti && (
                                       <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#001c3d]/60 p-6 backdrop-blur-md animate-in fade-in" onClick={(e) => { e.stopPropagation(); setExpandedDodatek(null); }}>
                                        <div className="bg-white rounded-[3.5rem] w-full max-w-xl shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 border border-white/20" onClick={e => e.stopPropagation()}>
                                          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-blue-50/50 rounded-t-[3.5rem]">
                                            <div className="flex flex-col gap-1">
                                              <p className="text-[14px] font-black uppercase text-[#0067b1] tracking-[0.25em] flex items-center gap-3">
                                                <IconComponent size={22} /> {dodatek.label}
                                              </p>
                                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Wariant: {nowyWariant.tryb}</p>
                                            </div>
                                            <button onClick={() => setExpandedDodatek(null)} className="text-slate-400 hover:text-red-500 bg-white p-3 rounded-full shadow-lg border border-slate-100 transition-all active:scale-90">
                                              <XCircle size={26} />
                                            </button>
                                          </div>
                                          
                                          <div className="p-8 overflow-y-auto no-scrollbar space-y-3 flex-1">
                                            {currentMultiOptions.map(opt => {
                                              const selectedArray = nowyWariant.dodatki[dodatek.id] || [];
                                              const isMultiSelected = selectedArray.includes(opt);
                                              return (
                                                <button
                                                  key={opt}
                                                  onClick={(e) => handleSubOptionSelect(dodatek.id, opt, e, true)}
                                                  className={`w-full py-5 px-6 rounded-3xl text-[10px] font-black tracking-wide text-left transition-all border-2 flex items-center justify-between gap-5 ${isMultiSelected ? 'bg-blue-50 border-[#0067b1] text-[#0067b1] shadow-inner' : 'bg-white border-slate-100 text-slate-500 hover:bg-blue-50/30 hover:border-blue-200'}`}
                                                >
                                                  <span className="leading-tight flex-1 text-[11px] font-black text-[#1e293b]">{opt}</span>
                                                  {isMultiSelected ? (
                                                    <CheckCircle2 size={24} className="text-[#0067b1] shrink-0" />
                                                  ) : (
                                                    <div className="w-[24px] h-[24px] rounded-full border-2 border-slate-200 shrink-0"></div>
                                                  )}
                                                </button>
                                              );
                                            })}
                                          </div>
                                          
                                          <div className="p-8 border-t border-slate-100 bg-slate-50 rounded-b-[3.5rem]">
                                            <button onClick={(e) => { e.stopPropagation(); setExpandedDodatek(null); }} className="w-full py-6 bg-gradient-to-r from-[#0067b1] to-blue-700 text-white text-[13px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-blue-500/40 hover:scale-[1.01] active:scale-95 transition-all">
                                              Zatwierdź klauzule
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="block md:hidden mt-8">
                         {validationError && (
                           <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center gap-3 font-bold text-[11px] uppercase tracking-wider mb-4 shadow-sm">
                             <XCircle size={18} /> {validationError}
                           </div>
                         )}
                         <button onClick={dodajWariant} className={`w-full bg-gradient-to-r from-[#0067b1] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.25em] shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-4`}>
                           <Plus size={26} /> Dodaj wariant
                         </button>
                      </div>

                    </div>
                  </div>
                </section>
              </div>
            </div>

            {oferta.warianty.length > 0 && (
              <div className="w-full mt-4 animate-in fade-in slide-in-from-bottom-8">
                
                <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-200 pb-5 mb-8 gap-6">
                  <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-[#0067b1] flex items-center gap-3 ml-2">
                    <Layers size={22} /> Przygotowane Warianty ({oferta.warianty.length})
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <button onClick={zapiszWBazie} disabled={saving} className="px-8 py-4 bg-white text-slate-700 font-black rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all"> 
                      {saving ? <Loader2 className="animate-spin" size={18} /> : <Save className="text-[#0067b1]" size={18}/>} Zapisz ofertę 
                    </button>
                    <button onClick={handleGeneratePdfNative} className="px-8 py-4 bg-gradient-to-r from-[#0067b1] to-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"> 
                      <FileText size={18} /> Generuj PDF oferty
                    </button>
                  </div>
                </div>

                <div className="flex flex-nowrap overflow-x-auto gap-6 pb-8 snap-x xl:snap-none no-scrollbar">
                  {oferta.warianty.map(w => (
                    <div key={w.id} className="w-[85vw] sm:w-[310px] shrink-0 snap-center xl:snap-align-none bg-white rounded-[3rem] shadow-lg border-2 border-slate-50 overflow-hidden flex flex-col min-h-[420px] animate-in zoom-in-95">
                      <div className="p-7 bg-gradient-to-br from-blue-50/50 to-white border-b border-slate-100 relative flex flex-col items-center justify-center text-center">
                        <div className="absolute top-5 right-5 flex gap-1.5">
                          <button onClick={() => edytujWariant(w)} className="text-slate-300 hover:text-[#0067b1] p-2.5 bg-white shadow-sm rounded-full active:scale-95 transition-all" title="Edytuj ten wariant"> <Edit2 size={18} /> </button>
                          <button onClick={() => setOferta(p => ({...p, warianty: p.warianty.filter(x => x.id !== w.id)}))} className="text-slate-300 hover:text-red-500 p-2.5 bg-white shadow-sm rounded-full active:scale-95 transition-all" title="Usuń wariant"> <Trash2 size={18} /> </button>
                        </div>
                        <div className="h-10 flex items-center justify-center mb-3">
                          <CompanyLogo firma={w.firma} />
                        </div>
                        <span className="text-[8px] font-black px-4 py-1.5 bg-[#0067b1] text-white rounded-full uppercase tracking-widest shadow-sm">{w.tryb}</span>
                      </div>
                      <div className="p-8 flex-1 flex flex-col justify-between bg-white">
                        <div className="space-y-4">
                          {w.tryb !== 'OC' && (
                            <div className="flex justify-between items-center border-b border-slate-50 pb-5 mb-5 uppercase">
                              <span className="text-slate-400 text-[10px] font-black">Suma:</span>
                              <span className="text-[#0067b1] bg-blue-50/80 px-4 py-1.5 rounded-xl font-black text-[11px]">{w.sumaUbezpieczenia} PLN {w.typSumy}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 border-t border-slate-50 pt-4"> <span>Odpowiedzialność OC</span> {w.tryb !== 'AC' ? <CheckCircle2 size={18} className="text-green-500" /> : <XCircle size={18} className="text-slate-200" />} </div>
                          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 border-t border-slate-50 pt-4"> <span>Autocasco (AC)</span> {w.tryb !== 'OC' ? <CheckCircle2 size={18} className="text-green-500" /> : <XCircle size={18} className="text-slate-200" />} </div>
                          <div className="flex flex-wrap gap-2 mt-6">
                            {w.tryb !== 'OC' && <span className="text-[8px] bg-[#0067b1] text-white px-2 py-1.5 rounded-lg font-black uppercase flex items-center gap-1"><Wrench size={10} /> {w.zakresAC.metodaNaprawy}</span>}
                            {w.tryb !== 'OC' && w.zakresAC.stalaSuma && <span className="text-[8px] bg-blue-50 text-[#0067b1] px-2 py-1.5 rounded-lg font-black uppercase border border-blue-100 flex items-center gap-1"><Activity size={10} /> Stała Wartość</span>}
                            {Object.entries(w.dodatki).map(([id, val]) => {
                              if (!val || (Array.isArray(val) && val.length === 0)) return null;
                              const dKonfig = (DODATKI_KONFIG[w.firma] || DODATKI_KONFIG["Default"]).find(d => d.id === id);
                              
                              if (Array.isArray(val)) {
                                return val.map(v => (
                                  <span key={`${id}-${v}`} className="text-[8px] bg-amber-50 text-amber-800 px-2 py-1.5 rounded-lg font-black uppercase border border-amber-200 flex items-center gap-1 whitespace-nowrap overflow-hidden max-w-full text-ellipsis shadow-sm">
                                    {v}
                                  </span>
                                ));
                              }

                              const label = dKonfig ? dKonfig.label : id;
                              const displayVal = (typeof val === 'string' && val !== 'true') ? (id === 'nnw' ? `NNW: ${val}` : `${label}: ${val}`) : label;
                              return (
                                <span key={id} className="text-[8px] bg-blue-50 text-[#0067b1] px-2 py-1.5 rounded-lg font-black uppercase border border-blue-100 flex items-center gap-1 whitespace-nowrap overflow-hidden max-w-full text-ellipsis shadow-sm">
                                  {displayVal}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div className="pt-10 border-t border-slate-100 text-center mt-8">
                           <div className="flex items-center justify-center gap-1">
                            <p className="text-xl font-black text-[#0067b1] leading-none tracking-tighter"> {w.skladka} </p>
                            <span className="text-sm font-black text-[#0067b1]/30">PLN</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 py-4 px-12 z-40 hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
           <div className="max-w-7xl mx-auto flex justify-between items-center">
             <span><Settings2 size={14} className="inline mr-2"/> EIGDA OS v8.0</span>
             <div className="flex items-center gap-4"> <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Status: Połączono </div>
           </div>
        </footer>
      </div>

      {/* ========================================= */}
      {/* EKRAN ŁADOWANIA PODCZAS TWORZENIA PDF */}
      {/* ========================================= */}
      {pdfMode && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-200/90 backdrop-blur-sm" data-html2canvas-ignore="true">
          <div className="flex flex-col items-center bg-white p-10 rounded-[3rem] shadow-2xl border border-blue-50 animate-in zoom-in-95">
            <Loader2 className="animate-spin text-[#0067b1] mb-6" size={56} />
            <p className="text-sm font-black text-[#0067b1] tracking-[0.2em] uppercase">Generowanie PDF...</p>
            <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest">To zajmie tylko chwilę</p>
          </div>
        </div>
      )}
    </>
  );
};

// --- GŁÓWNA APLIKACJA (EGIDA) ---
export default function App() {
  const [user, setUser] = useState(null);
  const [init, setInit] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [records, setRecords] = useState([]);
  const [actionStatus, setActionStatus] = useState(null);
  const [errors, setErrors] = useState([]);
  const [searchPlate, setSearchPlate] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const initialFormData = {
    imieNazwisko: '', ulica: '', kodPocztowy: '', miejscowosc: '',
    ubezpieczyciel: '', numerPolisy: '', dataRozwiazania: '', dataPodpisania: '',
    miejscowoscWystawienia: '', marka: '', model: '', nrRejestracyjny: '', art: '28'
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    document.title = "Egida";
  }, []);

  const modules = [
    { id: 'dashboard', label: 'Pulpit', icon: LayoutDashboard, color: 'text-slate-600', bg: 'bg-slate-50', desc: 'Przegląd systemu' },
    { id: 'wznowienia', label: 'Wznowienia', icon: RefreshCcw, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Kontynuacje polis' },
    { id: 'wypowiedzenia', label: 'Wypowiedzenia', icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50', desc: 'Generator dokumentu' },
    { id: 'oferty', label: 'Oferty', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Nowe propozycje' },
    { id: 'porownania', label: 'Porównania', icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-50', desc: 'Zakresów ubezpieczenia' },
    { id: 'statystyki', label: 'Statystyki', icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Analiza wyników' },
    { id: 'baza', label: 'Baza Danych', icon: Database, color: 'text-cyan-500', bg: 'bg-cyan-50', desc: 'Zasoby klientów' },
  ];

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth).catch((e) => {
            console.warn("Działanie w trybie podglądu, logowanie anonimowe pominięte.", e);
          });
        }
      } catch (err) { 
        console.warn("Błąd autentykacji", err); 
      } finally {
        setInit(true);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, pass) => {
    setLoginError('');
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
        setLoginError('Błędne dane logowania.');
    }
  };

  const handleLogout = async () => {
    try {
        await signOut(auth);
        setActiveTab('dashboard');
    } catch (err) {
        console.error("Logout error", err);
    }
  };

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'pojazdy');
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() }));
      setRecords(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'nrRejestracyjny' || name === 'plate') formattedValue = formatPlate(value);
    if (['imieNazwisko', 'miejscowosc', 'ulica', 'marka', 'model', 'miejscowoscWystawienia'].includes(name)) {
        formattedValue = formatTitleCase(value);
    }
    if (name === 'kodPocztowy') formattedValue = formatPostalCode(value);
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleSearch = () => {
    const normalizedSearch = searchPlate.replace(/\s/g, '').toUpperCase();
    const record = records.find(r => r.nrRejestracyjny?.replace(/\s/g, '').toUpperCase() === normalizedSearch);
    if (record) {
        setFormData(prev => ({ ...prev, ...record, nrRejestracyjny: record.nrRejestracyjny.toUpperCase() }));
        setErrors([]);
    } else {
        setFormData(prev => ({ ...prev, nrRejestracyjny: normalizedSearch }));
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setSearchPlate('');
    setErrors([]);
    setShowResetConfirm(false);
  };

  const getInputClass = (fieldName, type = 'text') => {
    const isError = errors.includes(fieldName);
    const isEmpty = !formData[fieldName];
    let base = "w-full px-5 py-4 rounded-2xl border-2 outline-none transition-all text-sm font-black shadow-sm placeholder:text-slate-400 placeholder:font-normal";
    if ((type === 'select' || type === 'date') && isEmpty) {
        base += " text-slate-400";
    } else {
        base += " text-slate-800";
    }
    const status = isError 
        ? "border-red-400 bg-red-50 ring-2 ring-red-100" 
        : "border-slate-100 bg-slate-50 focus:bg-white focus:border-[#0067b1]";
    return `${base} ${status}`;
  };

  // Zoptymalizowane generowanie Wypowiedzenia - używa tego samego Cache!
  const handleGenerateAndSave = async () => {
    const requiredFields = [
        'imieNazwisko', 'ulica', 'kodPocztowy', 'miejscowosc', 
        'nrRejestracyjny', 'marka', 'model', 'ubezpieczyciel', 
        'numerPolisy', 'dataRozwiazania', 'dataPodpisania', 'miejscowoscWystawienia'
    ];
    const newErrors = requiredFields.filter(f => !formData[f] || formData[f].toString().trim() === '');
    if (newErrors.length > 0) { 
        setErrors(newErrors); 
        setActionStatus('validation_error'); 
        setTimeout(() => setActionStatus(null), 3000); 
        return; 
    }
    try {
        setActionStatus('saving');
        const docId = formData.nrRejestracyjny.replace(/\s/g, '').toUpperCase();
        const { numerPolisy, dataRozwiazania, dataPodpisania, miejscowoscWystawienia, art, ...dataToSave } = formData;
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pojazdy', docId), {
            ...dataToSave, updatedAt: new Date().toISOString(), teamId: 'pallada_main'
        });
        
        await loadJsPdfScript();
        const { jsPDF } = window.jspdf;
        const docPdf = new jsPDF();
        
        const loadFontWithCache = async (url, filename, fontName, fontStyle) => {
            if (!pdfAssetsCache.fonts[filename]) {
                try {
                    const response = await fetch(url);
                    const buffer = await response.arrayBuffer();
                    let binary = '';
                    const bytes = new Uint8Array(buffer);
                    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
                    pdfAssetsCache.fonts[filename] = window.btoa(binary);
                } catch (e) { console.error(e); }
            }
            if (pdfAssetsCache.fonts[filename]) {
                docPdf.addFileToVFS(filename, pdfAssetsCache.fonts[filename]);
                docPdf.addFont(filename, fontName, fontStyle);
            }
        };

        await loadFontWithCache('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf', 'Kiro-Regular.ttf', 'Kiro', 'normal');
        await loadFontWithCache('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf', 'Semplicita-Bold.ttf', 'Semplicita', 'bold');
        await loadFontWithCache('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf', 'Kiro-Bold.ttf', 'Kiro', 'bold');
        
        const palladaBlue = [0, 103, 177]; 
        const slate500 = [100, 116, 139]; 
        const slate400 = [148, 163, 184]; 
        const getFont = (preferred) => docPdf.getFontList()[preferred] ? preferred : "helvetica";
        
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

        if (pdfAssetsCache.mainLogo) {
            const ml = pdfAssetsCache.mainLogo;
            docPdf.addImage(ml.img, 'PNG', 20, 15, 28 * ml.ratio, 28, undefined, 'FAST');
        } else {
            docPdf.setFont(getFont("Semplicita"), "bold");
            docPdf.setFontSize(24);
            docPdf.setTextColor(...palladaBlue);
            docPdf.text("PALLADA", 20, 28);
        }

        docPdf.setFont(getFont("Kiro"), "bold");
        docPdf.setFontSize(11);
        docPdf.setTextColor(0);
        docPdf.text(formatTitleCase(formData.imieNazwisko), 190, 20, { align: 'right' }); 
        docPdf.setFont(getFont("Kiro"), "normal");
        docPdf.setFontSize(10);
        let ulicaZPrefixem = formData.ulica.trim();
        if (!ulicaZPrefixem.toLowerCase().startsWith('ul.')) ulicaZPrefixem = `ul. ${ulicaZPrefixem}`;
        docPdf.text(formatTitleCase(ulicaZPrefixem), 190, 26, { align: 'right' });
        docPdf.text(`${formData.kodPocztowy} ${formatTitleCase(formData.miejscowosc)}`, 190, 32, { align: 'right' });
        docPdf.setFontSize(8);
        docPdf.setTextColor(...slate500);
        docPdf.text("Dane wypowiadającego", 190, 38, { align: 'right' });
        docPdf.setDrawColor(...palladaBlue);
        docPdf.setLineWidth(0.2); 
        docPdf.line(20, 48, 190, 48);
        docPdf.setTextColor(...slate500);
        docPdf.setFontSize(9);
        docPdf.text("Towarzystwo ubezpieczeniowe:", 20, 65);
        docPdf.setTextColor(0);
        docPdf.setFontSize(14);
        docPdf.setFont(getFont("Kiro"), "bold");
        docPdf.text(formData.ubezpieczyciel.toUpperCase(), 20, 72); 
        docPdf.setTextColor(...palladaBlue);
        docPdf.setFontSize(14);
        docPdf.setFont(getFont("Semplicita"), "bold");
        docPdf.text("WYPOWIEDZENIE UMOWY OC POSIADACZA POJAZDU", 105, 95, { align: 'center' });
        docPdf.setTextColor(0);
        docPdf.setFontSize(11);
        const formattedDate = formatToPLDate(formData.dataRozwiazania);
        docPdf.setFont(getFont("Kiro"), "normal");
        const t1 = "Proszę o rozwiązanie z dniem ";
        const t2 = formattedDate;
        const t3 = " umowy ubezpieczenia OC posiadaczy pojazdów mechanicznych, zgodnie z poniższymi danymi identyfikacyjnymi pojazdu i polisy:";
        docPdf.text(t1, 20, 110);
        const w1 = docPdf.getTextWidth(t1);
        docPdf.setFont(getFont("Kiro"), "bold");
        docPdf.text(t2, 20 + w1, 110);
        const w2 = docPdf.getTextWidth(t2);
        docPdf.setFont(getFont("Kiro"), "normal");
        const lines = docPdf.splitTextToSize(t3, 170 - (w1 + w2));
        docPdf.text(lines[0], 20 + w1 + w2, 110);
        const remainingLines = docPdf.splitTextToSize(t1 + t2 + t3, 170).slice(1);
        let curY = 110 + 7;
        remainingLines.forEach(line => {
            docPdf.text(line, 20, curY);
            curY += 7;
        });
        const blockY = curY + 10; 
        const drawDataBlock = (x, y, label, value) => {
            docPdf.setFontSize(8);
            docPdf.setTextColor(...slate500);
            docPdf.setFont(getFont("Kiro"), "normal");
            docPdf.text(label.toUpperCase(), x, y);
            docPdf.setFontSize(12);
            docPdf.setTextColor(0);
            docPdf.setFont(getFont("Kiro"), "bold");
            docPdf.text(value || "---", x, y + 7);
        };
        drawDataBlock(20, blockY, "Numer polisy", formData.numerPolisy);
        drawDataBlock(75, blockY, "Marka i model pojazdu", `${formData.marka} ${formData.model}`.toUpperCase());
        drawDataBlock(140, blockY, "Numer rejestracyjny", formData.nrRejestracyjny.toUpperCase());
        const drawCb = (y, isChecked, textLines) => {
            docPdf.setDrawColor(...slate400);
            docPdf.setLineWidth(0.3);
            docPdf.rect(20, y - 4, 5, 5);
            if (isChecked) {
                docPdf.setDrawColor(...palladaBlue);
                docPdf.setLineWidth(0.8);
                docPdf.line(21, y - 1.5, 22.5, y);
                docPdf.line(22.5, y, 25.5, y - 4.5);
                docPdf.setFont(getFont("Kiro"), "bold");
                docPdf.setTextColor(0);
            } else {
                docPdf.setFont(getFont("Kiro"), "normal");
                docPdf.setTextColor(...slate500);
            }
            docPdf.setFontSize(10.5);
            let cy = y;
            textLines.forEach(line => { docPdf.text(line, 30, cy); cy += 5.5; });
        };
        const cbStartY = blockY + 25; 
        drawCb(cbStartY, formData.art === '28', ["z ostatnim dniem okresu ubezpieczenia, na który została zawarta (art. 28 Ustawy*)"]);
        drawCb(cbStartY + 12, formData.art === '28a', ["automatycznie odnowioną, z dniem złożenia wypowiedzenia, ponieważ posiadam", "ubezpieczenie w/w pojazdu w innym zakładzie ubezpieczeń (art. 28 a Ustawy*)"]);
        drawCb(cbStartY + 28, formData.art === '31', ["jako nabywca / nowy posiadacz pojazdu, z dniem złożenia wypowiedzenia (art.31 Ustawy*)"]);
        const signY = 240;
        docPdf.setDrawColor(...slate400);
        docPdf.setLineWidth(0.2);
        docPdf.setLineDashPattern([1, 1], 0);
        docPdf.rect(15, signY - 17, 60, 30); 
        docPdf.setFontSize(6.5);
        docPdf.setTextColor(...slate400);
        docPdf.text("DATA OTRZYMANIA :", 45, signY - 12, { align: 'center' });
        docPdf.text("PODPIS AGENTA", 45, signY - 8, { align: 'center' });
        docPdf.setLineDashPattern([], 0); 
        docPdf.setTextColor(0);
        docPdf.setFontSize(10);
        docPdf.text(`${formatTitleCase(formData.miejscowoscWystawienia)}, dnia ${formatToPLDate(formData.dataPodpisania)}`, 20, signY + 20);
        docPdf.setDrawColor(0);
        docPdf.setLineWidth(0.4);
        docPdf.line(125, signY + 15, 190, signY + 15);
        docPdf.setFontSize(8); 
        docPdf.text("CZYTELNY PODPIS WYPOWIADAJĄCEGO", 157.5, signY + 20, { align: 'center' });
        docPdf.setTextColor(...slate500);
        docPdf.setFontSize(7);
        const lawStr = "* Ustawa z dnia 22.05.2003 o ubezpieczeniach obowiązkowych, Ubezpieczeniowym Funduszu Gwarancyjnym i Polskim Biurze Ubezpieczycieli Komunikacyjnych (Dz. U. z 2018 r. poz. 473).";
        docPdf.text(docPdf.splitTextToSize(lawStr, 170), 20, 278);
        docPdf.save(`wypowiedzenie_${formData.nrRejestracyjny}.pdf`);
        setActionStatus('success'); 
        setTimeout(() => setActionStatus(null), 3000);
    } catch (err) { 
        setActionStatus('error'); 
        console.error(err);
    }
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="p-6 md:p-12 space-y-12 animate-in fade-in duration-500" style={styles.body}>
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <p className="text-[#0067b1] font-bold text-xs uppercase tracking-[0.2em] mb-2">System Egida</p>
              <h1 className="text-4xl font-black text-slate-900" style={styles.header}>Pulpit Agenta</h1>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aktywny: {user?.email}</span>
            </div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#0067b1] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 flex flex-col justify-between overflow-hidden relative group">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                <div>
                  <Database className="mb-4 opacity-50" size={32} />
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Baza Klientów</p>
                  <p className="text-6xl font-black mt-2 leading-none" style={styles.header}>{records.length}</p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-blue-200 cursor-pointer hover:text-white" onClick={() => setActiveTab('baza')}>
                  <ArrowUpRight size={16} /> Zarządzaj bazą
                </div>
            </div>
            {modules.filter(m => m.id !== 'dashboard').map((mod) => (
              <button 
                key={mod.id}
                onClick={() => setActiveTab(mod.id)}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-start text-left group"
              >
                <div className={`${mod.bg} ${mod.color} p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                  <mod.icon size={28} />
                </div>
                <span className="text-xl font-black text-slate-800" style={styles.header}>{mod.label}</span>
                <p className="text-slate-400 text-sm mt-2 font-medium" style={styles.body}>{mod.desc}</p>
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (activeTab === 'wypowiedzenia') {
      return (
        <div className="max-w-5xl mx-auto p-4 md:p-12 space-y-8 pb-20 animate-in slide-in-from-bottom-4" style={styles.body}>
            <header className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="bg-rose-500 p-4 rounded-3xl shadow-xl shadow-rose-200"><FileText className="text-white" size={32} /></div>
                    <div>
                      <h1 className="text-3xl font-black text-slate-900 tracking-tight" style={styles.header}>Wypowiedzenia</h1>
                      <p className="text-slate-400 font-medium text-sm">Generator dokumentu</p>
                    </div>
                </div>
                <button onClick={() => setShowResetConfirm(true)} className="px-8 py-3 bg-white text-rose-500 border border-rose-100 rounded-2xl font-bold text-sm hover:bg-rose-50 transition-all shadow-sm">Wyczyść pola</button>
            </header>
            <div className="space-y-8">
                <section className="bg-[#0067b1] rounded-[2.5rem] p-8 shadow-2xl shadow-blue-100 relative overflow-hidden">
                    <div className="relative z-10">
                      <label className="block text-xs font-bold text-blue-100 mb-3 uppercase tracking-[0.2em]">Szybkie wyszukiwanie pojazdu</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
                            <input 
                              type="text" 
                              className="w-full pl-12 pr-4 py-5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 uppercase font-bold text-lg outline-none focus:bg-white/20 placeholder:font-normal" 
                              placeholder="WPISZ NR REJ..." 
                              value={searchPlate} 
                              onChange={(e) => setSearchPlate(e.target.value.toUpperCase())} 
                              onKeyPress={(e) => e.key === 'Enter' && handleSearch()} 
                            />
                          </div>
                          <button onClick={handleSearch} className="bg-white text-[#0067b1] px-10 py-5 rounded-2xl font-black hover:bg-blue-50 transition-all uppercase tracking-widest text-sm shadow-xl">Szukaj</button>
                      </div>
                    </div>
                </section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
                        <h2 className="font-black text-[#0067b1] uppercase text-xs tracking-[0.2em] flex items-center gap-2" style={styles.header}><Users size={16} /> Dane Wypowiadającego</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Imię i Nazwisko / Firma</label>
                                <input name="imieNazwisko" placeholder="np. Jan Kowalski" className={getInputClass('imieNazwisko')} value={formData.imieNazwisko} onChange={handleInputChange} style={styles.body} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Ulica i numer</label>
                                <input name="ulica" placeholder="np. Polna 12/3" className={getInputClass('ulica')} value={formData.ulica} onChange={handleInputChange} style={styles.body} />
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/3">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Kod</label>
                                    <input name="kodPocztowy" placeholder="00-000" className={getInputClass('kodPocztowy')} value={formData.kodPocztowy} onChange={handleInputChange} maxLength={6} style={styles.body} />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Miejscowość</label>
                                    <input name="miejscowosc" placeholder="np. Szczecin" className={getInputClass('miejscowosc')} value={formData.miejscowosc} onChange={handleInputChange} style={styles.body} />
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
                        <h2 className="font-black text-[#0067b1] uppercase text-xs tracking-[0.2em] flex items-center gap-2" style={styles.header}><Shield size={16} /> Pojazd i Polisa</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Nr rejestracyjny</label>
                                <input name="nrRejestracyjny" placeholder="ABC 12345" className={getInputClass('nrRejestracyjny')} value={formData.nrRejestracyjny} onChange={handleInputChange} style={styles.body} />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Marka</label>
                                  <input name="marka" placeholder="np. Toyota" className={getInputClass('marka')} value={formData.marka} onChange={handleInputChange} style={styles.body} />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Model</label>
                                  <input name="model" placeholder="np. Corolla" className={getInputClass('model')} value={formData.model} onChange={handleInputChange} style={styles.body} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Ubezpieczyciel</label>
                                <select name="ubezpieczyciel" className={getInputClass('ubezpieczyciel', 'select')} value={formData.ubezpieczyciel} onChange={handleInputChange} style={styles.body}>
                                    <option value="">Wybierz z listy...</option>
                                    {TOWARZYSTWA.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Nr polisy</label>
                                  <input name="numerPolisy" placeholder="Numer polisy" className={getInputClass('numerPolisy')} value={formData.numerPolisy} onChange={handleInputChange} style={styles.body} />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Data rozwiązania</label>
                                  <input name="dataRozwiazania" type="date" className={getInputClass('dataRozwiazania', 'date')} value={formData.dataRozwiazania} onChange={handleInputChange} style={styles.body} />
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 md:col-span-2 space-y-6">
                        <h2 className="font-black text-[#0067b1] uppercase text-xs tracking-[0.2em] flex items-center gap-2" style={styles.header}><MapPin size={16} /> Miejsce i data wystawienia</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Data podpisania</label>
                              <input name="dataPodpisania" type="date" className={getInputClass('dataPodpisania', 'date')} value={formData.dataPodpisania} onChange={handleInputChange} style={styles.body} />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Miejscowość podpisania</label>
                              <input name="miejscowoscWystawienia" placeholder="np. Szczecin" className={getInputClass('miejscowoscWystawienia')} value={formData.miejscowoscWystawienia} onChange={handleInputChange} style={styles.body} />
                            </div>
                        </div>
                    </section>
                    <section className="md:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {['28', '28a', '31'].map(a => (
                            <button key={a} onClick={() => setFormData({...formData, art: a})} className={`p-6 rounded-[2rem] border-2 flex items-center gap-4 transition-all ${formData.art === a ? 'bg-blue-50 border-[#0067b1] shadow-lg shadow-blue-100' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.art === a ? 'border-[#0067b1] bg-[#0067b1]' : 'border-slate-200'}`}>
                                    {formData.art === a && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <div className="text-left leading-tight">
                                    <span className="block font-black text-slate-900 text-sm" style={styles.header}>{a === '28' ? 'Standardowe' : a === '28a' ? 'Po wznowieniu' : 'Nabywcy'}</span>
                                    <span className="block font-bold text-[9px] uppercase text-slate-500 mt-1 tracking-widest">ART. {a} USTAWY</span>
                                </div>
                            </button>
                        ))}
                    </section>
                </div>
                <button onClick={handleGenerateAndSave} className="w-full p-6 bg-[#0067b1] text-white rounded-[2rem] font-black shadow-2xl shadow-blue-200 flex items-center justify-center gap-4 hover:bg-blue-700 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-sm" style={styles.header}>
                    {actionStatus === 'saving' ? <Loader2 className="animate-spin" /> : <Download size={24} />}
                    {actionStatus === 'saving' ? "Generowanie..." : "Pobierz wypowiedzenie PDF"}
                </button>
            </div>
        </div>
      );
    }
    if (activeTab === 'oferty') {
      return <OfertyModule user={user} />;
    }
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center" style={styles.body}>
        <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
          <Zap size={48} className="text-slate-200" />
        </div>
        <h2 className="text-3xl font-black text-slate-800" style={styles.header}>Moduł {activeTab.toUpperCase()}</h2>
        <p className="text-slate-400 font-medium mt-3 max-w-sm">Trwają prace nad wdrożeniem tego modułu. Zapraszamy wkrótce.</p>
        <button onClick={() => setActiveTab('dashboard')} className="mt-8 px-8 py-3 bg-[#0067b1] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-blue-700 transition-all">Powrót</button>
      </div>
    );
  };

  if (!init) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  if (!user) return <LoginScreen onLogin={handleLogin} error={loginError} />;

  return (
    <div className="flex h-screen bg-gray-50 text-slate-900" style={styles.body}>
      <aside className={`bg-white border-r border-slate-100 transition-all duration-500 ${isSidebarOpen ? 'w-72' : 'w-24'} hidden md:flex flex-col z-30`}>
        <div className="p-8 flex items-center gap-4">
          <div className="bg-[#0067b1] p-3 rounded-2xl text-white shadow-xl shadow-blue-200"><Shield size={28} /></div>
          {isSidebarOpen && (
            <div className="animate-in fade-in slide-in-from-left-4">
              <span className="font-black text-2xl tracking-tighter text-[#0067b1]" style={styles.header}>EGIDA</span>
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mt-[-4px]">OPERATING SYSTEM</span>
            </div>
          )}
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto hide-scrollbar">
          {modules.map((mod) => (
            <button 
              key={mod.id}
              onClick={() => setActiveTab(mod.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeTab === mod.id ? 'bg-blue-50/50 shadow-sm' : 'hover:bg-slate-50'}`}
            >
              <div className={`p-2 rounded-xl transition-all ${activeTab === mod.id ? mod.color + ' bg-white shadow-sm' : 'text-slate-400 group-hover:' + mod.color}`}>
                <mod.icon size={22} />
              </div>
              {isSidebarOpen && (
                <span className={`text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === mod.id ? 'text-[#0067b1]' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {mod.label}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-6 mt-auto">
          <div className={`flex items-center gap-4 p-3 bg-slate-50 rounded-[2rem] border border-slate-100 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100 shrink-0">
               <UserCircle size={24} className="text-[#0067b1]" />
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-xs font-black text-slate-800 truncate">{user ? getUserDisplayName(user.email) : "Bartek Żochowski"}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Administrator</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className={`w-full flex items-center gap-4 p-4 mt-4 text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-50 rounded-2xl transition-all ${!isSidebarOpen && 'justify-center'}`}>
            <LogOut size={20} />
            {isSidebarOpen && <span>Wyloguj</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-[#fdfdfe] relative">
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="absolute left-4 top-4 hidden md:flex p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#0067b1] shadow-sm z-50 transition-all"
        >
          {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
        {renderContent()}
      </main>
      {showResetConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-white p-10 rounded-[3rem] w-full max-sm space-y-6 text-center shadow-2xl animate-in zoom-in-95">
                  <div className="mx-auto text-rose-500 h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center">
                      <RotateCcw size={40} />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-slate-900" style={styles.header}>Wyczyścić?</h3>
                    <p className="text-slate-400 font-medium text-sm mt-2">Usuniesz wszystkie dane z tego formularza.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                      <button onClick={handleReset} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg">Tak, czyść</button>
                      <button onClick={() => setShowResetConfirm(false)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs">Anuluj</button>
                  </div>
              </div>
          </div>
      )}
      {actionStatus === 'validation_error' && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-12">
              <AlertCircle className="text-rose-400" /> 
              <span className="font-black text-xs uppercase tracking-widest">Błędy w formularzu!</span>
          </div>
      )}
      {actionStatus === 'success' && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-12">
              <CheckSquare className="text-white" /> 
              <span className="font-black text-xs uppercase tracking-widest">Pobrano dokument!</span>
          </div>
      )}
    </div>
  );
}
