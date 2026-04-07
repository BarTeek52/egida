import React, { useState, useEffect } from 'react';
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
  onSnapshot, 
  query 
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
  ArrowUpRight
} from 'lucide-react';

// --- KONFIGURACJA I INICJALIZACJA FIREBASE ---
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

// --- STAŁE I STYLE ---
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

// Oficjalne czcionki Pallada
const styles = {
  header: { fontFamily: "'Semplicita Pro', sans-serif" },
  body: { fontFamily: "'Kiro', sans-serif" }
};

// --- FUNKCJE FORMATUJĄCE ---
const formatPlate = (val) => val.toUpperCase().replace(/[^A-Z0-9 ]/g, '');
const formatTitleCase = (text) => text ? text.toLowerCase().replace(/(?:^|\s|-)\p{L}/gu, (match) => match.toUpperCase()) : '';
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

  const modules = [
    { id: 'dashboard', label: 'Pulpit', icon: LayoutDashboard, color: 'text-slate-600', bg: 'bg-slate-50', desc: 'Przegląd systemu' },
    { id: 'wznowienia', label: 'Wznowienia', icon: RefreshCcw, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Kontynuacje polis' },
    { id: 'wypowiedzenia', label: 'Wypowiedzenia', icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50', desc: 'Generator dokumentów' },
    { id: 'oferty', label: 'Oferty', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Nowe propozycje' },
    { id: 'porownania', label: 'Porównania', icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-50', desc: 'Zakresów ubezpieczenia' },
    { id: 'statystyki', label: 'Statystyki', icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Analiza wyników' },
    { id: 'baza', label: 'Baza Danych', icon: Database, color: 'text-cyan-500', bg: 'bg-cyan-50', desc: 'Zasoby klientów' },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setInit(true);
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
    // Zaktualizowany kolor placeholderów (slate-300) dla kontrastu z etykietami
    let base = "w-full p-4 rounded-2xl border outline-none transition-all placeholder:text-slate-300 placeholder:font-normal font-medium";
    
    if ((type === 'select' || type === 'date') && isEmpty) {
        base += " text-slate-300";
    } else {
        base += " text-slate-900";
    }
    const status = isError 
        ? "border-red-400 bg-red-50 ring-2 ring-red-100" 
        : "border-slate-100 bg-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50";
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

        const { 
            numerPolisy, 
            dataRozwiazania, 
            dataPodpisania, 
            miejscowoscWystawienia, 
            art, 
            ...dataToSave 
        } = formData;
        
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pojazdy', docId), {
            ...dataToSave, 
            updatedAt: new Date().toISOString(), 
            teamId: 'pallada_main'
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
            img.src = '/pallada_trans_logo.png';
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
              <h1 className="text-4xl font-black text-slate-900" style={styles.header}>Dzień dobry, Bartek</h1>
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
                    {/* DANE WYPOWIADAJĄCEGO */}
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

                    {/* POJAZD I POLISA */}
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

                    {/* MIEJSCE I DATA WYSTAWIENIA */}
                    <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 md:col-span-2 space-y-6">
                        <h2 className="font-black text-[#0067b1] uppercase text-xs tracking-[0.2em] flex items-center gap-2" style={styles.header}>
                          <Plus size={16} /> Miejsce i data wystawienia
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
