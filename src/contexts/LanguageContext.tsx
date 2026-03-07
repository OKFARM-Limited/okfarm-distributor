import React, { createContext, useContext, useState, useCallback } from 'react';

export type Language = 'en' | 'yo' | 'pcm';

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    vendors: 'Vendors',
    assets: 'Assets',
    allocation: 'Allocation',
    reconciliation: 'Reconciliation',
    allocationHistory: 'Allocation History',
    salesEntry: 'Sales Entry',
    payments: 'Payments',
    performance: 'Performance',
    vendorMap: 'Vendor Map',
    commissions: 'Commissions',
    payouts: 'Payouts',
    orders: 'Orders',
    auditTrail: 'Audit Trail',
    settings: 'Settings',
    checkIn: 'Check-In',
    inventory: 'Inventory',
    notifications: 'Notifications',
    forecast: 'Forecast',
    mobileMoney: 'Mobile Money',
    duesStatement: 'Dues Statement',
    scanner: 'Scanner',
    welcome: 'Welcome back',
    overview: 'Here\'s your operations overview.',
    activeVendors: 'Active Vendors',
    todaySales: "Today's Sales",
    cashCollected: 'Cash Collected',
    outstanding: 'Outstanding',
    addVendor: 'Add Vendor',
    search: 'Search',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    close: 'Close',
    total: 'Total',
    status: 'Status',
    date: 'Date',
    vendor: 'Vendor',
    amount: 'Amount',
    language: 'Language',
    english: 'English',
    yoruba: 'Yoruba',
    pidgin: 'Pidgin English',
  },
  yo: {
    dashboard: 'Pánẹ́lì',
    vendors: 'Àwọn Atajà',
    assets: 'Ohun-Ìní',
    allocation: 'Ìpín',
    reconciliation: 'Ìṣirò-padà',
    allocationHistory: 'Ìtàn Ìpín',
    salesEntry: 'Títẹ̀ Tita',
    payments: 'Ìsanwó',
    performance: 'Ìṣẹ́-ṣíṣe',
    vendorMap: 'Àwòrán Àwọn Atajà',
    commissions: 'Ẹ̀yà Owó',
    payouts: 'Sísanwó',
    orders: 'Àṣẹ',
    auditTrail: 'Ìṣayẹ̀wò',
    settings: 'Ètò',
    checkIn: 'Wíwọlé',
    inventory: 'Ohun-Ọ̀jà',
    notifications: 'Ìfitónilétí',
    forecast: 'Àsọtẹ́lẹ̀',
    mobileMoney: 'Owó Fóònù',
    duesStatement: 'Ìwé Gbèsè',
    scanner: 'Olùṣayẹ̀wò',
    welcome: 'Ẹ kú àbọ̀',
    overview: 'Ẹ̀yìn ni àkópọ̀ iṣẹ́ rẹ.',
    activeVendors: 'Àwọn Atajà Tí Ń Ṣiṣẹ́',
    todaySales: 'Títa Òní',
    cashCollected: 'Owó Tí A Kó',
    outstanding: 'Àpẹ́kùn Gbèsè',
    addVendor: 'Ṣàfikún Atajà',
    search: 'Wá',
    save: 'Fi Pamọ́',
    cancel: 'Fagilé',
    submit: 'Fírí',
    close: 'Pa',
    total: 'Àpapọ̀',
    status: 'Ipò',
    date: 'Ọjọ́',
    vendor: 'Atajà',
    amount: 'Iye Owó',
    language: 'Èdè',
    english: 'Gẹ̀ẹ́sì',
    yoruba: 'Yorùbá',
    pidgin: 'Pígín',
  },
  pcm: {
    dashboard: 'Dashboard',
    vendors: 'Vendors Dem',
    assets: 'Properties',
    allocation: 'Sharing',
    reconciliation: 'Settlement',
    allocationHistory: 'Sharing History',
    salesEntry: 'Enter Sales',
    payments: 'Payments',
    performance: 'How E Dey Go',
    vendorMap: 'Vendor Map',
    commissions: 'Commission',
    payouts: 'Payouts',
    orders: 'Orders',
    auditTrail: 'Check Records',
    settings: 'Settings',
    checkIn: 'Sign In',
    inventory: 'Stock',
    notifications: 'Alerts',
    forecast: 'Prediction',
    mobileMoney: 'Mobile Money',
    duesStatement: 'Wetin Dem Owe',
    scanner: 'Scanner',
    welcome: 'Welcome back o',
    overview: 'See how tins dey for your side.',
    activeVendors: 'Active Vendors',
    todaySales: 'Today Sales',
    cashCollected: 'Cash Wey Collect',
    outstanding: 'Wetin Remain',
    addVendor: 'Add Vendor',
    search: 'Search',
    save: 'Save Am',
    cancel: 'Cancel',
    submit: 'Submit',
    close: 'Close',
    total: 'Total',
    status: 'Status',
    date: 'Date',
    vendor: 'Vendor',
    amount: 'Amount',
    language: 'Language',
    english: 'English',
    yoruba: 'Yoruba',
    pidgin: 'Pidgin',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('okfarm_lang') as Language) || 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('okfarm_lang', lang);
  }, []);

  const t = useCallback((key: string) => {
    return translations[language]?.[key] || translations.en[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
