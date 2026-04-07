import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { 
    Shield, LayoutDashboard, Database, FileText, RotateCw, Tags, GitCompare, BarChart3, LogOut, 
    ChevronRight, Search, CheckSquare, Square, Download, RotateCcw, AlertCircle, Loader2 
} from 'lucide-react';

const firebaseConfig = {
    apiKey: "AIzaSyD8ioxiSNO3mI_ppLRezGdj-b5hCB7-hwg",
    authDomain: "egida-os.firebaseapp.com",
    projectId: "egida-os",
    storageBucket: "egida-os.firebasestorage.app",
    messagingSenderId: "263654193064",
    appId: "1:263654193064:web:70adeef7eefbd944364f9d"
};

let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}
const auth = getAuth(app);
const db = getFirestore(app);

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

const initialFormData = {
    imieNazwisko: '', ulica: '', kodPocztowy: '', miejscowosc: '',
    ubezpieczyciel: '', numerPolisy: '', dataRozwiazania: '', dataPodpisania: '',
    miejscowoscWystawienia: '', marka: '', model: '', nrRejestracyjny: '', art: '28'
};

const formatTitleCase = (text) => text ? text.toLowerCase().replace(/(?:^|\s|-)\p{L}/gu, (match) => match.toUpperCase()) : '';
const formatToPLDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr;
};

