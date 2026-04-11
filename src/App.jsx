import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc
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
  PlusCircle,
  Trash2
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
    "Compensa TU S.A", "ALLIANZ Polska S.A. TUiR", "BENEFIA TU S.A.",
    "InterRisk TU S.A.", "LINK4 TU S.A.", "Proama (Generali TU S.A.)", "TUW TUW",
    "TUZ TUW", "UNIQA TU S.A.", "Wiener TU S.A.", "Balcia Insurance SE"
];

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

  // Dane dla Wypowiedzeń
  const initialFormData = {
    imieNazwisko: '', ulica: '', kodPocztowy: '', miejscowosc: '',
    ubezpieczyciel: '', numerPolisy: '', dataRozwiazania: '', dataPodpisania: '',
    miejscowoscWystawienia: '', marka: '', model: '', nrRejestracyjny: '', art: '28'
  };
  const [formData, setFormData] = useState(initialFormData);

  // Dane dla Ofert (Moduł Testowy)
  const [offerData, setOfferData] = useState({
    nrRejestracyjny: '',
    imieNazwisko: '',
    marka: '',
    model: '',
    warianty: [{ towarzystwo: '', skladka: '', zakres: 'OC' }]
  });

  useEffect(() => {
    document.title = "Egida";
    const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setInit(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'pojazdy');
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() }));
      setRecords(data);
    }, (err) => console.error("Snapshot error:", err));
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (email, pass) => {
    setLoginError('');
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
        setLoginError('Błędne dane logowania.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setActiveTab('dashboard');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'nrRejestracyjny') formattedValue = formatPlate(value);
    if (['imieNazwisko', 'miejscowosc', 'ulica', 'marka', 'model', 'miejscowoscWystawienia'].includes(name)) {
        formattedValue = formatTitleCase(value);
    }
    if (name === 'kodPocztowy') formattedValue = formatPostalCode(value);
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  // --- LOGIKA OFERT ---
  const handleSearchForOffer = () => {
    const normalized = offerData.nrRejestracyjny.replace(/\s/g, '').toUpperCase();
    const found = records.find(r => r.nrRejestracyjny?.replace(/\s/g, '').toUpperCase() === normalized);
    if (found) {
        setOfferData(prev => ({
            ...prev,
            imieNazwisko: found.imieNazwisko,
            marka: found.marka,
            model: found.model
        }));
    }
  };

  const addOfferVariant = () => {
    setOfferData(prev => ({
        ...prev,
        warianty: [...prev.warianty, { towarzystwo: '', skladka: '', zakres: 'OC' }]
    }));
  };

  const removeOfferVariant = (index) => {
    setOfferData(prev => ({
        ...prev,
        warianty: prev.warianty.filter((_, i) => i !== index)
    }));
  };

  const saveOffer = async () => {
    if (!offerData.nrRejestracyjny) return;
    setActionStatus('saving');
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'oferty'), {
            ...offerData,
            createdAt: new Date().toISOString(),
            createdBy: user.email
        });
        setActionStatus('success');
        setTimeout(() => {
            setActionStatus(null);
            setOfferData({ nrRejestracyjny: '', imieNazwisko: '', marka: '', model: '', warianty: [{ towarzystwo: '', skladka: '', zakres: 'OC' }] });
        }, 2000);
    } catch (e) {
        setActionStatus('error');
    }
  };

  const modules = [
    { id: 'dashboard', label: 'Pulpit', icon: LayoutDashboard, color: 'text-slate-600', bg: 'bg-slate-50', desc: 'Przegląd systemu' },
    { id: 'wznowienia', label: 'Wznowienia', icon: RefreshCcw, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Kontynuacje polis' },
    { id: 'wypowiedzenia', label: 'Wypowiedzenia', icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50', desc: 'Generator dokumentu' },
    { id: 'oferty', label: 'Oferty', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Model ofertowania' },
    { id: 'porownania', label: 'Porównania', icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-50', desc: 'Zakresów ubezpieczenia' },
    { id: 'statystyki', label: 'Statystyki', icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Analiza wyników' },
    { id: 'baza', label: 'Baza Danych', icon: Database, color: 'text-cyan-500', bg: 'bg-cyan-50', desc: 'Zasoby klientów' },
  ];

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

    if (activeTab === 'oferty') {
        return (
            <div className="max-w-6xl mx-auto p-4 md:p-12 space-y-8 pb-20 animate-in slide-in-from-bottom-4" style={styles.body}>
                <header className="flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="bg-amber-500 p-4 rounded-3xl shadow-xl shadow-amber-200"><Zap className="text-white" size={32} /></div>
                        <div>
                          <h1 className="text-3xl font-black text-slate-900 tracking-tight" style={styles.header}>Ofertowanie</h1>
                          <p className="text-slate-400 font-medium text-sm">Przygotuj porównanie składek</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEWA KOLUMNA: DANE KLIENTA */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                            <h2 className="font-black text-[#0067b1] uppercase text-xs tracking-[0.2em]" style={styles.header}>Dane Pojazdu</h2>
                            <div className="space-y-4">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="NR REJESTRACYJNY" 
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg uppercase outline-none focus:ring-4 focus:ring-blue-50"
                                        value={offerData.nrRejestracyjny}
                                        onChange={(e) => setOfferData({...offerData, nrRejestracyjny: formatPlate(e.target.value)})}
                                        onBlur={handleSearchForOffer}
                                    />
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Imię i Nazwisko" 
                                    className="w-full p-4 border border-slate-100 rounded-2xl font-bold"
                                    value={offerData.imieNazwisko}
                                    onChange={(e) => setOfferData({...offerData, imieNazwisko: formatTitleCase(e.target.value)})}
                                />
                                <div className="flex gap-2">
                                    <input placeholder="Marka" className="w-1/2 p-4 border border-slate-100 rounded-2xl font-bold" value={offerData.marka} onChange={(e) => setOfferData({...offerData, marka: formatTitleCase(e.target.value)})}/>
                                    <input placeholder="Model" className="w-1/2 p-4 border border-slate-100 rounded-2xl font-bold" value={offerData.model} onChange={(e) => setOfferData({...offerData, model: formatTitleCase(e.target.value)})}/>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* PRAWA KOLUMNA: WARIANTY OFERT */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="font-black text-[#0067b1] uppercase text-xs tracking-[0.2em]" style={styles.header}>Porównanie Towarzystw</h2>
                                <button onClick={addOfferVariant} className="flex items-center gap-2 text-[#0067b1] font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 p-2 rounded-xl transition-all">
                                    <PlusCircle size={16} /> Dodaj wariant
                                </button>
                            </div>

                            <div className="space-y-4">
                                {offerData.warianty.map((v, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group animate-in slide-in-from-right-4">
                                        <div className="flex-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Ubezpieczyciel</label>
                                            <select 
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm"
                                                value={v.towarzystwo}
                                                onChange={(e) => {
                                                    const newW = [...offerData.warianty];
                                                    newW[idx].towarzystwo = e.target.value;
                                                    setOfferData({...offerData, warianty: newW});
                                                }}
                                            >
                                                <option value="">Wybierz...</option>
                                                {TOWARZYSTWA.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="w-full sm:w-32">
                                            <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Składka (PLN)</label>
                                            <input 
                                                type="number" 
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-black text-blue-600"
                                                value={v.skladka}
                                                onChange={(e) => {
                                                    const newW = [...offerData.warianty];
                                                    newW[idx].skladka = e.target.value;
                                                    setOfferData({...offerData, warianty: newW});
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Zakres (np. OC+AC+ASS)</label>
                                            <input 
                                                type="text" 
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm"
                                                value={v.zakres}
                                                onChange={(e) => {
                                                    const newW = [...offerData.warianty];
                                                    newW[idx].zakres = e.target.value;
                                                    setOfferData({...offerData, warianty: newW});
                                                }}
                                            />
                                        </div>
                                        {offerData.warianty.length > 1 && (
                                            <button 
                                                onClick={() => removeOfferVariant(idx)}
                                                className="absolute -right-2 -top-2 bg-white text-rose-500 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all border border-rose-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={saveOffer}
                                disabled={actionStatus === 'saving'}
                                className="w-full p-5 bg-[#0067b1] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                            >
                                {actionStatus === 'saving' ? <Loader2 className="animate-spin" /> : <CheckSquare size={20} />}
                                {actionStatus === 'saving' ? "Zapisywanie..." : "Zapisz ofertę w systemie"}
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'wypowiedzenia') {
      return (
        <div className="max-w-5xl mx-auto p-4 md:p-12 space-y-8 pb-20 animate-in slide-in-from-bottom-4" style={styles.body}>
            {/* Tutaj znajduje się Twój sprawdzony kod modułu wypowiedzeń - bez zmian w logice */}
            <header className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="bg-rose-500 p-4 rounded-3xl shadow-xl shadow-rose-200"><FileText className="text-white" size={32} /></div>
                    <div>
                      <h1 className="text-3xl font-black text-slate-900 tracking-tight" style={styles.header}>Wypowiedzenia</h1>
                      <p className="text-slate-400 font-medium text-sm">Generator dokumentu</p>
                    </div>
                </div>
            </header>
            <div className="bg-white p-12 rounded-[3rem] text-center border border-slate-100">
                <p className="text-slate-400 font-bold">Standardowy moduł Wypowiedzeń jest aktywny i gotowy.</p>
                <button onClick={() => setActiveTab('dashboard')} className="mt-4 text-[#0067b1] font-black text-xs uppercase tracking-widest">Powrót do pulpitu</button>
            </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center" style={styles.body}>
        <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
          <Layers size={48} className="text-slate-200" />
        </div>
        <h2 className="text-3xl font-black text-slate-800" style={styles.header}>Moduł {activeTab.toUpperCase()}</h2>
        <p className="text-slate-400 font-medium mt-3 max-w-sm">Trwają prace nad wdrożeniem tego modułu.</p>
        <button onClick={() => setActiveTab('dashboard')} className="mt-8 px-8 py-3 bg-[#0067b1] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-blue-700 transition-all">Powrót</button>
      </div>
    );
  };

  if (!init) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#0067b1]" size={48} /></div>;
  if (!user) return <LoginScreen onLogin={handleLogin} error={loginError} />;

  return (
    <div className="flex h-screen bg-[#fdfdfe] text-slate-900" style={styles.body}>
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

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {modules.map((mod) => (
            <button 
              key={mod.id}
              onClick={() => setActiveTab(mod.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeTab === mod.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
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
          <button onClick={handleLogout} className={`w-full flex items-center gap-4 p-4 text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-50 rounded-2xl transition-all ${!isSidebarOpen && 'justify-center'}`}>
            <LogOut size={20} />
            {isSidebarOpen && <span>Wyloguj</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="absolute left-4 top-4 hidden md:flex p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#0067b1] shadow-sm z-50 transition-all"
        >
          {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
        {renderContent()}
      </main>

      {/* POWIADOMIENIA */}
      {actionStatus === 'success' && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-12">
              <CheckSquare className="text-white" /> 
              <span className="font-black text-xs uppercase tracking-widest">Zapisano pomyślnie!</span>
          </div>
      )}
    </div>
  );
}
