import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function LoginScreen({ 
    setIsAuthenticated, 
    userProfile, 
    setUserProfile, 
    setCatalog, 
    setSalesLedger, 
    setCustomers, 
    setParties, 
    setExpenses, 
    setReferrers, 
    setInvoiceSettings 
}) {
    const [loginInput, setLoginInput] = useState({ userId: 'admin', password: 'admin' });

    // --- RAHUL / RAHUL DUMMY DATA SEEDING ENGINE ---
    const loadRahulDummyData = () => {
        // Setup past dates for sales charts and cashbook
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
        const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
        const todayMorning = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
        const todayNow = new Date().toISOString();

        // 1. User Profile Setup
        const profile = {
            userId: 'rahul',
            password: 'rahul',
            name: 'Rahul Pahuja',
            email: 'rahul@m1xpos.com',
            phone: '+91-9988776655',
            address: 'M1x Corporate Tower, Vijay Nagar, Indore, M.P. - 452010',
            gstNumber: '23AAAAA1111A1Z1',
            logo: null,
            logoHeight: 50,
            logoAlign: 'center'
        };

        // 2. Product Catalog Setup (Multiple items, colors, sizes, barcode mappings)
        const catalogData = [
            {
                id: 'PROD-COT-CHINOS',
                name: 'Slim Fit Cotton Chinos',
                category: 'Apparel',
                costPrice: 700,
                sellPrice: 1200,
                images: [],
                variants: [
                    { size: '30', colorName: 'Olive Green', barcode: '1001', stockQty: 12 },
                    { size: '32', colorName: 'Olive Green', barcode: '1002', stockQty: 8 },
                    { size: '34', colorName: 'Khaki', barcode: '1003', stockQty: 2 },
                    { size: '36', colorName: 'Khaki', barcode: '1004', stockQty: 0 }
                ]
            },
            {
                id: 'PROD-RUN-SNEAKERS',
                name: 'Runner Pro Sneakers',
                category: 'Footwear',
                costPrice: 1400,
                sellPrice: 2400,
                images: [],
                variants: [
                    { size: '8', colorName: 'Carbon Black', barcode: '2001', stockQty: 5 },
                    { size: '9', colorName: 'Carbon Black', barcode: '2002', stockQty: 7 },
                    { size: '10', colorName: 'Neon Blue', barcode: '2003', stockQty: 4 }
                ]
            },
            {
                id: 'PROD-VINTAGE-HOODIE',
                name: 'Oversized Vintage Hoodie',
                category: 'Apparel',
                costPrice: 1000,
                sellPrice: 1800,
                images: [],
                variants: [
                    { size: 'M', colorName: 'Heather Grey', barcode: '3001', stockQty: 15 },
                    { size: 'L', colorName: 'Heather Grey', barcode: '3002', stockQty: 10 },
                    { size: 'XL', colorName: 'Charcoal', barcode: '3003', stockQty: 3 }
                ]
            },
            {
                id: 'PROD-ANC-EARBUDS',
                name: 'Wireless Noise-Canceling Earbuds',
                category: 'Electronics',
                costPrice: 2000,
                sellPrice: 3500,
                images: [],
                variants: [
                    { size: 'Standard', colorName: 'Matte Black', barcode: '4001', stockQty: 20 },
                    { size: 'Standard', colorName: 'Arctic White', barcode: '4002', stockQty: 15 }
                ]
            }
        ];

        // 3. Customers Database
        const customersData = [
            { id: 16210001, name: 'Priya Sharma', phone: '9876543210', joinDate: threeDaysAgo },
            { id: 16210002, name: 'Amit Verma', phone: '9826012345', joinDate: twoDaysAgo },
            { id: 16210003, name: 'Rohan Gupta', phone: '7000112233', joinDate: todayMorning }
        ];

        // 4. Sales Referrers / Staff DB
        const referrersData = [
            { id: 'ref-1', name: 'Vicky', details: 'Floor Associate' },
            { id: 'ref-2', name: 'Sunny', details: 'Counter Executive' }
        ];

        // 5. Invoices / Sales Ledger
        const salesData = [
            {
                invoiceNo: 'INV-500101',
                date: threeDaysAgo,
                items: [
                    { id: 'PROD-VINTAGE-HOODIE', name: 'Oversized Vintage Hoodie', barcode: '3002', size: 'L', colorName: 'Heather Grey', qty: 1, sellPrice: 1800 }
                ],
                subtotal: 1800,
                discountPercentage: 10,
                discountAmount: 180,
                grandTotal: 1620,
                referrer: 'Vicky',
                customerName: 'Priya Sharma',
                customerPhone: '9876543210',
                paymentType: 'full',
                amountPaid: 1620,
                balanceDue: 0
            },
            {
                invoiceNo: 'INV-500102',
                date: twoDaysAgo,
                items: [
                    { id: 'PROD-RUN-SNEAKERS', name: 'Runner Pro Sneakers', barcode: '2002', size: '9', colorName: 'Carbon Black', qty: 1, sellPrice: 2400 },
                    { id: 'PROD-COT-CHINOS', name: 'Slim Fit Cotton Chinos', barcode: '1002', size: '32', colorName: 'Olive Green', qty: 1, sellPrice: 1200 }
                ],
                subtotal: 3600,
                discountPercentage: 0,
                discountAmount: 0,
                grandTotal: 3600,
                referrer: 'Sunny',
                customerName: 'Amit Verma',
                customerPhone: '9826012345',
                paymentType: 'partial',
                amountPaid: 2000,
                balanceDue: 1600
            },
            {
                invoiceNo: 'INV-500103',
                date: yesterday,
                items: [
                    { id: 'PROD-ANC-EARBUDS', name: 'Wireless Noise-Canceling Earbuds', barcode: '4001', size: 'Standard', colorName: 'Matte Black', qty: 1, sellPrice: 3500 }
                ],
                subtotal: 3500,
                discountPercentage: 0,
                discountAmount: 0,
                grandTotal: 3500,
                referrer: '',
                customerName: '',
                customerPhone: '',
                paymentType: 'full',
                amountPaid: 3500,
                balanceDue: 0
            },
            {
                invoiceNo: 'INV-500104',
                date: todayMorning,
                items: [
                    { id: 'PROD-VINTAGE-HOODIE', name: 'Oversized Vintage Hoodie', barcode: '3003', size: 'XL', colorName: 'Charcoal', qty: 1, sellPrice: 1800 },
                    { id: 'PROD-COT-CHINOS', name: 'Slim Fit Cotton Chinos', barcode: '1001', size: '30', colorName: 'Olive Green', qty: 1, sellPrice: 1200 }
                ],
                subtotal: 3000,
                discountPercentage: 5,
                discountAmount: 150,
                grandTotal: 2850,
                referrer: 'Vicky',
                customerName: 'Rohan Gupta',
                customerPhone: '7000112233',
                paymentType: 'partial',
                amountPaid: 1500,
                balanceDue: 1350
            },
            {
                invoiceNo: 'INV-500105',
                date: todayNow,
                items: [
                    { id: 'PROD-COT-CHINOS', name: 'Slim Fit Cotton Chinos', barcode: '1001', size: '30', colorName: 'Olive Green', qty: 2, sellPrice: 1200 }
                ],
                subtotal: 2400,
                discountPercentage: 0,
                discountAmount: 0,
                grandTotal: 1200,
                referrer: '',
                customerName: 'Priya Sharma',
                customerPhone: '9876543210',
                paymentType: 'full',
                amountPaid: 1200,
                balanceDue: 0,
                status: 'RETURNED',
                refundAmount: 1200,
                returnedItems: [
                    { barcode: '1001', name: 'Slim Fit Cotton Chinos', sellPrice: 1200, colorName: 'Olive Green', size: '30', qty: 1 }
                ]
            }
        ];

        // 6. Parties Credit Accounts
        const partiesData = [
            {
                id: 'PRT-12345',
                name: 'Amit Verma',
                phone: '9826012345',
                email: 'amit.verma@example.com',
                address: 'Vijay Nagar, Indore, MP',
                gstin: '',
                notes: 'Credit client. Restocking fee waived.',
                balance: 1600,
                createdDate: twoDaysAgo,
                history: [
                    {
                        id: 'TXN-SALE-500102',
                        date: twoDaysAgo,
                        type: 'sale',
                        invoiceNo: 'INV-500102',
                        amount: 3600,
                        paid: 2000,
                        balanceDue: 1600,
                        description: 'Purchased items on credit (Invoice: INV-500102)'
                    }
                ]
            },
            {
                id: 'PRT-67890',
                name: 'Rohan Gupta',
                phone: '7000112233',
                email: 'rohan.gupta@example.com',
                address: 'Rajendra Nagar, Indore, MP',
                gstin: '',
                notes: 'Dues paid within 15 days.',
                balance: 1350,
                createdDate: todayMorning,
                history: [
                    {
                        id: 'TXN-SALE-500104',
                        date: todayMorning,
                        type: 'sale',
                        invoiceNo: 'INV-500104',
                        amount: 2850,
                        paid: 1500,
                        balanceDue: 1350,
                        description: 'Purchased items on credit (Invoice: INV-500104)'
                    }
                ]
            }
        ];

        // 7. Manual Expenses Outflows
        const expensesData = [
            { id: 'EXP-101', amount: 8000, category: 'Rent', particulars: 'Store Monthly Rent (Vijay Nagar Hub)', type: 'outflow', paymentMode: 'Cash', date: threeDaysAgo },
            { id: 'EXP-102', amount: 1500, category: 'Utilities', particulars: 'Electricity Bill', type: 'outflow', paymentMode: 'UPI', date: yesterday },
            { id: 'EXP-103', amount: 350, category: 'Other', particulars: 'Snacks & tea for showroom staff', type: 'outflow', paymentMode: 'Cash', date: todayMorning }
        ];

        // 8. Invoice Layout Setup
        const settingsData = {
            paperSize: '80mm',
            fontFamily: "'Outfit', sans-serif",
            fontColor: '#1e3a8a',
            headerMessage: 'Composition Scheme - Tax Invoice',
            footerMessage: 'Thank you for shopping at M1x!\nExchanges allowed within 7 days with tags.',
            columns: { sno: true, item: true, variants: true, rate: true, qty: true, amount: true },
            tableStyle: { borderWidth: 1, fontSize: 11, padding: 5 },
            customFields: [
                { id: 1, label: 'Payment Mode', value: 'Counter Pay' },
                { id: 2, label: 'Operator', value: 'Rahul P.' }
            ]
        };

        // Write directly to local storage
        localStorage.setItem('M1x_UserProfile', JSON.stringify(profile));
        localStorage.setItem('M1x_Database', JSON.stringify(catalogData));
        localStorage.setItem('M1x_Sales', JSON.stringify(salesData));
        localStorage.setItem('M1x_Customers', JSON.stringify(customersData));
        localStorage.setItem('M1x_Referrers', JSON.stringify(referrersData));
        localStorage.setItem('M1x_Parties', JSON.stringify(partiesData));
        localStorage.setItem('M1x_Expenses', JSON.stringify(expensesData));
        localStorage.setItem('M1x_InvoiceSettings', JSON.stringify(settingsData));
        localStorage.setItem('M1x_Auth', 'true');

        // Sync parent states immediately
        setUserProfile(profile);
        setCatalog(catalogData);
        setSalesLedger(salesData);
        setCustomers(customersData);
        setParties(partiesData);
        setExpenses(expensesData);
        setReferrers(referrersData);
        setInvoiceSettings(settingsData);
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        
        // Match user request: credentials rahul / rahul
        if (loginInput.userId === 'rahul' && loginInput.password === 'rahul') {
            loadRahulDummyData();
            setIsAuthenticated(true);
            localStorage.setItem('M1x_Auth', 'true');
            alert("Welcome Rahul! Test database (inventory, analytics charts, sales, credit ledger, and expenses) has been pre-populated.");
        } else if (loginInput.userId === userProfile.userId && loginInput.password === userProfile.password) {
            setIsAuthenticated(true);
            localStorage.setItem('M1x_Auth', 'true');
        } else {
            alert("Invalid User ID or Password");
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            setUserProfile(prev => ({
                ...prev,
                name: user.displayName || prev.name,
                email: user.email || prev.email,
                photoURL: user.photoURL || '',
            }));
            
            setIsAuthenticated(true);
            localStorage.setItem('M1x_Auth', 'true');
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            alert(`Sign-in failed: ${error.message}`);
        }
    };

    return (
        <div className="login-wrapper">
            <motion.div className="login-card" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>
                <h1 style={{ marginBottom: 'var(--spacing-8)', color: 'var(--primary)' }}>M1x POS</h1>
                <p style={{ marginBottom: 'var(--spacing-32)' }}>Inventory & Point of Sale System</p>

                <form onSubmit={handleLoginSubmit}>
                    <div style={{ textAlign: 'left', marginBottom: 'var(--spacing-16)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-8)', fontWeight: '600' }}>User ID</label>
                        <input type="text" value={loginInput.userId} onChange={(e) => setLoginInput({ ...loginInput, userId: e.target.value })} placeholder="Default: admin" required style={{ width: '100%' }} />
                    </div>
                    <div style={{ textAlign: 'left', marginBottom: 'var(--spacing-24)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-8)', fontWeight: '600' }}>Password</label>
                        <input type="password" value={loginInput.password} onChange={(e) => setLoginInput({ ...loginInput, password: e.target.value })} placeholder="Default: admin" required style={{ width: '100%' }} />
                    </div>

                    <button type="submit" className="action-btn" style={{ padding: 'var(--spacing-16)', fontSize: '1.125rem' }}>Login to POS</button>
                </form>

                {/* Info Tip Block for Testing Rahul Account */}
                <div style={{ marginTop: 'var(--spacing-20)', padding: '12px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '0.8rem', color: 'var(--on-surface-variant)', textAlign: 'left', lineHeight: '1.4' }}>
                    <span className="material-icons" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '6px', color: 'var(--primary)' }}>lightbulb</span>
                    <b>Test Mode:</b> Enter User ID <b>rahul</b> and Password <b>rahul</b> to automatically seed the system with a complete store database (including items, charts, credit ledger, and expenses).
                </div>

                {/* Google Sign-In */}
                <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--spacing-20) 0', color: 'var(--on-surface-variant)' }}>
                    <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--outline-variant)' }} />
                    <span style={{ padding: '0 var(--spacing-12)', fontSize: '0.875rem', fontWeight: 500 }}>or</span>
                    <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--outline-variant)' }} />
                </div>

                <button 
                    type="button" 
                    onClick={handleGoogleSignIn}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: 'var(--spacing-12)', 
                        width: '100%', 
                        padding: 'var(--spacing-12)', 
                        backgroundColor: 'var(--surface-container-lowest)', 
                        border: '1px solid var(--outline-variant)', 
                        borderRadius: 'var(--radius-xl)', 
                        cursor: 'pointer', 
                        fontWeight: '600', 
                        fontSize: '1rem', 
                        color: 'var(--on-surface)',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-container-high)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-container-lowest)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-1.14 2.78-2.4 3.62v3.02h3.87c2.26-2.08 3.58-5.14 3.58-8.49z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.09 1.16-3.15 0-5.81-2.13-6.76-5.01H1.27v3.11c2 3.98 6.12 6.67 10.73 6.67z"/>
                        <path fill="#FBBC05" d="M5.24 14.22c-.24-.72-.38-1.5-.38-2.22s.14-1.5.38-2.22V6.67H1.27C.46 8.29 0 10.1 0 12s.46 3.71 1.27 5.33l3.97-3.11z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.39 0 3.27 2.69 1.27 6.67l3.97 3.11c.95-2.88 3.61-5.01 6.76-5.01z"/>
                    </svg>
                    Sign in with Google
                </button>

                <button type="button" onClick={() => {
                    localStorage.clear();
                    alert("App reset to factory defaults. Please login with 'admin' and 'admin'.");
                    window.location.reload();
                }} style={{ marginTop: 'var(--spacing-24)', background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', padding: 'var(--spacing-8)', borderRadius: 'var(--radius-md)', width: '100%', cursor: 'pointer', fontSize: '0.875rem' }}>
                    Locked out? Factory Reset App
                </button>
            </motion.div>
        </div>
    );
}
