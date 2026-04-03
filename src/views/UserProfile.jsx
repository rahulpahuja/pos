import React, { useState } from 'react';

export default function UserProfile({ userProfile, setUserProfile, catalog, setCatalog, salesLedger, setSalesLedger }) {
    const [dirHandle, setDirHandle] = useState(null);

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        alert('Profile updated successfully!');
        localStorage.setItem('A2Z_UserProfile', JSON.stringify(userProfile));
    };

    const linkLocalFolder = async () => {
        try {
            const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
            setDirHandle(handle);
            alert("Folder linked successfully! The app will now auto-save your JSON files here.");
        } catch (error) {
            console.warn("Folder selection cancelled or failed:", error);
        }
    };

    const exportToJson = (data, filename) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                if (type === 'products') setCatalog(parsed);
                if (type === 'sales') setSalesLedger(parsed);
                alert(`${type.charAt(0).toUpperCase() + type.slice(1)} JSON loaded successfully!`);
            } catch (error) {
                alert(`Error parsing ${type} JSON. Please ensure it is a valid file.`);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-20)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: 'var(--spacing-20)', fontSize: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)' }}>
                    <span className="material-icons">account_circle</span>User Profile
                </h3>
            </div>
            
            <form onSubmit={handleProfileSubmit}>
                <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-16)' }}>
                        <div>
                            <label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>User ID</label>
                            <input type="text" value={userProfile.userId} onChange={(e) => setUserProfile(prev => ({ ...prev, userId: e.target.value }))} placeholder="Enter your user ID" required style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem' }} />
                        </div>
                        <div>
                            <label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Password</label>
                            <input type="password" value={userProfile.password} onChange={(e) => setUserProfile(prev => ({ ...prev, password: e.target.value }))} placeholder="Enter your password" required style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem' }} />
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-16)' }}>
                        <div>
                            <label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Full Name</label>
                            <input type="text" value={userProfile.name} onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter your full name" style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem' }} />
                        </div>
                        <div>
                            <label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Email Address</label>
                            <input type="email" value={userProfile.email} onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))} placeholder="Enter your email" style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem' }} />
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-16)' }}>
                        <div>
                            <label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Phone Number</label>
                            <input type="tel" value={userProfile.phone} onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))} placeholder="e.g. +91-9644444661" style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem' }} />
                        </div>
                        <div>
                            <label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>GST Number <span style={{ color: 'var(--on-surface-variant)', fontWeight: 400 }}>(appears on invoice top-left)</span></label>
                            <input type="text" value={userProfile.gstNumber || ''} onChange={(e) => setUserProfile(prev => ({ ...prev, gstNumber: e.target.value }))} placeholder="e.g. 23AAAAA0000A1Z5 (optional)" style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem', fontFamily: 'monospace', letterSpacing: '1px' }} />
                        </div>
                    </div>
                    
                    <div>
                        <label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Address</label>
                        <textarea value={userProfile.address} onChange={(e) => setUserProfile(prev => ({ ...prev, address: e.target.value }))} placeholder="Enter your address" rows="3" style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem', resize: 'vertical', minHeight: '80px' }} />
                    </div>
                </div>

                <div style={{ backgroundColor: 'var(--surface-container-highest)', padding: 'var(--spacing-16)', borderRadius: 'var(--radius-md)', marginTop: 'var(--spacing-20)' }}>
                    <h4 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: 'var(--spacing-12)' }}>Data Management (JSON Backup)</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-16)' }}>Export your current data to keep a secure backup, or import a JSON file to restore your database.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-16)' }}>
                        <div style={{ padding: 'var(--spacing-12)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)' }}>
                            <h5 style={{ margin: '0 0 var(--spacing-8) 0', color: 'var(--on-surface)' }}>Products Database</h5>
                            
                            <div style={{ backgroundColor: 'var(--surface-container-highest)', padding: 'var(--spacing-16)', borderRadius: 'var(--radius-md)', marginTop: 'var(--spacing-20)' }}>
                                <h4 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: 'var(--spacing-12)' }}>Data Management & Auto-Save</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-16)' }}>Link a local folder on your PC. The app will automatically sync and overwrite JSON files in this folder as you work.</p>

                                <div style={{ marginBottom: 'var(--spacing-24)', paddingBottom: 'var(--spacing-16)', borderBottom: '1px solid var(--outline-variant)' }}>
                                    <button type="button" onClick={linkLocalFolder} style={{ backgroundColor: dirHandle ? 'var(--success)' : 'var(--primary)', color: 'white', border: 'none', padding: 'var(--spacing-12)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '600', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                        <span className="material-icons">{dirHandle ? 'folder_special' : 'create_new_folder'}</span>
                                        {dirHandle ? 'Folder Linked & Auto-Saving' : 'Link Local Auto-Save Folder'}
                                    </button>
                                </div>
                            </div>
                            
                            <button type="button" onClick={() => exportToJson(catalog, 'a2z_products.json')} className="btn-sm" style={{ backgroundColor: 'var(--primary)', color: 'white', marginBottom: '12px', width: '100%', padding: 'var(--spacing-8)' }}>
                                Download Products (JSON)
                            </button>
                            <label style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px' }}>Import Products JSON:</label>
                            <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'products')} style={{ fontSize: '0.75rem', padding: 'var(--spacing-4)', backgroundColor: 'transparent', border: 'none' }} />
                        </div>
                        
                        <div style={{ padding: 'var(--spacing-12)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)' }}>
                            <h5 style={{ margin: '0 0 var(--spacing-8) 0', color: 'var(--on-surface)' }}>Sales Database</h5>
                            <button type="button" onClick={() => exportToJson(salesLedger, 'a2z_sales.json')} className="btn-sm" style={{ backgroundColor: 'var(--primary)', color: 'white', marginBottom: '12px', width: '100%', padding: 'var(--spacing-8)' }}>
                                Download Sales (JSON)
                            </button>
                            <label style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px' }}>Import Sales JSON:</label>
                            <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'sales')} style={{ fontSize: '0.75rem', padding: 'var(--spacing-4)', backgroundColor: 'transparent', border: 'none' }} />
                        </div>
                    </div>
                </div>

                <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: 'var(--spacing-12) var(--spacing-20)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)', marginTop: 'var(--spacing-20)' }}>
                    <span className="material-icons">save</span> Save Profile
                </button>
            </form>
        </div>
    );
}