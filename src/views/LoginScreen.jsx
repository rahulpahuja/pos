import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function LoginScreen({ setIsAuthenticated, userProfile, setCatalog, setSalesLedger }) {
    const [loginInput, setLoginInput] = useState({ userId: 'admin', password: 'admin' });

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (loginInput.userId === userProfile.userId && loginInput.password === userProfile.password) {
            setIsAuthenticated(true);
            localStorage.setItem('A2Z_Auth', 'true');
        } else {
            alert("Invalid User ID or Password");
        }
    };

    return (
        <div className="login-wrapper">
            <motion.div className="login-card" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>
                <h1 style={{ marginBottom: 'var(--spacing-8)', color: 'var(--primary)' }}>A2Z Collection</h1>
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

                    <button type="button" onClick={() => {
                        localStorage.clear();
                        alert("App reset to factory defaults. Please login with 'admin' and 'admin'.");
                        window.location.reload();
                    }} style={{ marginTop: 'var(--spacing-16)', background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', padding: 'var(--spacing-8)', borderRadius: 'var(--radius-md)', width: '100%', cursor: 'pointer' }}>
                        Locked out? Factory Reset App
                    </button>
                </form>
            </motion.div>
        </div>
    );
}