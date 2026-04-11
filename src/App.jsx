import React, { useState, useEffect, useMemo } from 'react';
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
  query,
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
  Square,
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
  Wrench
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

// --- LOGO PALLADA I ZDJĘCIE POJAZDU (OFERTOWANIE) ---
const pallada_trans_logo = "./pallada_trans_logo.png"; 
const domyslne_zdjecie_pojazdu = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNDc1NTY5IiBzdHJva2Utd2lkdGg9IjIuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIxMSIgd2lkdGg9IjE4IiBoZWlnaHQ9IjgiIHJ4PSIyIi8+PHBhdGggZD0iTSAzIDExIGwgMiAtNCBoIDE0IGwgMiA0IE0gOCAxOSB2IDIgTSAxNiAxOSB2IDIiLz48Y2lyY2xlIGN4PSI2IiBjeT0iMTkiIHI9IjEiLz48Y2lyY2xlIGN4PSIxOCIgY3k9IjE5IiByPSIxIi8+PC9zdmc+"; 

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
    { id: "nnw", label: "NNW", icon: UserPlus },
    { id: "ochrona_znizek_oc", label: "Ochrona zniżki OC", icon: ShieldAlert, showIn: ['OC', 'OC+AC'] },
    { id: "ochrona_znizek_ac", label: "Ochrona zniżki AC", icon: ShieldAlert, showIn: ['AC', 'OC+AC'] },
    { id: "szyby", label: "Szyby", icon: WindshieldIcon, options: ["Zamiennik (Suma 5.000 zł)", "Oryginał (Suma 5.000 zł)"] },
    { id: "ass", label: "Assistance", icon: Zap }
  ],
  "Ergo Hestia": [
    { id: "nnw", label: "NNW", icon: UserPlus },
    { id: "ochrona_znizek_oc", label: "Ochrona zniżki OC", icon: ShieldAlert, showIn: ['OC', 'OC+AC'] },
    { id: "ochrona_znizek_ac", label: "Ochrona zniżki AC", icon: ShieldAlert, showIn: ['AC', 'OC+AC'] },
    { id: "bagaz", label: "Bagaż", icon: Briefcase },
    { id: "car_ass", label: "Assistance", icon: Zap, options: ["Wypadek", "Wypadek i Awaria", "Turbo"] },
    { id: "szyby", label: "Szyby", icon: WindshieldIcon, options: ["Zamiennik (Suma 5.000 zł)", "Oryginał (Suma 5.000 zł)"] },
    { id: "ochrona_prawna", label: "Ochrona Prawna", icon: Scale },
    { 
      id: "klauzule_katalog", label: "Katalog Klauzul", icon: FilePlus, 
      getMultiOptions: (tryb) => {
        if (tryb === 'OC') return KLAUZULE_HESTIA_BAZA.OC;
        if (tryb === 'AC') return KLAUZULE_HESTIA_BAZA.AC;
        return KLAUZULE_HESTIA_BAZA.OC_AC;
      }
    }
  ],
  "Hestia Biznes": [
    { id: "nnw", label: "NNW Biznes", icon: UserPlus },
    { id: "ochrona_znizek_oc", label: "Ochrona zniżki OC", icon: ShieldAlert, showIn: ['OC', 'OC+AC'] },
    { id: "ochrona_znizek_ac", label: "Ochrona zniżki AC", icon: ShieldAlert, showIn: ['AC', 'OC+AC'] },
    { id: "car_ass", label: "Assistance Biznes", icon: Zap, options: ["Biznes (Polska)", "Biznes (Europa 200km)", "Biznes (Europa 500km)", "Biznes (Europa 1000km)"] },
    { id: "szyby", label: "Szyby", icon: WindshieldIcon, options: ["Zamiennik (Suma 5.000 zł)", "Oryginał (Suma 5.000 zł)"] },
    { id: "ochrona_prawna", label: "Ochrona Prawna Biznes", icon: Scale },
    { 
      id: "klauzule_katalog_biznes", label: "Katalog Klauzul Biznes", icon: FilePlus, 
      getMultiOptions: (tryb) => {
        if (tryb === 'OC') return KLAUZULE_HESTIA_BAZA.OC;
        if (tryb === 'AC') return KLAUZULE_HESTIA_BAZA.AC;
        return KLAUZULE_HESTIA_BAZA.OC_AC;
      }
    }
  ],
  "Warta": [
    { id: "nnw", label: "NNW", icon: UserPlus },
    { id: "warta_pomoc", label: "Warta Pomoc", icon: Zap },
    { id: "szyby", label: "Szyby", icon: WindshieldIcon, options: ["Zamiennik (Suma 5.000 zł)", "Oryginał (Suma 5.000 zł)"] },
    { id: "ochrona_znizek_oc", label: "Ochrona zniżek OC", icon: ShieldAlert, showIn: ['OC', 'OC+AC'] },
    { id: "ochrona_znizek_ac", label: "Ochrona zniżki AC", icon: ShieldAlert, showIn: ['AC', 'OC+AC'] }
  ],
  "Link4": [
    { id: "nnw", label: "NNW", icon: UserPlus },
    { id: "szyby", label: "Szyby 24", icon: WindshieldIcon, options: ["Zamiennik (Suma 5.000 zł)", "Oryginał (Suma 5.000 zł)"] },
    { id: "ass", label: "Auto Assistance", icon: Zap },
    { id: "auto_zastepcze", label: "Auto Zastępcze", icon: Car },
    { id: "ochrona_znizek_oc", label: "Ochrona zniżki OC", icon: ShieldAlert, showIn: ['OC', 'OC+AC'] },
    { id: "ochrona_znizek_ac", label: "Ochrona zniżki AC", icon: ShieldAlert, showIn: ['AC', 'OC+AC'] }
  ],
  "Default": [
    { id: "nnw", label: "NNW", icon: UserPlus },
    { id: "szyby", label: "Szyby", icon: WindshieldIcon, options: ["Zamiennik (Suma 5.000 zł)", "Oryginał (Suma 5.000 zł)"] },
    { id: "ass", label: "Assistance", icon: Zap },
    { id: "ochrona_znizek_oc", label: "Ochrona zniżki OC", icon: ShieldAlert, showIn: ['OC', 'OC+AC'] },
    { id: "ochrona_znizek_ac", label: "Ochrona zniżki AC", icon: ShieldAlert, showIn: ['AC', 'OC+AC'] }
  ]
};

