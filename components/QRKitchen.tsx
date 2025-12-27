import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Wifi, Contact, MessageSquare, Mail, MapPin, 
  Phone, MessageCircle, Download, Upload, Palette, Settings, Layers,
  ChevronDown, ChevronUp, Image as ImageIcon, X, Type as TextIcon, Link,
  Grid, Circle, Square, LayoutTemplate, Save,
  RefreshCw, CheckCircle2, Moon, Sun, Github, Heart,
  History, Trash2, Clock, RotateCcw, Home, QrCode, User, Copy, ScanLine, Zap, ZapOff
} from 'lucide-react';
import { TEMPLATES, QR_TYPES, DOT_OPTIONS, CORNER_SQUARE_OPTIONS, CORNER_DOT_OPTIONS, ERROR_LEVELS } from '../constants';
import type { DataValues, DesignState, HistoryItem, TemplateConfig, QRCodeStylingInstance, QRCodeStylingOptions, QROptions, QrType } from '../types';

declare const Html5Qrcode: any;

// --- Sub-Components ---
interface AccordionItemProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  darkMode: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, icon: Icon, children, defaultOpen = false, className = "", darkMode }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={`border rounded-lg overflow-hidden mb-3 shadow-sm transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${className}`}>
      <button onClick={() => setIsOpen(!isOpen)} className={`w-full flex items-center justify-between p-4 transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}>
        <div className="flex items-center space-x-2 font-medium">
          <Icon size={18} /> <span>{title}</span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  darkMode: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, type="text", placeholder="", darkMode }) => (
  <div>
    <label className={`block text-xs font-semibold uppercase tracking-wide mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder}
      className={`w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
    />
  </div>
);

type ActiveView = 'home' | 'scan' | 'settings' | 'history';

interface BottomNavBarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  historyCount: number;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView, historyCount }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'scan', label: 'Scan QR', icon: QrCode },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] z-40">
      <div className="max-w-md mx-auto h-full grid grid-cols-4 items-center px-4">
        {navItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveView(item.id as ActiveView)}
            className={`flex flex-col items-center justify-center space-y-1 transition-all relative ${activeView === item.id ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500'}`}
          >
            {item.id === 'history' && historyCount > 0 && <span className="absolute top-0 right-3 w-2 h-2 bg-red-500 rounded-full"></span>}
            <item.icon size={22} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};


const QRKitchen: React.FC = () => {
  const [activeType, setActiveType] = useState('url');
  const [libLoaded, setLibLoaded] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStylingInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<any>(null);
  
  const [notification, setNotification] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);

  const [dataValues, setDataValues] = useState<DataValues>({
    url: 'https://google.com',
    text: 'Hello World',
    wifi: { ssid: '', password: '', encryption: 'WPA' },
    vcard: { firstName: '', lastName: '', phone: '', email: '', org: '', title: '' },
    email: { address: '', subject: '', body: '' },
    sms: { phone: '', message: '' },
    whatsapp: { phone: '', message: '' },
    phone: '',
    location: { lat: '', long: '' },
  });

  const [design, setDesign] = useState<DesignState>({
    width: 1000,
    height: 1000,
    margin: 20,
    image: null, 
    dotsOptions: { type: 'square', color: '#000000' },
    backgroundOptions: { color: '#ffffff' },
    cornersSquareOptions: { type: 'square', color: '#000000' },
    cornersDotOptions: { type: 'square', color: '#000000' },
    qrOptions: { errorCorrectionLevel: 'H' }
  });

  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradientColor1, setGradientColor1] = useState('#4F46E5');
  const [gradientColor2, setGradientColor2] = useState('#EC4899');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [customEyeColor, setCustomEyeColor] = useState(false);
  
  const scannerElementId = "qr-scanner-viewfinder";

  const toggleFlash = async () => {
    if (scannerRef.current) {
      try {
        const track = scannerRef.current.getRunningTrack();
        const newFlashState = !isFlashOn;
        await track.applyConstraints({
          advanced: [{ torch: newFlashState }],
        });
        setIsFlashOn(newFlashState);
      } catch (err) {
        console.error("Failed to toggle flash", err);
        showNotification("Flash not supported on this device.");
      }
    }
  };

  useEffect(() => {
    if (activeView === 'scan' && !scannerRef.current) {
        const scanner = new Html5Qrcode(scannerElementId);
        scannerRef.current = scanner;
        
        const startScanner = async () => {
            try {
                await scanner.start(
                    { facingMode: "environment" },
                    { fps: 20, qrbox: { width: 250, height: 250 } },
                    (decodedText: string) => {
                        setScannedData(decodedText);
                        scanner.stop();
                    },
                    (errorMessage: string) => { /* ignore errors */ }
                );
                const capabilities = scanner.getRunningTrackCapabilities();
                if (capabilities.torch) {
                    setHasFlash(true);
                }
            } catch (err) {
                console.error("Failed to start scanner", err);
                showNotification("Could not start camera.");
                setActiveView('home');
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch((err: any) => console.error("Failed to stop scanner", err));
            }
            scannerRef.current = null;
            setIsFlashOn(false);
            setHasFlash(false);
        };
    }
  }, [activeView]);

  useEffect(() => {
    if (window.QRCodeStyling) {
      setLibLoaded(true);
    }
  }, []);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('qrHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const getQRData = useMemo(() => {
    switch (activeType) {
      case 'url': return dataValues.url;
      case 'text': return dataValues.text;
      case 'wifi': return `WIFI:T:${dataValues.wifi.encryption};S:${dataValues.wifi.ssid};P:${dataValues.wifi.password};;`;
      case 'vcard': 
        const v = dataValues.vcard;
        return `BEGIN:VCARD\nVERSION:3.0\nN:${v.lastName};${v.firstName}\nFN:${v.firstName} ${v.lastName}\nORG:${v.org}\nTITLE:${v.title}\nTEL:${v.phone}\nEMAIL:${v.email}\nEND:VCARD`;
      case 'email': return `mailto:${dataValues.email.address}?subject=${encodeURIComponent(dataValues.email.subject)}&body=${encodeURIComponent(dataValues.email.body)}`;
      case 'sms': return `smsto:${dataValues.sms.phone}:${dataValues.sms.message}`;
      case 'whatsapp': return `https://wa.me/${dataValues.whatsapp.phone}?text=${encodeURIComponent(dataValues.whatsapp.message)}`;
      case 'phone': return `tel:${dataValues.phone}`;
      case 'location': return `http://maps.google.com/maps?q=${dataValues.location.lat},${dataValues.location.long}`;
      default: return '';
    }
  }, [activeType, dataValues]);

  useEffect(() => {
    if (activeView !== 'home' || !libLoaded || !window.QRCodeStyling || !qrRef.current) return;
  
    const currentBodyColor = gradientEnabled ? gradientColor1 : design.dotsOptions.color;
    const finalCornerSquareColor = customEyeColor ? design.cornersSquareOptions.color : currentBodyColor;
    const finalCornerDotColor = customEyeColor ? design.cornersDotOptions.color : currentBodyColor;
  
    const options: QRCodeStylingOptions = {
      width: 300,
      height: 300,
      type: 'canvas',
      data: getQRData,
      image: design.image || undefined,
      margin: design.margin,
      qrOptions: design.qrOptions,
      imageOptions: { crossOrigin: "anonymous", margin: 8, imageSize: 0.4 },
      dotsOptions: {
        type: design.dotsOptions.type,
        color: gradientEnabled ? undefined : design.dotsOptions.color,
        gradient: gradientEnabled ? {
          type: gradientType,
          rotation: 0,
          colorStops: [{ offset: 0, color: gradientColor1 }, { offset: 1, color: gradientColor2 }]
        } : undefined
      },
      backgroundOptions: design.backgroundOptions,
      cornersSquareOptions: { type: design.cornersSquareOptions.type, color: finalCornerSquareColor },
      cornersDotOptions: { type: design.cornersDotOptions.type, color: finalCornerDotColor },
    };
  
    try {
      if (!qrCodeInstance.current) {
        qrCodeInstance.current = new window.QRCodeStyling(options);
        qrRef.current.innerHTML = ''; // Clear previous content
        qrCodeInstance.current.append(qrRef.current);
      } else {
        qrCodeInstance.current.update(options);
      }
    } catch (error) {
        console.error("QR Code generation failed:", error);
        showNotification("Failed to generate QR Code. Check content.");
    }
  }, [libLoaded, getQRData, design, gradientEnabled, gradientType, gradientColor1, gradientColor2, customEyeColor, activeView]);

  const getSummaryText = () => {
    switch(activeType) {
      case 'url': return dataValues.url;
      case 'text': return dataValues.text.substring(0, 20) + (dataValues.text.length > 20 ? '...' : '');
      case 'wifi': return `WiFi: ${dataValues.wifi.ssid}`;
      case 'whatsapp': return `WA: ${dataValues.whatsapp.phone}`;
      default: return activeType.toUpperCase();
    }
  };

  const saveToHistory = () => {
    const newItem: HistoryItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      activeType,
      dataValues: JSON.parse(JSON.stringify(dataValues)),
      design: JSON.parse(JSON.stringify(design)),
      gradient: { enabled: gradientEnabled, type: gradientType, c1: gradientColor1, c2: gradientColor2 },
      customEyeColor,
      summary: getSummaryText()
    };
    
    const updatedHistory = [newItem, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem('qrHistory', JSON.stringify(updatedHistory));
    showNotification("Saved to History");
  };

  const loadFromHistory = (item: HistoryItem) => {
    setActiveType(item.activeType);
    setDataValues(item.dataValues);
    setDesign(item.design);
    setGradientEnabled(item.gradient.enabled);
    setGradientType(item.gradient.type as 'linear' | 'radial');
    setGradientColor1(item.gradient.c1);
    setGradientColor2(item.gradient.c2);
    setCustomEyeColor(item.customEyeColor);
    setLogoPreview(item.design.image || null);
    setActiveView('home');
    showNotification("Restored from History");
  };

  const deleteHistoryItem = (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('qrHistory', JSON.stringify(updated));
  };
  
  const clearHistory = () => {
    if(window.confirm("Are you sure you want to clear all history? This action cannot be undone.")) {
      setHistory([]);
      localStorage.removeItem('qrHistory');
      showNotification("History Cleared");
    }
  };
  
  const handleRebuildFromScan = (data: string) => {
    let type: QrType = 'text';
    const newDataValues = { ...dataValues };

    if (data.startsWith('http://') || data.startsWith('https://')) {
        type = 'url';
        newDataValues.url = data;
    } else if (data.startsWith('WIFI:')) {
        type = 'wifi';
        const ssidMatch = data.match(/S:([^;]+);/);
        const passMatch = data.match(/P:([^;]+);/);
        const encMatch = data.match(/T:([^;]+);/);
        newDataValues.wifi = {
            ssid: ssidMatch ? ssidMatch[1] : '',
            password: passMatch ? passMatch[1] : '',
            encryption: (encMatch ? encMatch[1] : 'WPA') as 'WPA' | 'WEP' | 'nopass',
        };
    } else {
        type = 'text';
        newDataValues.text = data;
    }
    
    setActiveType(type);
    setDataValues(newDataValues);
    setScannedData(null);
    scannerRef.current = null;
    setActiveView('home');
    showNotification("QR Content Loaded!");
  };

  const handleApplyTemplate = (t: TemplateConfig) => {
    setGradientEnabled(t.gradientEnabled);
    if (t.gradientEnabled && t.g1 && t.g2) {
      setGradientType(t.gType || 'linear');
      setGradientColor1(t.g1);
      setGradientColor2(t.g2);
    } else if (t.dotsColor) {
      setDesign(prev => ({ ...prev, dotsOptions: { ...prev.dotsOptions, color: t.dotsColor } }));
    }
    
    setCustomEyeColor(t.customEye);
    if(t.customEye && t.frameColor && t.dotColor) {
        setDesign(prev => ({
             ...prev,
            cornersSquareOptions: { ...prev.cornersSquareOptions, color: t.frameColor },
            cornersDotOptions: { ...prev.cornersDotOptions, color: t.dotColor }
        }));
    }
    
    setDesign(prev => ({
      ...prev,
      backgroundOptions: { color: t.bg },
      dotsOptions: { ...prev.dotsOptions, type: t.shape, color: t.gradientEnabled ? prev.dotsOptions.color : t.dotsColor || prev.dotsOptions.color },
      cornersSquareOptions: { ...prev.cornersSquareOptions, type: t.eyeFrame },
      cornersDotOptions: { ...prev.cornersDotOptions, type: t.eyeDot }
    }));
    showNotification(`Applied template: ${"Custom"}`);
  };

  const handleSaveConfig = () => {
    const config = { version: "1.0", timestamp: new Date().toISOString(), design, gradient: { enabled: gradientEnabled, type: gradientType, c1: gradientColor1, c2: gradientColor2 }, customEyeColor, activeType, dataValues };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-kitchen-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification("Design saved to JSON!");
  };

  const handleLoadConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result as string);
        if (config.design) setDesign(config.design);
        if (config.gradient) {
          setGradientEnabled(config.gradient.enabled);
          setGradientType(config.gradient.type);
          setGradientColor1(config.gradient.c1);
          setGradientColor2(config.gradient.c2);
        }
        if (config.customEyeColor !== undefined) setCustomEyeColor(config.customEyeColor);
        if (config.activeType) setActiveType(config.activeType);
        if (config.dataValues) setDataValues(config.dataValues);
        if (config.design.image) setLogoPreview(config.design.image);
        showNotification("Design loaded successfully!");
        setActiveView('home');
      } catch (err) {
        alert("Invalid JSON configuration file.");
      }
    };
    reader.readAsText(file);
    if(e.target) e.target.value = '';
  };

  const downloadQR = (format: 'png' | 'svg') => {
    saveToHistory();
    if (qrCodeInstance.current) {
      qrCodeInstance.current.update({ width: 2000, height: 2000 });
      qrCodeInstance.current.download({ name: "qr-kitchen-code", extension: format }).then(() => {
        qrCodeInstance.current?.update({ width: 300, height: 300 });
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setDesign(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
      setLogoPreview(null);
      setDesign(prev => ({ ...prev, image: null }));
  };

  const renderHomeView = () => (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6 min-w-0">
          <div className={`rounded-xl shadow-sm p-3 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="grid grid-cols-4 sm:grid-cols-9 gap-2">
              {QR_TYPES.map(type => (
                <button key={type.id} onClick={() => setActiveType(type.id)} className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${activeType === type.id ? 'bg-indigo-600 text-white shadow-md transform scale-105' : `hover:bg-opacity-50 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-50 text-gray-500 hover:text-gray-700'}`}`}>
                  <type.icon size={20} className="mb-1.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wide">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className={`rounded-xl shadow-sm p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs mr-2">1</span>
              Content
            </h2>
            <div className="space-y-4 animate-in fade-in duration-300">
              {activeType === 'url' && <InputField darkMode={darkMode} label="Website URL" value={dataValues.url} onChange={(e) => setDataValues({...dataValues, url: e.target.value})} placeholder="https://example.com" />}
              {activeType === 'text' && (
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wide mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Plain Text</label>
                  <textarea value={dataValues.text} onChange={(e) => setDataValues({...dataValues, text: e.target.value})} rows={4} className={`w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}/>
                </div>
              )}
              {activeType === 'wifi' && (
                <div className="space-y-3">
                  <InputField darkMode={darkMode} label="SSID / Network Name" value={dataValues.wifi.ssid} onChange={(e) => setDataValues({...dataValues, wifi: {...dataValues.wifi, ssid: e.target.value}})} />
                  <InputField darkMode={darkMode} label="Password" value={dataValues.wifi.password} onChange={(e) => setDataValues({...dataValues, wifi: {...dataValues.wifi, password: e.target.value}})} />
                  <div>
                     <label className={`block text-xs font-semibold uppercase tracking-wide mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Encryption</label>
                     <select value={dataValues.wifi.encryption} onChange={(e) => setDataValues({...dataValues, wifi: {...dataValues.wifi, encryption: e.target.value as 'WPA' | 'WEP' | 'nopass'}})} className={`w-full p-2 border rounded text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                       <option value="WPA">WPA/WPA2</option>
                       <option value="WEP">WEP</option>
                       <option value="nopass">None</option>
                     </select>
                  </div>
                </div>
              )}
              {activeType === 'vcard' && (
                <div className="grid grid-cols-2 gap-3">
                  <InputField darkMode={darkMode} label="First Name" value={dataValues.vcard.firstName} onChange={e => setDataValues(p=>({...p, vcard:{...p.vcard, firstName: e.target.value}}))} />
                  <InputField darkMode={darkMode} label="Last Name" value={dataValues.vcard.lastName} onChange={e => setDataValues(p=>({...p, vcard:{...p.vcard, lastName: e.target.value}}))} />
                  <div className="col-span-2"><InputField darkMode={darkMode} label="Email" value={dataValues.vcard.email} onChange={e => setDataValues(p=>({...p, vcard:{...p.vcard, email: e.target.value}}))} /></div>
                  <InputField darkMode={darkMode} label="Phone" value={dataValues.vcard.phone} onChange={e => setDataValues(p=>({...p, vcard:{...p.vcard, phone: e.target.value}}))} />
                </div>
              )}
            </div>
          </div>
          <div>
             <h2 className="text-lg font-bold mb-4 px-1 flex items-center">
               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs mr-2">2</span>
               Design Studio
             </h2>

             <AccordionItem darkMode={darkMode} title="Template Library" icon={LayoutTemplate} defaultOpen>
                <div className="space-y-8">
                  {Object.entries(TEMPLATES).map(([category, items]) => (
                    <div key={category}>
                      <div className="flex items-center mb-3">
                        <span className={`h-px flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></span>
                        <span className={`px-3 text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{category}</span>
                        <span className={`h-px flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {items.map((t, i) => (
                          <button key={i} onClick={() => handleApplyTemplate(t.config)} className={`group relative overflow-hidden rounded-lg border transition-all text-left shadow-sm hover:shadow-md ${darkMode ? 'bg-gray-700 border-gray-600 hover:border-indigo-400' : 'bg-white border-gray-200 hover:border-indigo-500'}`}>
                            <div className="h-10 w-full bg-gray-100 relative">
                              <div className="absolute inset-0 opacity-80" style={{ background: t.config.gradientEnabled ? `${t.config.gType}-gradient(${t.config.g1}, ${t.config.g2})` : t.config.dotsColor }} />
                              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            </div>
                            <div className="p-2.5">
                              <span className={`block text-xs font-semibold truncate ${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-indigo-600'}`}>{t.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
             </AccordionItem>

            <AccordionItem darkMode={darkMode} title="Colors & Gradient" icon={Palette}>
                <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <label className={`text-sm font-semibold flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Data Pattern
                        </label>
                        <div className={`flex items-center rounded-full p-1 border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                            <button onClick={() => setGradientEnabled(false)} className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${!gradientEnabled ? (darkMode ? 'bg-gray-600 text-white' : 'bg-gray-800 text-white') : 'text-gray-500'}`}>Solid</button>
                            <button onClick={() => setGradientEnabled(true)} className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${gradientEnabled ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500'}`}>Gradient</button>
                        </div>
                    </div>
                    {gradientEnabled ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Start</label>
                                    <div className={`flex items-center space-x-2 p-1 rounded border ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white'}`}>
                                        <input type="color" value={gradientColor1} onChange={e => setGradientColor1(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-none p-0 bg-transparent" />
                                        <span className="text-xs font-mono text-gray-500">{gradientColor1}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">End</label>
                                    <div className={`flex items-center space-x-2 p-1 rounded border ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white'}`}>
                                        <input type="color" value={gradientColor2} onChange={e => setGradientColor2(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-none p-0 bg-transparent" />
                                        <span className="text-xs font-mono text-gray-500">{gradientColor2}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={`flex items-center space-x-3 p-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white'}`}>
                            <input type="color" value={design.dotsOptions.color} onChange={e => setDesign(p => ({...p, dotsOptions: {...p.dotsOptions, color: e.target.value}}))} className="h-8 w-8 rounded cursor-pointer border-none bg-transparent" />
                            <span className="text-sm font-mono text-gray-500">{design.dotsOptions.color}</span>
                        </div>
                    )}
                </div>
            </AccordionItem>
          </div>
        </div>
        <div className="lg:w-[420px] flex flex-col space-y-6">
          <div className="sticky top-24">
            <div className={`rounded-2xl shadow-xl border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="bg-gray-900 p-4 flex items-center justify-between">
                 <h3 className="text-white font-medium flex items-center"><RefreshCw size={16} className="mr-2 text-gray-400"/> Live Preview</h3>
                 <button onClick={saveToHistory} className="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition-colors" title="Save to History">
                   <Save size={14} className="mr-1" /> Save
                 </button>
              </div>
              <div className="p-10 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-100 min-h-[400px]">
                 <div className="relative group">
                   <div ref={qrRef} className="bg-white p-4 shadow-lg rounded-xl transform transition-transform duration-300 hover:scale-[1.02]" />
                   {!libLoaded && <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10"><span className="text-indigo-600 font-bold animate-pulse">Initializing...</span></div>}
                 </div>
              </div>
              <div className={`p-6 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button onClick={() => downloadQR('png')} className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-4 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95">
                    <Download size={18} /><span>PNG</span>
                  </button>
                   <button onClick={() => downloadQR('svg')} className={`flex items-center justify-center space-x-2 border-2 py-3.5 px-4 rounded-xl font-bold transition-all transform active:scale-95 ${darkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-200' : 'border-gray-100 hover:border-gray-300 bg-white text-gray-700'}`}>
                    <Download size={18} /><span>SVG</span>
                  </button>
                </div>
                <p className="text-center text-xs text-gray-400">High-resolution, print-ready output.</p>
              </div>
            </div>
            <div className="text-center pt-4">
              <p className={`text-xs flex items-center justify-center ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Made with <Heart size={12} className="mx-1 text-red-500 fill-red-500" /> by a Gemini Engineer
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  const renderScannerView = () => (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
        <div className="flex-grow relative flex items-center justify-center">
            <div id={scannerElementId} className="w-full h-full"></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[250px] h-[250px] border-4 border-white/50 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 animate-[scan_2s_ease-in-out_infinite]"></div>
                    <style>{`
                        @keyframes scan {
                            0% { transform: translateY(0); }
                            50% { transform: translateY(246px); }
                            100% { transform: translateY(0); }
                        }
                    `}</style>
                </div>
            </div>
            <button onClick={() => setActiveView('home')} className="absolute top-5 left-5 p-3 rounded-full bg-black/50 text-white z-10 hover:bg-black/75 transition-colors">
                <X size={24} />
            </button>
            {hasFlash && (
                <button onClick={toggleFlash} className={`absolute top-5 right-5 p-3 rounded-full bg-black/50 text-white z-10 hover:bg-black/75 transition-colors ${isFlashOn ? 'text-yellow-300' : ''}`}>
                    {isFlashOn ? <ZapOff size={24} /> : <Zap size={24} />}
                </button>
            )}
        </div>
        {scannedData && (
             <div className="absolute inset-0 bg-black/80 z-20 flex flex-col justify-end p-4 animate-in fade-in" onClick={() => setScannedData(null)}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl space-y-4 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">QR Code Scanned</h3>
                        <p className="text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-600 dark:text-gray-300 break-all">{scannedData}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => { navigator.clipboard.writeText(scannedData); showNotification("Copied to clipboard!"); }} className="flex items-center justify-center space-x-2 border-2 py-3 px-4 rounded-xl font-bold transition-all transform active:scale-95 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                            <Copy size={18} /><span>Copy</span>
                        </button>
                        <button onClick={() => handleRebuildFromScan(scannedData)} className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95">
                            <RefreshCw size={18} /><span>Rebuild QR</span>
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );

  const renderSettingsView = () => (
     <main className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Settings size={24} className="mr-3 text-indigo-500"/> Settings
        </h2>
        <div className={`p-6 rounded-xl border space-y-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div>
                <h3 className="text-lg font-semibold mb-2">Appearance</h3>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <label className="font-medium">Theme</label>
                    <div className={`flex items-center rounded-full p-1 border shadow-sm ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <button onClick={() => setDarkMode(false)} className={`p-2 rounded-full transition-colors ${!darkMode ? 'bg-white shadow' : ''}`}>
                            <Sun size={18} className="text-gray-600" />
                        </button>
                        <button onClick={() => setDarkMode(true)} className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-gray-700 shadow' : ''}`}>
                            <Moon size={18} className="text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Data Management</h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <div>
                            <label className="font-medium">Import / Export</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Save or load your design configuration.</p>
                        </div>
                        <div className="flex items-center space-x-2">
                             <input type="file" ref={fileInputRef} onChange={handleLoadConfig} className="hidden" accept=".json" />
                             <button onClick={() => fileInputRef.current?.click()} title="Load Config" className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-200 border'}`}>
                               <Upload size={16} />
                             </button>
                             <button onClick={handleSaveConfig} title="Save Config" className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-200 border'}`}>
                               <Save size={16} />
                             </button>
                        </div>
                    </div>
                     <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                         <div>
                            <label className="font-medium">Manage History</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Clear all saved QR code history.</p>
                        </div>
                        <button onClick={clearHistory} className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            Clear All
                        </button>
                    </div>
                </div>
            </div>
        </div>
     </main>
  );

  const renderHistoryView = () => (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <History size={24} className="mr-3 text-indigo-500" /> Creation History
      </h2>
      <div className="space-y-3">
        {history.length === 0 ? (
          <div className={`text-center py-20 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <Clock size={40} className="mx-auto mb-4 text-gray-400" />
            <h3 className="font-bold">No History Yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your created QR codes will appear here.</p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} onClick={() => loadFromHistory(item)} className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md group relative ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-indigo-500' : 'bg-white border-gray-200 hover:border-indigo-400'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1 block">{item.activeType}</span>
                  <p className={`text-sm font-medium truncate max-w-[200px] sm:max-w-md ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{item.summary}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                       <RotateCcw size={14} />
                       <span className="text-xs font-semibold">Restore</span>
                    </div>
                   <button onClick={(e) => deleteHistoryItem(item.id, e)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-500/10 transition-colors">
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );

  return (
    <div className={`min-h-screen font-sans pb-24 transition-colors duration-300 relative ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      
      {notification && (
        <div className="fixed top-5 right-5 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-xl z-[60] flex items-center animate-in fade-in slide-in-from-right duration-300 border border-gray-700">
          <CheckCircle2 size={18} className="mr-2 text-green-400" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      <header className={`border-b sticky top-0 z-30 shadow-sm backdrop-blur-md bg-opacity-90 ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-2 rounded-lg shadow-md">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none">QR Kitchen</h1>
              <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pro Generator</p>
            </div>
          </div>
        </div>
      </header>
      
      {activeView === 'home' && renderHomeView()}
      {activeView === 'scan' && renderScannerView()}
      {activeView === 'settings' && renderSettingsView()}
      {activeView === 'history' && renderHistoryView()}

      <BottomNavBar activeView={activeView} setActiveView={setActiveView} historyCount={history.length}/>

    </div>
  );
};

export default QRKitchen;
