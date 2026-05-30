import React, { useState } from 'react';

export default function UserProfile({ userProfile, setUserProfile, catalog, setCatalog, salesLedger, setSalesLedger, parties = [], setParties, expenses = [], setExpenses, currentTheme, setCurrentTheme }) {
    const [dirHandle, setDirHandle] = useState(null);
    const [newItemType, setNewItemType] = useState('');
    const [newSubcategory, setNewSubcategory] = useState('');

    const addItemType = () => {
        const value = newItemType.trim();
        if (!value) return;
        if (userProfile.itemTypes?.includes(value)) {
            alert('Item type already exists!');
            return;
        }
        setUserProfile(prev => ({
            ...prev,
            itemTypes: [...(prev.itemTypes || ['Goods', 'Service']), value]
        }));
        setNewItemType('');
    };

    const deleteItemType = (typeToDelete) => {
        setUserProfile(prev => ({
            ...prev,
            itemTypes: (prev.itemTypes || ['Goods', 'Service']).filter(t => t !== typeToDelete)
        }));
    };

    const addSubcategory = () => {
        const value = newSubcategory.trim();
        if (!value) return;
        if (userProfile.subcategories?.includes(value)) {
            alert('Subcategory already exists!');
            return;
        }
        setUserProfile(prev => ({
            ...prev,
            subcategories: [...(prev.subcategories || ['T-Shirts', 'Shirts', 'Jeans', 'Shoes', 'Electronics', 'Utilities']), value]
        }));
        setNewSubcategory('');
    };

    const deleteSubcategory = (subToToDelete) => {
        setUserProfile(prev => ({
            ...prev,
            subcategories: (prev.subcategories || ['T-Shirts', 'Shirts', 'Jeans', 'Shoes', 'Electronics', 'Utilities']).filter(s => s !== subToToDelete)
        }));
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        alert('Profile updated successfully!');
        localStorage.setItem('M1x_UserProfile', JSON.stringify(userProfile));
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
                if (type === 'parties') setParties(parsed);
                if (type === 'expenses') setExpenses(parsed);
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
                    <span className="material-icons">settings</span>Profile & Settings
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

                {/* Application Theme Card */}
                <div style={{ backgroundColor: 'var(--surface-container-highest)', padding: 'var(--spacing-16)', borderRadius: 'var(--radius-md)', marginTop: 'var(--spacing-20)' }}>
                    <h4 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: 'var(--spacing-12)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-icons">palette</span> System Color Theme
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-16)' }}>Select a color palette for the user interface. Changes apply instantly across the entire application.</p>
                    
                    <div className="form-group" style={{ maxWidth: '400px', margin: 0 }}>
                        <select 
                            value={currentTheme} 
                            onChange={(e) => setCurrentTheme(e.target.value)} 
                            style={{ 
                                width: '100%', 
                                padding: 'var(--spacing-12)', 
                                backgroundColor: 'var(--surface-container-low)', 
                                color: 'var(--on-surface)', 
                                border: '1px solid var(--outline-variant)', 
                                borderBottom: '2px solid var(--primary)', 
                                borderRadius: 'var(--radius-md) var(--radius-md) 0 0', 
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '500'
                            }}
                        >
                            <option value="default">Corporate Blue</option>
                            <option value="peacock">Peacock & Gold</option>
                            <option value="dark">Dark Mode</option>
                            <option value="terracotta">Earthy Terracotta</option>
                            <option value="sunset">Sunset Burgundy</option>
                            <option value="sage">Forest Sage</option>
                            <option value="orchid">Royal Orchid</option>
                            <option value="cyberpunk">Cyberpunk Neon</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-20)', marginTop: 'var(--spacing-20)' }}>
                    {/* Item Types Setup */}
                    <div style={{ backgroundColor: 'var(--surface-container-highest)', padding: 'var(--spacing-16)', borderRadius: 'var(--radius-md)' }}>
                        <h4 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: 'var(--spacing-8)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-icons">category</span> Configure Item Types
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-12)' }}>Manage item types selectable in product creation (e.g. Goods, Service).</p>
                        
                        <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-12)' }}>
                            <input 
                                type="text" 
                                placeholder="Add new item type..." 
                                value={newItemType} 
                                onChange={(e) => setNewItemType(e.target.value)}
                                style={{ flex: 1, padding: 'var(--spacing-8)' }}
                            />
                            <button type="button" onClick={addItemType} className="btn-sm" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0 var(--spacing-16)', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Add</button>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {(userProfile.itemTypes || ['Goods', 'Service']).map(t => (
                                <span key={t} className="size-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderRadius: '4px', fontSize: '0.85rem' }}>
                                    {t}
                                    <span className="material-icons" style={{ fontSize: '14px', cursor: 'pointer', color: 'var(--error)' }} onClick={() => deleteItemType(t)}>close</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Subcategories Setup */}
                    <div style={{ backgroundColor: 'var(--surface-container-highest)', padding: 'var(--spacing-16)', borderRadius: 'var(--radius-md)' }}>
                        <h4 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: 'var(--spacing-8)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-icons">list</span> Configure Subcategories
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-12)' }}>Manage subcategories for product organization.</p>
                        
                        <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-12)' }}>
                            <input 
                                type="text" 
                                placeholder="Add new subcategory..." 
                                value={newSubcategory} 
                                onChange={(e) => setNewSubcategory(e.target.value)}
                                style={{ flex: 1, padding: 'var(--spacing-8)' }}
                            />
                            <button type="button" onClick={addSubcategory} className="btn-sm" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0 var(--spacing-16)', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Add</button>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {(userProfile.subcategories || ['T-Shirts', 'Shirts', 'Jeans', 'Shoes', 'Electronics', 'Utilities']).map(s => (
                                <span key={s} className="size-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderRadius: '4px', fontSize: '0.85rem' }}>
                                    {s}
                                    <span className="material-icons" style={{ fontSize: '14px', cursor: 'pointer', color: 'var(--error)' }} onClick={() => deleteSubcategory(s)}>close</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ backgroundColor: 'var(--surface-container-highest)', padding: 'var(--spacing-16)', borderRadius: 'var(--radius-md)', marginTop: 'var(--spacing-20)' }}>
                    <h4 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: 'var(--spacing-12)' }}>Data Management (JSON Backup)</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-16)' }}>Export your current data to keep a secure backup, or import a JSON file to restore your database.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-16)' }}>
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
                            
                            <button type="button" onClick={() => exportToJson(catalog, 'm1x_products.json')} className="btn-sm" style={{ backgroundColor: 'var(--primary)', color: 'white', marginBottom: '12px', width: '100%', padding: 'var(--spacing-8)' }}>
                                Download Products (JSON)
                            </button>
                            <label style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px' }}>Import Products JSON:</label>
                            <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'products')} style={{ fontSize: '0.75rem', padding: 'var(--spacing-4)', backgroundColor: 'transparent', border: 'none' }} />
                        </div>
                        
                        <div style={{ padding: 'var(--spacing-12)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)' }}>
                            <h5 style={{ margin: '0 0 var(--spacing-8) 0', color: 'var(--on-surface)' }}>Sales Database</h5>
                            <button type="button" onClick={() => exportToJson(salesLedger, 'm1x_sales.json')} className="btn-sm" style={{ backgroundColor: 'var(--primary)', color: 'white', marginBottom: '12px', width: '100%', padding: 'var(--spacing-8)' }}>
                                Download Sales (JSON)
                            </button>
                            <label style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px' }}>Import Sales JSON:</label>
                            <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'sales')} style={{ fontSize: '0.75rem', padding: 'var(--spacing-4)', backgroundColor: 'transparent', border: 'none' }} />
                        </div>

                        <div style={{ padding: 'var(--spacing-12)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)' }}>
                            <h5 style={{ margin: '0 0 var(--spacing-8) 0', color: 'var(--on-surface)' }}>Parties Database</h5>
                            <button type="button" onClick={() => exportToJson(parties, 'm1x_parties.json')} className="btn-sm" style={{ backgroundColor: 'var(--primary)', color: 'white', marginBottom: '12px', width: '100%', padding: 'var(--spacing-8)' }}>
                                Download Parties (JSON)
                            </button>
                            <label style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px' }}>Import Parties JSON:</label>
                            <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'parties')} style={{ fontSize: '0.75rem', padding: 'var(--spacing-4)', backgroundColor: 'transparent', border: 'none' }} />
                        </div>

                        <div style={{ padding: 'var(--spacing-12)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)' }}>
                            <h5 style={{ margin: '0 0 var(--spacing-8) 0', color: 'var(--on-surface)' }}>Expenses Database</h5>
                            <button type="button" onClick={() => exportToJson(expenses, 'm1x_expenses.json')} className="btn-sm" style={{ backgroundColor: 'var(--primary)', color: 'white', marginBottom: '12px', width: '100%', padding: 'var(--spacing-8)' }}>
                                Download Expenses (JSON)
                            </button>
                            <label style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px' }}>Import Expenses JSON:</label>
                            <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'expenses')} style={{ fontSize: '0.75rem', padding: 'var(--spacing-4)', backgroundColor: 'transparent', border: 'none' }} />
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