const BAZA_UBEZPIECZYCIELI = [
  "Ergo Hestia", "Hestia Biznes", "PZU S.A.", "Warta", "Link4", "HDI", "Compensa", 
  "Wiener", "Interrisk", "Generali", "Allianz", "Uniqa", "MTU"
];

// --- FUNKCJE FORMATUJĄCE (EGIDA & OFERTOWANIE) ---
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

// --- EKRAN LOGOWANIA (EGIDA) ---
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
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Panel Agenta Pallada</p>
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


// --- MODUŁ OFERTOWANIA (Jako wewnętrzny komponent z wklejonym kodem 1:1) ---
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
    pojazd: { marka: "", model: "", nrRejestracyjny: "", vin: "" },
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

  // Historia z Firebase
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

  // LOGIKA GENEROWANIA PDF
  useEffect(() => {
    if (!pdfMode) return;
    
    const triggerPdfGeneration = () => {
      const element = document.getElementById('pdf-content');
      if (!element) return;
      
      const opt = {
        margin:       [8, 0, 8, 0], // Wyzerowane marginesy boczne
        filename:     `Oferta_${oferta.numerOferty.replace(/\//g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          logging: false, 
          windowWidth: 800,
          width: 800, 
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0 
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'], avoid: '.break-inside-avoid' }
      };

      window.html2pdf().set(opt).from(element).save().then(() => {
        setPdfMode(false);
      }).catch(err => {
        console.error("PDF Error:", err);
        setValidationError("Błąd podczas generowania pliku PDF.");
        setPdfMode(false);
      });
    };

    const timer = setTimeout(() => {
      if (window.html2pdf) {
        triggerPdfGeneration();
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => triggerPdfGeneration();
        script.onerror = () => {
          setPdfMode(false);
          setValidationError("Błąd ładowania biblioteki PDF. Sprawdź połączenie.");
        };
        document.body.appendChild(script);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [pdfMode, oferta]);

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

    const typLabel = nowyWariant.firma === "Hestia Biznes" ? "Firma" : "Prywatny";
    const wariantZTypem = { ...nowyWariant, typKlienta: typLabel, id: Date.now() };
    
    setOferta(prev => ({ ...prev, warianty: [...prev.warianty, wariantZTypem] }));
    setNowyWariant(prev => ({ ...prev, skladka: "", zakresAC: { ...prev.zakresAC, metodaNaprawy: "" } }));
    setExpandedDodatek(null);
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
      {!pdfMode && (
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
                    <p className="text-[10px] font-black text-[#0067b1] uppercase tracking-widest tracking-tight">Jakub Cendrowski</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Menedżer Sprzedaży</p>
                 </div>
                 <div className="w-10 h-10 bg-[#0067b1] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-inner uppercase border-4 border-white"> JC </div>
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
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Numer Rejestracyjny</label>
                      <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0067b1] transition-all text-sm font-black uppercase tracking-[0.3em] text-[#0067b1]" value={oferta.pojazd.nrRejestracyjny} onChange={(e) => handleInputChange('pojazd', 'nrRejestracyjny', e.target.value.toUpperCase())} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Fingerprint size={12} className="text-[#0067b1]"/> Numer VIN</label>
                      <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#0067b1] transition-all text-sm font-black uppercase tracking-[0.2em] text-slate-600" value={oferta.pojazd.vin} onChange={(e) => handleInputChange('pojazd', 'vin', e.target.value.toUpperCase())} placeholder="Wpisz 17 znaków VIN" />
                    </div>
                  </div>
                </section>
              </div>

              <div className="lg:col-span-8 space-y-10">
                <section className="bg-white rounded-[2.5rem] p-10 shadow-xl border-t-8 border-[#0067b1] relative overflow-hidden shadow-slate-200/60">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
                    
                    <div className="md:col-span-5 space-y-8">
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
                          <select className="w-full px-5 py-4.5 bg-white shadow-sm border-2 border-slate-200 rounded-2xl outline-none font-black text-[#0067b1] text-lg appearance-none cursor-pointer hover:border-[#0067b1]/50 transition-colors focus:border-[#0067b1]" value={nowyWariant.firma} onChange={(e) => { setNowyWariant({...nowyWariant, firma: e.target.value, dodatki: {}}); setExpandedDodatek(null); }}>
                            {BAZA_UBEZPIECZYCIELI.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>

                        {nowyWariant.tryb !== 'OC' && (
                          <div className="space-y-3 relative">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em] ml-1 flex items-center gap-2"><ShieldCheck size={16} className="text-[#0067b1]"/> Suma Ubezpieczenia</label>
                            <div className="relative">
                              <input type="text" className={`w-full pl-6 pr-36 py-4.5 bg-white shadow-sm border-2 rounded-2xl outline-none font-black text-slate-800 text-xl transition-all ${errors.suma ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 focus:border-[#0067b1]'}`} value={nowyWariant.sumaUbezpieczenia} onChange={(e) => handleKwotaChange('sumaUbezpieczenia', e.target.value)} onBlur={() => handleKwotaBlur('sumaUbezpieczenia')} placeholder="Suma" />
                              <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm tracking-widest">PLN</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2 relative">
                          <label className="text-[10px] font-black text-[#0067b1] uppercase tracking-[0.15em] ml-1 flex items-center gap-2"><Activity size={16} /> Łączna składka</label>
                          <div className="relative">
                            <input type="text" className={`w-full pl-6 pr-36 py-4.5 bg-blue-50/40 border-2 rounded-2xl outline-none font-black text-[#0067b1] text-xl transition-all shadow-inner ${errors.skladka ? 'border-red-500 ring-2 ring-red-100' : 'border-[#0067b1]/40 focus:border-[#0067b1]'}`} value={nowyWariant.skladka} onChange={(e) => handleKwotaChange('skladka', e.target.value)} onBlur={() => handleKwotaBlur('skladka')} placeholder="0,00" />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-[#0067b1]/40 text-lg tracking-widest">PLN</span>
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
                          <>
                            <div className="space-y-4">
                              <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.25em] ml-2 flex items-center gap-2"><Wrench size={14}/> Metoda naprawy (AC)</p>
                              <div className={`grid grid-cols-3 bg-white/50 p-1.5 rounded-[2rem] border-2 shadow-sm gap-1 transition-colors ${errors.metodaNaprawy ? 'border-red-400 bg-red-50/50' : 'border-blue-100'}`}>
                                {['Kosztorysowy', 'Partnerski', 'ASO'].map(metoda => (
                                  <button key={metoda} onClick={() => setNowyWariant({...nowyWariant, zakresAC: {...nowyWariant.zakresAC, metodaNaprawy: metoda}})} className={`py-3 rounded-2xl text-[9px] xs:text-[10px] font-black transition-all uppercase tracking-tighter ${nowyWariant.zakresAC.metodaNaprawy === metoda ? 'bg-[#0067b1] text-white shadow-lg' : 'text-slate-500 hover:text-[#0067b1]'}`}> {metoda} </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.25em] ml-2 flex items-center gap-2"><ShieldCheck size={14}/> Zakres Autocasco</p>
                              <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setNowyWariant({...nowyWariant, zakresAC: {...nowyWariant.zakresAC, stalaSuma: !nowyWariant.zakresAC.stalaSuma}})} className={`flex flex-col items-center justify-center p-2 rounded-[2rem] border-2 transition-all gap-1.5 h-20 group ${nowyWariant.zakresAC.stalaSuma ? 'bg-gradient-to-br from-[#0067b1] to-blue-800 text-white border-[#0067b1]' : 'bg-white border-blue-100 text-[#0067b1]'}`}>
                                  <Activity size={20} /> <span className="text-[9px] font-black uppercase leading-tight tracking-widest">Stała wartość<br/>pojazdu</span>
                                </button>
                                <button onClick={() => setNowyWariant({...nowyWariant, zakresAC: {...nowyWariant.zakresAC, nieredukcyjna: !nowyWariant.zakresAC.nieredukcyjna}})} className={`flex flex-col items-center justify-center p-2 rounded-[2rem] border-2 transition-all gap-1.5 h-20 group ${nowyWariant.zakresAC.nieredukcyjna ? 'bg-gradient-to-br from-[#0067b1] to-blue-800 text-white border-[#0067b1]' : 'bg-white border-blue-100 text-[#0067b1]'}`}>
                                  <ShieldCheck size={20} /> <span className="text-[9px] font-black uppercase leading-tight tracking-widest">Brak redukcji<br/>sumy</span>
                                </button>
                              </div>
                            </div>
                          </>
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

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-12">
                  {oferta.warianty.map(w => (
                    <div key={w.id} className="bg-white rounded-[3rem] shadow-lg border-2 border-slate-50 overflow-hidden flex flex-col min-h-[420px] animate-in zoom-in-95">
                      <div className="p-7 bg-gradient-to-br from-blue-50/50 to-white border-b border-slate-100 flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-sm font-black text-[#0067b1] uppercase tracking-[0.15em]">{w.firma}</h3>
                          <div className="flex gap-2">
                            <span className="text-[8px] font-black px-3 py-1 bg-[#0067b1] text-white rounded-full uppercase tracking-widest">{w.tryb}</span>
                          </div>
                        </div>
                        <button onClick={() => setOferta(p => ({...p, warianty: p.warianty.filter(x => x.id !== w.id)}))} className="text-slate-300 hover:text-red-500 p-3 bg-white shadow-sm rounded-full"> <Trash2 size={22} /> </button>
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
                              const displayVal = (typeof val === 'string' && val !== 'true') ? `${label}: ${val}` : label;
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

                {oferta.warianty.length > 0 && (
                  <div className="relative lg:fixed bottom-8 lg:bottom-12 right-0 lg:right-12 mt-12 lg:mt-0 flex flex-col sm:flex-row gap-5 z-50 px-6 lg:px-0">
                    <button onClick={zapiszWBazie} disabled={saving} className="h-20 w-full sm:w-auto px-12 bg-white text-slate-700 font-black rounded-[2rem] shadow-2xl border-2 border-slate-50 flex items-center justify-center gap-5"> 
                      {saving ? <Loader2 className="animate-spin" /> : <Save className="text-[#0067b1]"/>} Zapisz ofertę 
                    </button>
                    <button onClick={() => setPdfMode(true)} className="h-20 w-full sm:w-auto px-20 bg-gradient-to-r from-[#0067b1] to-blue-800 text-white font-black rounded-[2rem] shadow-2xl uppercase text-[12px] flex items-center justify-center gap-5 cursor-pointer hover:scale-105 active:scale-95 transition-all"> 
                      <FileText size={28} /> Generuj PDF <ChevronRight size={24} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>

          <footer className="fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 py-4 px-12 z-40 hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
             <div className="max-w-7xl mx-auto flex justify-between items-center">
               <span><Settings2 size={14} className="inline mr-2"/> EIGDA OS v7.3 (Zdjęcie wbudowane w kod)</span>
               <div className="flex items-center gap-4"> <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Status: Połączono </div>
             </div>
          </footer>
        </div>
      )}

      {/* ========================================= */}
      {/* KONTENER DLA HTML2PDF - WYIZOLOWANY ABY UNIKNĄĆ UCIĘCIA KRAWĘDZI */}
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

      {/* Rzeczywisty obszar generowania ukryty pod z-indexem, sztywnie wymuszający 800px bez wpływu urządzeń mobilnych */}
      {pdfMode && (
        <div className="absolute top-0 left-0 w-[800px] bg-white z-[9999]" style={{ width: '800px' }}>
          <div id="pdf-content" className="w-[800px] px-8 py-8 box-border text-slate-900 font-sans mx-auto bg-white">
            
            {/* NAGŁÓWEK PALLADA AUTOGLASS */}
            <div className="flex justify-between items-start mb-5 border-b-2 border-[#0067b1] pb-3 relative">
              
              {/* Lewa strona - Logo */}
              <div className="shrink-0">
                {pallada_trans_logo ? (
                  <img src={pallada_trans_logo} alt="Pallada Autoglass" className="h-14 w-auto object-contain" />
                ) : (
                  <>
                    <h1 className="text-[1.8rem] font-black text-[#0067b1] tracking-tighter leading-none mb-0.5">PALLADA</h1>
                    <p className="text-[#0067b1] font-bold tracking-[0.4em] text-[7px] uppercase">Autoglass</p>
                  </>
                )}
              </div>
              
              {/* Prawa strona - Tekst + Wbudowane Zdjęcie */}
              <div className="flex gap-5 items-start justify-end text-right">
                
                {/* Tekst (Tytuł dokumentu, Data, Nr) */}
                <div className="flex flex-col items-end pt-1">
                  <h2 className="text-sm font-black uppercase tracking-[0.1em] text-slate-800">Propozycja ubezpieczenia pojazdu</h2>
                  <div className="mt-1.5 text-[8px] text-slate-500 flex flex-col items-end gap-0.5">
                    <p><span className="font-bold text-slate-400">Nr kalkulacji:</span> <strong className="text-slate-800">{oferta.numerOferty}</strong></p>
                    <p><span className="font-bold text-slate-400">Data kalkulacji:</span> <strong className="text-slate-800">{oferta.dataKalkulacji}</strong></p>
                  </div>
                </div>

                {/* ZDJĘCIE AUTA WBUDOWANE W KOD */}
                {domyslne_zdjecie_pojazdu && (
                  <div className="w-[120px] h-[75px] shrink-0 rounded-md overflow-hidden border border-slate-200">
                    <img src={domyslne_zdjecie_pojazdu} alt="Pojazd" className="w-full h-full object-cover" />
                  </div>
                )}
                
              </div>
            </div>

            {/* METADANE DOKUMENTU */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[9px] text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                  <span className="text-slate-400 font-bold">Marka / model:</span> <strong className="uppercase">{oferta.pojazd.marka || '-'} {oferta.pojazd.model}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                  <span className="text-slate-400 font-bold">Ubezpieczony:</span> <strong className="uppercase">{oferta.klient.nazwa || '-'}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                  <span className="text-slate-400 font-bold">Nr rejestracyjny:</span> <strong className="uppercase">{oferta.pojazd.nrRejestracyjny || '-'}</strong>
                </div>
                {oferta.klient.czyLeasing ? (
                  <div className="flex justify-between border-b border-slate-100 pb-0.5">
                    <span className="text-slate-400 font-bold">Właściciel:</span> <strong className="uppercase text-slate-800">{oferta.klient.wlasciciel || '-'}</strong>
                  </div>
                ) : (
                  <div className="flex justify-between border-b border-slate-100 pb-0.5"></div>
                )}
                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                  <span className="text-slate-400 font-bold">VIN:</span> <strong className="uppercase">{oferta.pojazd.vin || '-'}</strong>
                </div>
              </div>
            </div>

            {/* ZESTAWIENIE OFERT */}
            {oferta.warianty.length > 0 && (
              <div className="pt-2">
                <div className="bg-[#0067b1] text-white text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-t-lg">
                  Szczegółowe Zestawienie Ofert
                </div>
                
                <div className="flex flex-col border-x border-t border-[#0067b1]/20 rounded-b-lg">
                  {oferta.warianty.map((w, index) => {
                    const priceParts = w.skladka.split(',');
                    const mains = priceParts[0];
                    const decimals = priceParts[1] || '00';

                    return (
                    <div key={`pdf-${w.id}`} className={`flex border-b border-[#0067b1]/20 break-inside-avoid bg-white min-h-[95px] w-full box-border ${index === oferta.warianty.length - 1 ? 'rounded-b-lg' : ''}`}>
                      
                      {/* Kolumna 1: Ubezpieczyciel & Suma Ubezpieczenia - 22% */}
                      <div className="w-[22%] p-4 border-r border-slate-100 flex flex-col justify-center bg-slate-50/50 box-border">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[7px] font-black bg-[#0067b1] text-white px-1.5 py-0.5 rounded-sm uppercase tracking-widest">{w.tryb}</span>
                          <h4 className="text-[12px] font-black text-[#0067b1] uppercase leading-tight">{w.firma}</h4>
                        </div>
                        
                        {w.tryb !== 'OC' && (
                          <div className="mt-2 pt-2 border-t border-slate-200/60">
                            <p className="text-[7px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Suma ubezpieczenia</p>
                            <p className="text-[10px] font-black text-slate-800 leading-tight">{w.sumaUbezpieczenia} PLN <span className="text-[7px] text-slate-500 font-normal">{w.typSumy}</span></p>
                          </div>
                        )}
                      </div>

                      {/* Kolumna 2: Zakres Podstawowy - 26% */}
                      <div className="w-[26%] p-4 border-r border-slate-100 flex flex-col justify-center text-[7.5px] leading-tight box-border">
                        <ul className="space-y-1.5">
                          {w.tryb !== 'AC' && (
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 size={10} className="text-[#0067b1] shrink-0"/><span className="font-bold text-slate-800">Ubezpieczenie OC</span>
                            </li>
                          )}
                          {w.tryb !== 'OC' && (
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 size={10} className="text-[#0067b1] shrink-0"/><span className="font-bold text-slate-800">Autocasco (AC)</span>
                            </li>
                          )}
                          {w.dodatki['nnw'] && (
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 size={10} className="text-[#0067b1] shrink-0"/><span className="font-bold text-slate-800">Następstwa (NNW)</span>
                            </li>
                          )}
                          {(w.dodatki['ass'] || w.dodatki['car_ass']) && (
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 size={10} className="text-[#0067b1] shrink-0"/><span className="font-bold text-slate-800">Assistance</span>
                            </li>
                          )}
                          {w.dodatki['szyby'] && (
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 size={10} className="text-[#0067b1] shrink-0"/><span className="font-bold text-slate-800">Ubezpieczenie Szyb</span>
                            </li>
                          )}
                        </ul>
                      </div>
                        
                      {/* Kolumna 3: Szczegóły Opcji (Rozszerzenia) - 30% */}
                      <div className="w-[30%] p-4 border-r border-slate-100 text-[7px] leading-tight flex flex-col justify-center text-slate-600 box-border">
                        <ul className="space-y-1.5 list-disc pl-3 marker:text-[#0067b1]">
                          {w.tryb !== 'OC' && w.zakresAC?.stalaSuma && <li>Auto wartość 100% (stała suma)</li>}
                          {w.tryb !== 'OC' && w.zakresAC?.nieredukcyjna && <li>Brak redukcji sumy ubezpieczenia</li>}
                          {w.tryb !== 'OC' && w.zakresAC?.metodaNaprawy && <li>Naprawa: <strong className="uppercase text-slate-800">{w.zakresAC.metodaNaprawy}</strong></li>}
                          
                          {/* Rozszerzenia dla ASS i Szyb jeśli mają wartość String (np Turbo / Oryginał) */}
                          {w.dodatki['car_ass'] && typeof w.dodatki['car_ass'] === 'string' && <li>Assistance: <strong className="text-slate-800">{w.dodatki['car_ass']}</strong></li>}
                          {w.dodatki['szyby'] && typeof w.dodatki['szyby'] === 'string' && <li>Szyby: <strong className="text-slate-800">{w.dodatki['szyby']}</strong></li>}

                          {/* Pozostałe opcje, w tym długa lista klauzul Hestii */}
                          {Object.entries(w.dodatki).map(([id, val]) => {
                              if (!val || ['nnw', 'ass', 'car_ass', 'szyby'].includes(id)) return null;
                              
                              const dKonfig = (DODATKI_KONFIG[w.firma] || DODATKI_KONFIG["Default"]).find(d => d.id === id);
                              const label = dKonfig ? dKonfig.label : id;
                              
                              if (Array.isArray(val)) {
                                return val.map(v => <li key={v} className="text-slate-700">{v}</li>);
                              }
                              
                              const displayVal = (typeof val === 'string' && val !== 'true') ? `${label}: ${val}` : label;
                              return <li key={id} className="text-slate-700">{displayVal}</li>;
                          })}
                        </ul>
                      </div>

                      {/* Kolumna 4: Składka domykająca prawą stronę - 22% */}
                      <div className="w-[22%] p-4 bg-blue-50/30 flex flex-col items-center justify-center box-border">
                         <div className="text-[7.5px] font-black text-slate-400 tracking-widest uppercase mb-1.5 text-center">
                           Składka łączna
                         </div>
                         <div className="flex items-baseline text-[#0067b1] mb-1.5 whitespace-nowrap">
                           <span className="text-[1.5rem] font-black tracking-tighter leading-none">{mains}</span>
                           <span className="text-[0.75rem] font-black leading-none">,{decimals}</span>
                           <span className="text-[0.6rem] font-black text-[#0067b1]/50 ml-1 uppercase leading-none">PLN</span>
                         </div>
                         <div className="text-[6.5px] font-black tracking-widest uppercase text-[#0067b1] text-center bg-white border border-blue-100 px-2 py-1.5 rounded-sm w-full shadow-sm">
                           {w.liczbaRat === 1 ? 'Płatność jednorazowa' : `W ${w.liczbaRat} ratach po ok. ${calculateInstallment(w.skladka, w.liczbaRat)} PLN`}
                         </div>
                      </div>

                    </div>
                  )})}
                </div>
              </div>
            )}

            {/* STOPKA DOKUMENTU */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end break-inside-avoid">
              <div className="text-[7px] text-slate-500 max-w-[65%] leading-relaxed">
                <p className="font-black text-slate-800 uppercase tracking-widest mb-1 text-[7px]">Informacja prawna</p>
                <p>Niniejsza propozycja ma charakter informacyjny i może ulec zmianie w przypadku zmiany parametrów pojazdu lub ostatecznej weryfikacji historii ubezpieczenia w systemie UFG. Niniejszy dokument nie stanowi oferty handlowej w rozumieniu art. 66§1 Kodeksu Cywilnego.</p>
              </div>
              <div className="text-right pl-4">
                <p className="text-[6px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Twój doradca</p>
                <p className="font-black text-[#0067b1] text-[12px] uppercase tracking-wide">Jakub Cendrowski</p>
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">PALLADA Ubezpieczenia</p>
              </div>
            </div>
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

  // Ustawienie tytułu karty przeglądarki na "Egida"
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
    
    // Ujednolicony wygląd bazowy z modułu Ofert
    let base = "w-full px-5 py-4 rounded-2xl border-2 outline-none transition-all text-sm font-black shadow-sm placeholder:text-slate-400 placeholder:font-normal";
    
    // Szary tekst dla pustych select/date (placeholder), czarny z modelu ofert dla wypełnionych
    if ((type === 'select' || type === 'date') && isEmpty) {
        base += " text-slate-400";
    } else {
        base += " text-slate-800";
    }
    
    // Wymuszony szary kolor w standardzie (bg-slate-50), białe na focus + niebieska ramka (jak w Ofertach)
    const status = isError 
        ? "border-red-400 bg-red-50 ring-2 ring-red-100" 
        : "border-slate-100 bg-slate-50 focus:bg-white focus:border-[#0067b1]";
        
    return `${base} ${status}`;
  };

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

        if (!window.jspdf) {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }
        const { jsPDF } = window.jspdf;
        const docPdf = new jsPDF();

        const loadFont = async (url, filename, fontName, fontStyle) => {
            try {
                const response = await fetch(url);
                const buffer = await response.arrayBuffer();
                let binary = '';
                const bytes = new Uint8Array(buffer);
                for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
                docPdf.addFileToVFS(filename, window.btoa(binary));
                docPdf.addFont(filename, fontName, fontStyle);
            } catch (e) { console.error(e); }
        };

        await loadFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf', 'Kiro-Regular.ttf', 'Kiro', 'normal');
        await loadFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf', 'Semplicita-Bold.ttf', 'Semplicita', 'bold');
        await loadFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf', 'Kiro-Bold.ttf', 'Kiro', 'bold');

        const palladaBlue = [0, 103, 177]; 
        const slate500 = [100, 116, 139]; 
        const slate400 = [148, 163, 184]; 
        const getFont = (preferred) => docPdf.getFontList()[preferred] ? preferred : "helvetica";

        await new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                const ratio = img.width / img.height;
                docPdf.addImage(img, 'PNG', 20, 15, 28 * ratio, 28, undefined, 'FAST');
                resolve();
            };
            img.onerror = () => {
                docPdf.setFont(getFont("Semplicita"), "bold");
                docPdf.setFontSize(24);
                docPdf.setTextColor(...palladaBlue);
                docPdf.text("PALLADA", 20, 28);
                resolve();
            };
            img.src = './pallada_trans_logo.png';
        });

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
              {/* Usunięto personalizowane powitanie zgodnie z prośbą */}
              <h1 className="text-4xl font-black text-slate-900" style={styles.header}>
                Pulpit Agenta
              </h1>
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
                          <button onClick={handleSearch} className="bg-white text-[#0067b1] px-10 py-5 rounded-2xl font-black hover:bg-blue-50 transition-all uppercase tracking-widest text-sm shadow-xl">
                              Szukaj
                          </button>
                      </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
                        <h2 className="font-black text-[#0067b1] uppercase text-xs tracking-[0.2em] flex items-center gap-2" style={styles.header}>
                          <Users size={16} /> Dane Wypowiadającego
                        </h2>
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
                        <h2 className="font-black text-[#0067b1] uppercase text-xs tracking-[0.2em] flex items-center gap-2" style={styles.header}>
                          <Shield size={16} /> Pojazd i Polisa
                        </h2>
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
                        <h2 className="font-black text-[#0067b1] uppercase text-xs tracking-[0.2em] flex items-center gap-2" style={styles.header}>
                          <MapPin size={16} /> Miejsce i data wystawienia
                        </h2>
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
        <button onClick={() => setActiveTab('dashboard')} className="mt-8 px-8 py-3 bg-[#0067b1] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-blue-700 transition-all">
          Powrót
        </button>
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
                <p className="text-xs font-black text-slate-800 truncate">Bartek Żochowski</p>
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
