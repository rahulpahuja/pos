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
import LabelDesigner from './views/LabelDesigner';
import AIImageGenerator from './views/AIImageGenerator';

const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.12 } }
};

// --- SAFE DATA INITIALIZERS ---
const getInitialProfile = () => {
    const saved = localStorage.getItem('M1x_UserProfile');
    const profile = saved ? JSON.parse(saved) : { userId: 'admin', password: 'admin', name: 'Administrator', email: '', phone: '+91-9644444661', address: '111, B.K Sindhi Colony, Main Square, Bhawarlia Main Road, Indore, Madhya Pradesh', gstNumber: '' };
    if (!profile.itemTypes) profile.itemTypes = ['Goods', 'Service'];
    if (!profile.subcategories) profile.subcategories = ['T-Shirts', 'Shirts', 'Jeans', 'Shoes', 'Electronics', 'Utilities'];
    return profile;
};

const getInitialTheme = () => localStorage.getItem('M1x_Theme') || 'default';
const getInitialAuth = () => localStorage.getItem('M1x_Auth') === 'true';

const fixBrokenCatalogImages = (catalogList) => {
    const replacements = {
        'photo-1624378439575-d8705ad7ae80': 'photo-1617137968427-85924c800a22',
        'photo-1583496661160-fb48862c6a72': 'photo-1551488831-00ddcb6c6bd3',
        'photo-1525966222134-fcfa99dd8ec7': 'photo-1560769629-975ec94e6a86',
        'photo-1627124118304-4f273b3c373c': 'photo-1559563458-527698bf5295',
        'photo-1624222247344-550fb8ec8bd6': 'photo-1607522370275-f14206abe5d3',
        'photo-1576871337622-98d48d4aa53e': 'photo-1509551388413-e18d0ac5d495',
        'photo-1611930022073-b7a4ba5fcccd': 'photo-1590658268037-6bf12165a8df',
        'photo-1542496658-e33a6d0d50f6': 'photo-1523275335684-37898b6baf30',
        'photo-1505740420928-5e560c06d30e': 'photo-1590658268037-6bf12165a8df'
    };
    return catalogList.map(item => {
        if (item.images && item.images.length > 0) {
            const updatedImages = item.images.map(img => {
                let newUrl = img;
                Object.keys(replacements).forEach(broken => {
                    if (img.includes(broken)) {
                        newUrl = img.replace(broken, replacements[broken]);
                    }
                });
                return newUrl;
            });
            return { ...item, images: updatedImages };
        }
        return item;
    });
};

