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

const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.12 } }
};

// --- SAFE DATA INITIALIZERS ---
const getInitialProfile = () => {
    const saved = localStorage.getItem('A2Z_UserProfile');
    return saved ? JSON.parse(saved) : { userId: 'admin', password: 'admin', name: 'Administrator', email: '', phone: '+91-9644444661', address: '111, B.K Sindhi Colony, Main Square, Bhawarlia Main Road, Indore, Madhya Pradesh', gstNumber: '' };
};

const getInitialTheme = () => localStorage.getItem('A2Z_Theme') || 'default';
const getInitialAuth = () => localStorage.getItem('A2Z_Auth') === 'true';

const getInitialCatalog = () => {
    const saved = localStorage.getItem('A2Z_Database');
    let parsed = saved ? JSON.parse(saved) : [];
    return parsed.map(item => ({ ...item, stockQty: Number(item.stockQty) || 0, costPrice: Number(item.costPrice) || 0, sellPrice: Number(item.sellPrice) || 0 }));
};

const getInitialSales = () => {
    const saved = localStorage.getItem('A2Z_Sales');
    let parsed = saved ? JSON.parse(saved) : [];
    return parsed.map(sale => ({
        ...sale, subtotal: Number(sale.subtotal) || 0, discountPercentage: Number(sale.discountPercentage) || 0, discountAmount: Number(sale.discountAmount) || 0, grandTotal: Number(sale.grandTotal) || 0,
        items: sale.items.map(item => ({ ...item, qty: Number(item.qty) || 0, sellPrice: Number(item.sellPrice) || 0 }))
    }));
};

const getInitialCustomers = () => {
    const saved = localStorage.getItem('A2Z_Customers');
    return saved ? JSON.parse(saved) : [];
};

const getInitialReferrers = () => {
    const saved = localStorage.getItem('A2Z_Referrers');
    return saved ? JSON.parse(saved) : [];
};

const getInitialInvoiceSettings = () => {
    const saved = localStorage.getItem('A2Z_InvoiceSettings');
    return saved ? JSON.parse(saved) : {
        paperSize: '80mm',
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

    // Theme Effect
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('A2Z_Theme', currentTheme);
    }, [currentTheme]);

    // Save Data Effect
    useEffect(() => {
        try {
            localStorage.setItem('A2Z_Database', JSON.stringify(catalog));
            localStorage.setItem('A2Z_Sales', JSON.stringify(salesLedger));
            localStorage.setItem('A2Z_UserProfile', JSON.stringify(userProfile));
            localStorage.setItem('A2Z_Referrers', JSON.stringify(referrers));
            localStorage.setItem('A2Z_Customers', JSON.stringify(customers));
            localStorage.setItem('A2Z_InvoiceSettings', JSON.stringify(invoiceSettings));
        } catch (e) { if (e.name === 'QuotaExceededError') alert("ERROR: Local storage full!"); }
    }, [catalog, salesLedger, userProfile, referrers, customers, invoiceSettings]);

    const confirmLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            setIsAuthenticated(false);
            localStorage.removeItem('A2Z_Auth');
        }
    };

    if (!isAuthenticated) {
        return <LoginScreen setIsAuthenticated={setIsAuthenticated} userProfile={userProfile} setCatalog={setCatalog} setSalesLedger={setSalesLedger} />;
    }

    return (
        <div className="container">
            <NavigationDrawer 
                isDrawerOpen={isDrawerOpen} 
                setIsDrawerOpen={setIsDrawerOpen} 
                currentTab={currentTab} 
                setCurrentTab={setCurrentTab} 
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-32)' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="material-icons menu-icon" onClick={() => setIsDrawerOpen(true)}>menu</span>
                    <h1 style={{ margin: 0 }}>A2Z Collection</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-16)' }}>
                    <select value={currentTheme} onChange={(e) => setCurrentTheme(e.target.value)} style={{ padding: 'var(--spacing-8)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', cursor: 'pointer', width: 'auto', fontSize: '0.875rem', fontWeight: '600' }}>
                        <option value="default">Corporate Blue</option>
                        <option value="peacock">Peacock & Gold</option>
                        <option value="dark">Dark Mode</option>
                        <option value="terracotta">Earthy Terracotta</option>
                    </select>
                    <div className="profile-icon" onClick={() => setCurrentTab('profile')} title="User Profile">
                        <span className="material-icons">account_circle</span>
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
                    {currentTab === 'pos' && <PointOfSale catalog={catalog} setCatalog={setCatalog} salesLedger={salesLedger} setSalesLedger={setSalesLedger} customers={customers} setCustomers={setCustomers} referrers={referrers} userProfile={userProfile} invoiceSettings={invoiceSettings} />}
                    {currentTab === 'modifier' && <OrderModifier salesLedger={salesLedger} setSalesLedger={setSalesLedger} catalog={catalog} setCatalog={setCatalog} />}
                    {currentTab === 'admin' && <InventoryManager catalog={catalog} setCatalog={setCatalog} />}
                    {currentTab === 'designer' && <InvoiceDesigner invoiceSettings={invoiceSettings} setInvoiceSettings={setInvoiceSettings} userProfile={userProfile} />}
                    {currentTab === 'referrers' && <ReferrersTab referrers={referrers} setReferrers={setReferrers} />}
                    {currentTab === 'customers' && <CustomersTab customers={customers} setCustomers={setCustomers} />}
                    {currentTab === 'invoices' && <InvoicesTab salesLedger={salesLedger} />}
                    {currentTab === 'salesanalytics' && <SalesAnalytics salesLedger={salesLedger} />}
                    {currentTab === 'ledger' && <SalesLedger salesLedger={salesLedger} />}
                    {currentTab === 'profile' && <UserProfile userProfile={userProfile} setUserProfile={setUserProfile} catalog={catalog} setCatalog={setCatalog} salesLedger={salesLedger} setSalesLedger={setSalesLedger} customers={customers} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}