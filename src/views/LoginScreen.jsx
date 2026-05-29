import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getRahulDummyData } from '../utils/demoData';

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
        const data = getRahulDummyData();
        
        // Write directly to local storage
        localStorage.setItem('M1x_UserProfile', JSON.stringify(data.profile));
        localStorage.setItem('M1x_Database', JSON.stringify(data.catalogData));
        localStorage.setItem('M1x_Sales', JSON.stringify(data.salesData));
        localStorage.setItem('M1x_Customers', JSON.stringify(data.customersData));
        localStorage.setItem('M1x_Referrers', JSON.stringify(data.referrersData));
        localStorage.setItem('M1x_Parties', JSON.stringify(data.partiesData));
        localStorage.setItem('M1x_Expenses', JSON.stringify(data.expensesData));
        localStorage.setItem('M1x_InvoiceSettings', JSON.stringify(data.settingsData));
        localStorage.setItem('M1x_Auth', 'true');

        // Sync parent states immediately
        setUserProfile(data.profile);
        setCatalog(data.catalogData);
        setSalesLedger(data.salesData);
        setCustomers(data.customersData);
        setParties(data.partiesData);
        setExpenses(data.expensesData);
        setReferrers(data.referrersData);
        setInvoiceSettings(data.settingsData);
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