const getInitialCatalog = () => {
    const saved = localStorage.getItem('M1x_Database');
    let parsed = saved ? JSON.parse(saved) : [];
    const fixed = fixBrokenCatalogImages(parsed);
    return fixed.map(item => {
        const cost = Number(item.costPrice) || 0;
        const sell = Number(item.sellPrice) || 0;
        const margin = cost > 0 ? Math.round(((sell - cost) / cost) * 10000) / 100 : 0;
        return { 
            ...item, 
            stockQty: Number(item.stockQty) || 0, 
            costPrice: cost, 
            sellPrice: sell, 
            hsnCode: item.hsnCode || '',
            profitMargin: item.profitMargin !== undefined ? Number(item.profitMargin) : margin,
            itemType: item.itemType || 'Goods',
            subCategory: item.subCategory || 'Other',
            brand: item.brand || 'Generic',
            subCategoryPattern: item.subCategoryPattern || 'default',
            supplierName: item.supplierName || 'Generic'
        };
    });
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

const getInitialLabelSettings = () => {
    const saved = localStorage.getItem('M1x_LabelSettings');
    return saved ? JSON.parse(saved) : {
        width: '2.5in',
        height: '1.5in',
        padding: '10px',
        bg: '#ffffff',
        fontColor: '#000000',
        borderColor: '#000000',
        headerText: 'M1x COLLECTION',
        headerFontSize: '16px',
        headerFontWeight: 'bold',
        headerFontFamily: 'serif',
        nameFontSize: '12px',
        nameFontWeight: 'bold',
        showProductId: true,
        idFontSize: '10px',
        idLetterSpacing: '2px',
        sizeFontSize: '14px',
        sizeBorder: true,
        priceFontSize: '16px',
        priceFontWeight: 'bold',
        showPrice: true,
        pricePrefix: 'MRP: ₹',
        barcodeWidth: 1.5,
        barcodeHeight: 35,
        barcodeColor: '#000000',
        showBarcodeValue: false,
        fontFamily: 'Arial, sans-serif'
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
    const [labelSettings, setLabelSettings] = useState(getInitialLabelSettings);

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
            localStorage.setItem('M1x_LabelSettings', JSON.stringify(labelSettings));
        } catch (e) { if (e.name === 'QuotaExceededError') alert("ERROR: Local storage full!"); }
    }, [catalog, salesLedger, userProfile, referrers, customers, invoiceSettings, parties, expenses, labelSettings]);

    const confirmLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            setIsAuthenticated(false);
            localStorage.removeItem('M1x_Auth');
        }
    };

    if (!isAuthenticated) {
        return (
            <LoginScreen 
                setIsAuthenticated={setIsAuthenticated} 
                userProfile={userProfile} 
                setUserProfile={setUserProfile} 
                setCatalog={setCatalog} 
                setSalesLedger={setSalesLedger} 
                setCustomers={setCustomers}
                setParties={setParties}
                setExpenses={setExpenses}
                setReferrers={setReferrers}
                setInvoiceSettings={setInvoiceSettings}
            />
        );
    }

    return (
        <div className="app-layout">
            <NavigationDrawer 
                isDrawerOpen={isDrawerOpen} 
                setIsDrawerOpen={setIsDrawerOpen} 
                currentTab={currentTab} 
                setCurrentTab={setCurrentTab} 
                confirmLogout={confirmLogout}
            />

            <div className="main-content container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-32)' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="material-icons menu-icon" onClick={() => setIsDrawerOpen(!isDrawerOpen)} style={{ cursor: 'pointer', marginRight: 'var(--spacing-16)' }}>menu</span>
                        <h1 style={{ margin: 0 }}>M1x POS</h1>
                    </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-16)' }}>
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
                                 onError={() => {
                                     setUserProfile(prev => ({ ...prev, photoURL: '' }));
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
                    {currentTab === 'grid' && <ProductCatalog catalog={catalog} labelSettings={labelSettings} setCurrentTab={setCurrentTab} />}
                    {currentTab === 'pos' && <PointOfSale catalog={catalog} setCatalog={setCatalog} salesLedger={salesLedger} setSalesLedger={setSalesLedger} customers={customers} setCustomers={setCustomers} referrers={referrers} userProfile={userProfile} invoiceSettings={invoiceSettings} parties={parties} setParties={setParties} />}
                    {currentTab === 'modifier' && <OrderModifier salesLedger={salesLedger} setSalesLedger={setSalesLedger} catalog={catalog} setCatalog={setCatalog} parties={parties} setParties={setParties} />}
                    {currentTab === 'admin' && <InventoryManager catalog={catalog} setCatalog={setCatalog} userProfile={userProfile} parties={parties} />}
                    {currentTab === 'designer' && <InvoiceDesigner invoiceSettings={invoiceSettings} setInvoiceSettings={setInvoiceSettings} userProfile={userProfile} />}
                    {currentTab === 'labeldesigner' && <LabelDesigner labelSettings={labelSettings} setLabelSettings={setLabelSettings} />}
                    {currentTab === 'referrers' && <ReferrersTab referrers={referrers} setReferrers={setReferrers} />}
                    {currentTab === 'customers' && <CustomersTab customers={customers} setCustomers={setCustomers} />}
                    {currentTab === 'parties' && <PartiesTab parties={parties} setParties={setParties} salesLedger={salesLedger} />}
                    {currentTab === 'cashbook' && <CashbookTab expenses={expenses} setExpenses={setExpenses} salesLedger={salesLedger} parties={parties} />}
                    {currentTab === 'invoices' && <InvoicesTab salesLedger={salesLedger} invoiceSettings={invoiceSettings} userProfile={userProfile} />}
                    {currentTab === 'salesanalytics' && <SalesAnalytics salesLedger={salesLedger} />}
                    {currentTab === 'ledger' && <SalesLedger salesLedger={salesLedger} />}
                    {currentTab === 'profile' && <UserProfile userProfile={userProfile} setUserProfile={setUserProfile} catalog={catalog} setCatalog={setCatalog} salesLedger={salesLedger} setSalesLedger={setSalesLedger} customers={customers} parties={parties} setParties={setParties} currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />}
                    {currentTab === 'ai-image-generator' && <AIImageGenerator />}
                </motion.div>
            </AnimatePresence>
            </div>
        </div>
    );
}
