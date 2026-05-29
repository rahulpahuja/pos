import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Components & Views
import NavigationDrawer from './components/NavigationDrawer';
import LoginScreen from './views/LoginScreen';
import ProductCatalog from './views/ProductCatalog';
import PointOfSale from './views/PointOfSale';
import OrderModifier from './views/OrderModifier'; // Added Import
import InventoryManager from './views/InventoryManager';
import InvoiceDesigner from './views/InvoiceDesigner'; // Added Import
import ReferrersTab from './views/ReferrersTab';
import SalesAnalytics from './views/SalesAnalytics';
import CustomersTab from './views/CustomersTab';
import InvoicesTab from './views/InvoicesTab'; // Added Import
import SalesLedger from './views/SalesLedger';
import UserProfile from './views/UserProfile';
import PartiesTab from './views/PartiesTab';
import CashbookTab from './views/CashbookTab';

const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.12 } }
};

// --- SAFE DATA INITIALIZERS ---
const getInitialProfile = () => {
    const saved = localStorage.getItem('M1x_UserProfile');
    return saved ? JSON.parse(saved) : { userId: 'admin', password: 'admin', name: 'Administrator', email: '', phone: '+91-9644444661', address: '111, B.K Sindhi Colony, Main Square, Bhawarlia Main Road, Indore, Madhya Pradesh', gstNumber: '' };
};

const getInitialTheme = () => localStorage.getItem('M1x_Theme') || 'default';
const getInitialAuth = () => localStorage.getItem('M1x_Auth') === 'true';

const getInitialCatalog = () => {
    const saved = localStorage.getItem('M1x_Database');
    let parsed = saved ? JSON.parse(saved) : [];
    return parsed.map(item => ({ ...item, stockQty: Number(item.stockQty) || 0, costPrice: Number(item.costPrice) || 0, sellPrice: Number(item.sellPrice) || 0 }));
};

const getInitialSales = () => {
    const saved = localStorage.getItem('M1x_Sales');
    let parsed = saved ? JSON.parse(saved) : [];
    return parsed.map(sale => ({
        ...sale, subtotal: Number(sale.subtotal) || 0, discountPercentage: Number(sale.discountPercentage) || 0, discountAmount: Number(sale.discountAmount) || 0, grandTotal: Number(sale.grandTotal) || 0,
        items: sale.items.map(item => ({ ...item, qty: Number(item.qty) || 0, sellPrice: Number(item.sellPrice) || 0 }))
    }));
};

const getInitialCustomers = () => {
    const saved = localStorage.getItem('M1x_Customers');
    return saved ? JSON.parse(saved) : [];
};

const getInitialParties = () => {
    const saved = localStorage.getItem('M1x_Parties');
    return saved ? JSON.parse(saved) : [];
};

const getInitialExpenses = () => {
    const saved = localStorage.getItem('M1x_Expenses');
    return saved ? JSON.parse(saved) : [];
};

const getInitialReferrers = () => {
    const saved = localStorage.getItem('M1x_Referrers');
    return saved ? JSON.parse(saved) : [];
};

const getInitialInvoiceSettings = () => {
    const saved = localStorage.getItem('M1x_InvoiceSettings');
    return saved ? JSON.parse(saved) : {
        paperSize: '80mm',
        fontFamily: 'monospace',
        fontColor: '#000000',
        logo: null,
        logoHeight: 50,
        logoAlign: 'center',
        headerMessage: 'Dealer Under Composition Scheme',
        footerMessage: 'Thank you for shopping with us!\nNo Exchange • No Refund',
        columns: { sno: true, item: true, variants: true, rate: true, qty: true, amount: true },
        tableStyle: { borderWidth: 1, fontSize: 11, padding: 4 },
        customFields: []
    };
};