const LoginScreen = ({ onLogin, error }) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onLogin(email.trim(), pass);
        setLoading(false);
    };

    return (
        <div className="h-screen flex items-center justify-center p-4 fade-in">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-50 space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-[#0067b1] rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase">Egida OS</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Panel Agenta Pallada</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Hasło" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" value={pass} onChange={e => setPass(e.target.value)} required />
                    {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase break-words">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all">
                        {loading ? "Łączenie..." : "Zaloguj do Egidy"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default function App() {
    const [user, setUser] = useState(null);
    const [init, setInit] = useState(false);
    const [module, setModule] = useState('dashboard');
    const [records, setRecords] = useState([]);
    const [loginError, setLoginError] = useState('');
    
    const [formData, setFormData] = useState(initialFormData);
    const [searchPlate, setSearchPlate] = useState('');
    const [errors, setErrors] = useState([]);
    const [actionStatus, setActionStatus] = useState(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, u => {
            setUser(u);
            setInit(true);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = onSnapshot(collection(db, "pojazdy"), snap => {
            const data = [];
            snap.forEach(d => data.push({ id: d.id, ...d.data() }));
            setRecords(data);
        });
        return () => unsubscribe();
    }, [user]);

    const handleLogin = async (e, p) => {
        setLoginError('');
        try {
            await signInWithEmailAndPassword(auth, e, p);
        } catch (err) {
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setLoginError('Nieprawidłowy adres e-mail lub hasło.');
            } else if (err.code === 'auth/invalid-email') {
                setLoginError('Niepoprawny format adresu e-mail.');
            } else {
                setLoginError(`BŁĄD: ${err.code}`);
            }
        }
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
        
        let base = "w-full p-3 rounded-xl border outline-none transition-all placeholder:text-slate-400 placeholder:text-sm placeholder:font-normal";
        
        if ((type === 'select' || type === 'date') && isEmpty) {
            base += " text-slate-400 text-sm font-normal";
        } else {
            base += " text-black font-medium";
        }

        const status = isError 
            ? "border-red-500 bg-red-50 ring-2 ring-red-100 shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
            : "border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100";
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
            setErrors([]);

            const docId = formData.nrRejestracyjny.replace(/\s/g, '').toUpperCase();
            await setDoc(doc(db, "pojazdy", docId), {
                ...formData, updatedAt: new Date().toISOString()
            });

            if (!window.jspdf) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
                    script.onload = resolve;
                    script.onerror = reject;
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
                    const imgUrl = new Image();
                    imgUrl.crossOrigin = "Anonymous";
                    imgUrl.onload = () => {
                        const ratio = imgUrl.width / imgUrl.height;
                        docPdf.addImage(imgUrl, 'PNG', 20, 15, 28 * ratio, 28, undefined, 'FAST');
                        resolve();
                    };
                    imgUrl.onerror = () => {
                        docPdf.setFont(getFont("Semplicita"), "bold");
                        docPdf.setFontSize(24);
                        docPdf.setTextColor(...palladaBlue);
                        docPdf.text("PALLADA", 20, 28);
                        docPdf.setFontSize(10);
                        docPdf.setFont(getFont("Kiro"), "normal");
                        docPdf.text("TRANS", 20, 34);
                        resolve();
                    };
                    imgUrl.src = '/pallada_trans_logo.png';
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
            const lineFactor = 1.2;
            
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
            const remaining = docPdf.splitTextToSize(t1 + t2 + t3, 170).slice(1);
            let curY = 110 + (6.5 * lineFactor);
            remaining.forEach(line => {
                docPdf.text(line, 20, curY);
                curY += (6.5 * lineFactor);
            });
            
            const blockY = 110 + ((remaining.length + 1) * (6.5 * lineFactor)) + 10; 

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

            const cbStartY = blockY + 22; 
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

    if (!init) return null;
    if (!user) return <LoginScreen onLogin={handleLogin} error={loginError} />;

    return (
        <div className="flex h-screen overflow-hidden text-left bg-[#f8fafc] fade-in">
            <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-6 shrink-0 overflow-y-auto hide-scrollbar">
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="p-2 bg-[#0067b1] rounded-xl text-white shadow-lg"><Shield /></div>
                    <span className="font-black text-xl tracking-tighter" style={{color:'#0067b1'}}>EGIDA</span>
                </div>
                <nav className="flex-1 space-y-2">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] px-3 mb-2">Główne</p>
                    <button onClick={() => setModule('dashboard')} className={`w-full flex items-center gap-3 p-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${module === 'dashboard' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}><LayoutDashboard size={16}/> Panel</button>
                    <button onClick={() => setModule('baza')} className={`w-full flex items-center gap-3 p-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${module === 'baza' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}><Database size={16}/> Baza Klientów</button>
                    <button onClick={() => setModule('wypowiedzenia')} className={`w-full flex items-center gap-3 p-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${module === 'wypowiedzenia' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}><FileText size={16}/> Wypowiedzenia</button>
                    
                    <div className="pt-6 pb-2 px-3">
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Wkrótce</p>
                    </div>
                    <button className="w-full flex items-center gap-3 p-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-300 opacity-60 cursor-not-allowed transition-all"><RotateCw size={16}/> Wznowienia</button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-300 opacity-60 cursor-not-allowed transition-all"><Tags size={16}/> Oferty</button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-300 opacity-60 cursor-not-allowed transition-all"><GitCompare size={16}/> Porównania</button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-300 opacity-60 cursor-not-allowed transition-all"><BarChart3 size={16}/> Statystyki</button>
                </nav>
                <div className="pt-4 mt-auto">
                    <button onClick={() => signOut(auth)} className="w-full flex items-center gap-3 p-3 text-red-500 font-black text-[10px] uppercase hover:bg-red-50 rounded-2xl transition-all"><LogOut size={16}/> Wyloguj</button>
                </div>
            </aside>

            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {module === 'dashboard' && (
                    <div className="space-y-8 max-w-4xl">
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Panel Agenta</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Baza danych</p>
                                <p className="text-5xl font-black text-slate-800">{records.length}</p>
                            </div>
                            <button onClick={() => setModule('wypowiedzenia')} className="bg-[#0067b1] text-white p-8 rounded-[2.5rem] flex items-center justify-between font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">
                                Wypowiedzenia <ChevronRight />
                            </button>
                        </div>
                    </div>
                )}
                
                {module === 'baza' && (
                    <div className="flex flex-col items-center justify-center h-[70vh] text-center fade-in">
                        <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                            <Database size={40} className="text-slate-300" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800 mb-3">Baza Klientów</h2>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest max-w-sm leading-relaxed">
                            Moduł jest w trakcie wdrażania. Wkrótce zyskasz tutaj pełny dostęp do historii i zarządzania swoimi klientami.
                        </p>
                    </div>
                )}

                {module === 'wypowiedzenia' && (
                    <div className="max-w-4xl mx-auto space-y-6 pb-20 fade-in">
                        <header className="bg-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200"><FileText className="text-white" /></div>
                                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Generator wypowiedzeń OC</h1>
                            </div>
                            <button onClick={() => setShowResetConfirm(true)} className="w-full sm:w-auto px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all">Wyczyść formularz</button>
                        </header>

                        <div className="space-y-6">
                            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Szukaj po numerze rejestracyjnym</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input type="text" className="flex-1 p-4 rounded-xl border border-slate-200 uppercase font-bold text-lg outline-none focus:ring-4 focus:ring-blue-100 transition-all text-black placeholder:normal-case placeholder:text-slate-400 placeholder:text-sm placeholder:font-normal" placeholder="Nr rej" value={searchPlate} onChange={(e) => setSearchPlate(e.target.value.toUpperCase())} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
                                    <button onClick={handleSearch} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                                        <Search size={18} /> SZUKAJ
                                    </button>
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                                    <h2 className="font-bold text-blue-600 uppercase text-xs tracking-widest border-b pb-2 mb-4">Dane Wypowiadającego</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Imię i Nazwisko / Firma</label>
                                            <input placeholder="Jan Kowalski" className={getInputClass('imieNazwisko')} value={formData.imieNazwisko} onChange={(e) => setFormData({...formData, imieNazwisko: formatTitleCase(e.target.value)})} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ulica i numer</label>
                                            <input placeholder="Polna 12/3" className={getInputClass('ulica')} value={formData.ulica} onChange={(e) => setFormData({...formData, ulica: formatTitleCase(e.target.value)})} />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="w-full sm:w-32">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kod</label>
                                                <input placeholder="00-000" className={getInputClass('kodPocztowy')} value={formData.kodPocztowy} onChange={(e) => {
                                                    let val = e.target.value.replace(/\D/g, ''); 
                                                    if (val.length > 2) val = val.substring(0, 2) + '-' + val.substring(2, 5);
                                                    setFormData({...formData, kodPocztowy: val});
                                                }} maxLength={6} />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Miejscowość</label>
                                                <input placeholder="Szczecin" className={getInputClass('miejscowosc')} value={formData.miejscowosc} onChange={(e) => setFormData({...formData, miejscowosc: formatTitleCase(e.target.value)})} />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                                    <h2 className="font-bold text-blue-600 uppercase text-xs tracking-widest border-b pb-2 mb-4">Pojazd i Polisa</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nr rejestracyjny</label>
                                            <input placeholder="Nr rej" className={getInputClass('nrRejestracyjny')} value={formData.nrRejestracyjny} onChange={(e) => setFormData({...formData, nrRejestracyjny: e.target.value.toUpperCase()})} />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1"><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Marka</label><input placeholder="Toyota" className={getInputClass('marka')} value={formData.marka} onChange={(e) => setFormData({...formData, marka: formatTitleCase(e.target.value)})} /></div>
                                            <div className="flex-1"><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Model</label><input placeholder="Corolla" className={getInputClass('model')} value={formData.model} onChange={(e) => setFormData({...formData, model: formatTitleCase(e.target.value)})} /></div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ubezpieczyciel</label>
                                            <select className={getInputClass('ubezpieczyciel', 'select')} value={formData.ubezpieczyciel} onChange={(e) => setFormData({...formData, ubezpieczyciel: e.target.value})}>
                                                <option value="">Wybierz ubezpieczyciela</option>
                                                {TOWARZYSTWA.map(t => <option key={t} value={t} className="text-black font-medium">{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1"><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nr polisy</label><input placeholder="Numer polisy" className={getInputClass('numerPolisy')} value={formData.numerPolisy} onChange={(e) => setFormData({...formData, numerPolisy: e.target.value})} /></div>
                                            <div className="flex-1"><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data rozwiązania</label><input type="date" className={getInputClass('dataRozwiazania', 'date')} value={formData.dataRozwiazania} onChange={(e) => setFormData({...formData, dataRozwiazania: e.target.value})} /></div>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 md:col-span-2 space-y-4">
                                    <h2 className="font-bold text-blue-600 uppercase text-xs tracking-widest border-b pb-2 mb-4">Miejscowość i Data Podpisania</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data podpisania</label><input type="date" className={getInputClass('dataPodpisania', 'date')} value={formData.dataPodpisania} onChange={(e) => setFormData({...formData, dataPodpisania: e.target.value})} /></div>
                                        <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Miejscowość podpisania</label><input placeholder="Szczecin" className={getInputClass('miejscowoscWystawienia')} value={formData.miejscowoscWystawienia} onChange={(e) => setFormData({...formData, miejscowoscWystawienia: formatTitleCase(e.target.value)})} /></div>
                                    </div>
                                </section>

                                <section className="md:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-3">
                                    {['28', '28a', '31'].map(a => (
                                        <button key={a} onClick={() => setFormData({...formData, art: a})} className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${formData.art === a ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                                            <div className="flex items-center justify-center shrink-0">
                                                {formData.art === a ? <CheckSquare className="text-blue-600" size={20} /> : <Square className="text-slate-200" size={20} />}
                                            </div>
                                            <div className="text-left leading-tight">
                                                <span className={`block font-bold text-sm ${formData.art === a ? 'text-slate-900' : 'text-slate-800'}`}>{a === '28' ? 'Wypowiedzenie standardowe' : a === '28a' ? 'Wypowiedzenie po wznowieniu' : 'Wypowiedzenie nabywcy'}</span>
                                                <span className="block font-bold text-[8px] uppercase text-slate-400 mt-0.5">ART. {a.toUpperCase()} USTAWY</span>
                                            </div>
                                        </button>
                                    ))}
                                </section>
                            </div>

                            <button onClick={handleGenerateAndSave} className="w-full p-5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-[0.98] transition-all">
                                {actionStatus === 'saving' ? <Loader2 className="animate-spin" /> : <Download />}
                                {actionStatus === 'saving' ? "GENEROWANIE DOKUMENTU..." : "GENERUJ I POBIERZ PDF"}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {showResetConfirm && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 text-center shadow-2xl animate-in zoom-in-95">
                        <div className="mx-auto text-red-500 h-16 w-16 bg-red-50 p-4 rounded-full flex items-center justify-center">
                            <RotateCcw size={32} />
                        </div>
                        <h3 className="font-bold text-slate-800">Wyczyścić formularz?</h3>
                        <p className="text-sm text-slate-500">Wszystkie wpisane dane zostaną usunięte.</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button onClick={() => setShowResetConfirm(false)} className="w-full p-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all">Anuluj</button>
                            <button onClick={handleReset} className="w-full p-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-100">Tak, wyczyść</button>
                        </div>
                    </div>
                </div>
            )}

            {actionStatus === 'validation_error' && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-8 z-50 w-[90%] max-w-md">
                    <AlertCircle className="shrink-0 text-white" /> 
                    <span className="font-bold text-sm">Uzupełnij wymagane pola!</span>
                </div>
            )}
        </div>
    );
}