export default function App() {
    // --- STATE DECLARATIONS ---
    const [userProfile, setUserProfile] = useState(getInitialProfile);
    const [currentTheme, setCurrentTheme] = useState(getInitialTheme);
    const [isAuthenticated, setIsAuthenticated] = useState(getInitialAuth);
    const [currentTab, setCurrentTab] = useState('grid');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [catalog, setCatalog] = useState(getInitialCatalog);
    const [salesLedger, setSalesLedger] = useState(getInitialSales);
    const [customers, setCustomers] = useState(getInitialCustomers);
    const [referrers, setReferrers] = useState(getInitialReferrers);
    const [invoiceSettings, setInvoiceSettings] = useState(getInitialInvoiceSettings);
    const [parties, setParties] = useState(getInitialParties);
    const [expenses, setExpenses] = useState(getInitialExpenses);

    // Theme Effect
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('M1x_Theme', currentTheme);
    }, [currentTheme]);

    // Save Data Effect
    useEffect(() => {
        try {
            localStorage.setItem('M1x_Database', JSON.stringify(catalog));
            localStorage.setItem('M1x_Sales', JSON.stringify(salesLedger));
            localStorage.setItem('M1x_UserProfile', JSON.stringify(userProfile));
            localStorage.setItem('M1x_Referrers', JSON.stringify(referrers));
            localStorage.setItem('M1x_Customers', JSON.stringify(customers));
            localStorage.setItem('M1x_InvoiceSettings', JSON.stringify(invoiceSettings));
            localStorage.setItem('M1x_Parties', JSON.stringify(parties));
            localStorage.setItem('M1x_Expenses', JSON.stringify(expenses));
        } catch (e) { if (e.name === 'QuotaExceededError') alert("ERROR: Local storage full!"); }
    }, [catalog, salesLedger, userProfile, referrers, customers, invoiceSettings, parties, expenses]);

    const confirmLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            setIsAuthenticated(false);
            localStorage.removeItem('M1x_Auth');
        }
    };

    if (!isAuthenticated) {
        return <LoginScreen setIsAuthenticated={setIsAuthenticated} userProfile={userProfile} setUserProfile={setUserProfile} setCatalog={setCatalog} setSalesLedger={setSalesLedger} />;
    }

    return (
        <div className="container">
            <NavigationDrawer 
                isDrawerOpen={isDrawerOpen} 
                setIsDrawerOpen={setIsDrawerOpen} 
                currentTab={currentTab} 
                setCurrentTab={setCurrentTab} 
                confirmLogout={confirmLogout}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-32)' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="material-icons menu-icon" onClick={() => setIsDrawerOpen(true)}>menu</span>
                    <h1 style={{ margin: 0 }}>M1x POS</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-16)' }}>
                    <select value={currentTheme} onChange={(e) => setCurrentTheme(e.target.value)} style={{ padding: 'var(--spacing-8)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', cursor: 'pointer', width: 'auto', fontSize: '0.875rem', fontWeight: '600' }}>
                        <option value="default">Corporate Blue</option>
                        <option value="peacock">Peacock & Gold</option>
                        <option value="dark">Dark Mode</option>
                        <option value="terracotta">Earthy Terracotta</option>
                        <option value="sunset">Sunset Burgundy</option>
                        <option value="sage">Forest Sage</option>
                        <option value="orchid">Royal Orchid</option>
                        <option value="cyberpunk">Cyberpunk Neon</option>
                    </select>
                    <div className="profile-icon" onClick={() => setCurrentTab('profile')} title={`User Profile: ${userProfile.name}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)' }}>
                        {userProfile.photoURL ? (
                            <img 
                                src={userProfile.photoURL} 
                                alt="profile" 
                                style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    objectFit: 'cover',
                                    border: '2px solid var(--primary)'
                                }} 
                            />
                        ) : (
                            <span className="material-icons" style={{ fontSize: '32px' }}>account_circle</span>
                        )}
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--on-surface)' }}>{userProfile.name}</span>
                    </div>
                    <div className="power-icon" onClick={confirmLogout} title="Logout">
                        <span className="material-icons">power_settings_new</span>
                    </div>
                </div>
            </div>
            
            <AnimatePresence mode="wait">
                <motion.div key={currentTab} variants={tabVariants} initial="initial" animate="animate" exit="exit">
                    {/* Routing Logic */}
                    {currentTab === 'grid' && <ProductCatalog catalog={catalog} />}
                    {currentTab === 'pos' && <PointOfSale catalog={catalog} setCatalog={setCatalog} salesLedger={salesLedger} setSalesLedger={setSalesLedger} customers={customers} setCustomers={setCustomers} referrers={referrers} userProfile={userProfile} invoiceSettings={invoiceSettings} parties={parties} setParties={setParties} />}
                    {currentTab === 'modifier' && <OrderModifier salesLedger={salesLedger} setSalesLedger={setSalesLedger} catalog={catalog} setCatalog={setCatalog} />}
                    {currentTab === 'admin' && <InventoryManager catalog={catalog} setCatalog={setCatalog} />}
                    {currentTab === 'designer' && <InvoiceDesigner invoiceSettings={invoiceSettings} setInvoiceSettings={setInvoiceSettings} userProfile={userProfile} />}
                    {currentTab === 'referrers' && <ReferrersTab referrers={referrers} setReferrers={setReferrers} />}
                    {currentTab === 'customers' && <CustomersTab customers={customers} setCustomers={setCustomers} />}
                    {currentTab === 'parties' && <PartiesTab parties={parties} setParties={setParties} salesLedger={salesLedger} />}
                    {currentTab === 'cashbook' && <CashbookTab expenses={expenses} setExpenses={setExpenses} salesLedger={salesLedger} parties={parties} />}
                    {currentTab === 'invoices' && <InvoicesTab salesLedger={salesLedger} />}
                    {currentTab === 'salesanalytics' && <SalesAnalytics salesLedger={salesLedger} />}
                    {currentTab === 'ledger' && <SalesLedger salesLedger={salesLedger} />}
                    {currentTab === 'profile' && <UserProfile userProfile={userProfile} setUserProfile={setUserProfile} catalog={catalog} setCatalog={setCatalog} salesLedger={salesLedger} setSalesLedger={setSalesLedger} customers={customers} parties={parties} setParties={setParties} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
