import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InvoiceDesigner({ invoiceSettings, setInvoiceSettings, userProfile }) {
    // --- STATE INITIALIZATION ---
    const defaultTableStyle = { borderWidth: 1, fontSize: 11, padding: 4 };
    const initialSettings = {
        ...invoiceSettings,
        paperSize: invoiceSettings?.paperSize || '80mm',
        fontFamily: invoiceSettings?.fontFamily || 'monospace',
        headerMessage: invoiceSettings?.headerMessage || 'Dealer Under Composition Scheme',
        footerMessage: invoiceSettings?.footerMessage || 'Thank you for shopping!',
        columns: invoiceSettings?.columns || { sno: true, item: true, variants: true, rate: true, qty: true, amount: true },
        tableStyle: invoiceSettings?.tableStyle || defaultTableStyle,
        customFields: invoiceSettings?.customFields || []
    };

    const [settings, setSettings] = useState(initialSettings);
    const [activeTab, setActiveTab] = useState('layout'); // layout, header, table, fields, footer, templates
    
    const [templateHistory, setTemplateHistory] = useState(() => {
        const saved = localStorage.getItem('A2Z_TemplateHistory');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('A2Z_TemplateHistory', JSON.stringify(templateHistory));
    }, [templateHistory]);

    // --- HANDLERS ---
    const handleSaveDefault = () => {
        setInvoiceSettings(settings);
        alert('✨ Grand Invoice format saved! This is now your default bill.');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleColumnToggle = (name) => {
        setSettings(prev => ({ ...prev, columns: { ...prev.columns, [name]: !prev.columns[name] } }));
    };

    const handleStyleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, tableStyle: { ...prev.tableStyle, [name]: Number(value) } }));
    };

    // --- CUSTOM FIELDS ---
    const addCustomField = () => {
        setSettings(prev => ({
            ...prev,
            customFields: [...prev.customFields, { id: Date.now(), label: 'New Field', value: 'Value' }]
        }));
    };

    const updateCustomField = (id, key, value) => {
        setSettings(prev => ({
            ...prev,
            customFields: prev.customFields.map(f => f.id === id ? { ...f, [key]: value } : f)
        }));
    };

    const removeCustomField = (id) => {
        setSettings(prev => ({ ...prev, customFields: prev.customFields.filter(f => f.id !== id) }));
    };

    // --- TEMPLATES ---
    const saveAsNewTemplate = () => {
        const name = prompt("Enter a memorable name for this template (e.g., 'Festive Layout', 'A4 Standard'):");
        if (!name) return;
        const newTemplate = { id: Date.now(), name, config: settings, date: new Date().toLocaleDateString() };
        setTemplateHistory(prev => [newTemplate, ...prev]);
    };

    const loadTemplate = (template) => {
        if (window.confirm(`Load template "${template.name}"? Unsaved changes will be lost.`)) {
            setSettings(template.config);
        }
    };

    const deleteTemplate = (id) => {
        if (window.confirm("Delete this saved template forever?")) {
            setTemplateHistory(prev => prev.filter(t => t.id !== id));
        }
    };

    // --- RENDER HELPERS ---
    const tabList = [
        { id: 'layout', icon: 'aspect_ratio', label: 'Layout' },
        { id: 'header', icon: 'title', label: 'Header' },
        { id: 'table', icon: 'table_chart', label: 'Table & Columns' },
        { id: 'fields', icon: 'post_add', label: 'Custom Fields' },
        { id: 'footer', icon: 'horizontal_rule', label: 'Footer' },
        { id: 'templates', icon: 'auto_awesome_mosaic', label: 'Templates' }
    ];

    const tableBorderStyle = `${settings.tableStyle.borderWidth}px solid #000`;
    const tablePaddingStyle = `${settings.tableStyle.padding}px 3px`;

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: 'var(--spacing-24)' }}>
            
            {/* LEFT PANE: Grand Inspector Panel */}
            <div className="card" style={{ width: '400px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', flexShrink: 0 }}>
                
                {/* Header of Inspector */}
                <div style={{ padding: 'var(--spacing-20)', borderBottom: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-icons">brush</span> Designer
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>Select a category to edit properties.</p>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    
                    {/* Vertical Category Tabs */}
                    <div style={{ width: '60px', backgroundColor: 'var(--surface-container-high)', borderRight: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 'var(--spacing-12)', gap: 'var(--spacing-12)' }}>
                        {tabList.map(tab => (
                            <div 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                title={tab.label}
                                style={{
                                    width: '40px', height: '40px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
                                    backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                                    color: activeTab === tab.id ? 'white' : 'var(--on-surface-variant)'
                                }}
                            >
                                <span className="material-icons" style={{ fontSize: '1.25rem', margin: 0 }}>{tab.icon}</span>
                            </div>
                        ))}
                    </div>

                    {/* Properties Panel (Dynamic Content) */}
                    <div style={{ flex: 1, padding: 'var(--spacing-20)', overflowY: 'auto', backgroundColor: 'var(--surface-container-lowest)' }}>
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activeTab} 
                                initial={{ opacity: 0, x: 10 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -10 }} 
                                transition={{ duration: 0.15 }}
                            >
                                {/* 1. LAYOUT PROPERTIES */}
                                {activeTab === 'layout' && (
                                    <div>
                                        <h3 style={{ marginTop: 0, borderBottom: '2px solid var(--primary)', paddingBottom: '8px', display: 'inline-block' }}>Page Layout</h3>
                                        <div className="form-group" style={{ marginTop: '16px' }}>
                                            <label>Paper Size</label>
                                            <select name="paperSize" value={settings.paperSize} onChange={handleChange}>
                                                <option value="80mm">Thermal 80mm (Standard POS)</option>
                                                <option value="58mm">Thermal 58mm (Small POS)</option>
                                                <option value="A4">A4 Size (Wholesale/Large)</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Global Font Style</label>
                                            <select name="fontFamily" value={settings.fontFamily} onChange={handleChange}>
                                                <option value="'Courier New', Courier, monospace">Monospace (Classic Receipt)</option>
                                                <option value="Arial, sans-serif">Sans-Serif (Modern Clean)</option>
                                                <option value="'Times New Roman', serif">Serif (Traditional)</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* 2. HEADER PROPERTIES */}
                                {activeTab === 'header' && (
                                    <div>
                                        <h3 style={{ marginTop: 0, borderBottom: '2px solid var(--primary)', paddingBottom: '8px', display: 'inline-block' }}>Header Elements</h3>
                                        <div className="form-group" style={{ marginTop: '16px' }}>
                                            <label>Top Tagline / Subtitle</label>
                                            <input type="text" name="headerMessage" value={settings.headerMessage} onChange={handleChange} placeholder="e.g. Dealer Under Composition Scheme" />
                                        </div>
                                        <div style={{ padding: '12px', backgroundColor: 'var(--surface-container-high)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                                            <span className="material-icons" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '4px' }}>info</span>
                                            Store Name, Address, Phone, and GSTIN are automatically pulled from your User Profile settings.
                                        </div>
                                    </div>
                                )}

                                {/* 3. TABLE PROPERTIES */}
                                {activeTab === 'table' && (
                                    <div>
                                        <h3 style={{ marginTop: 0, borderBottom: '2px solid var(--primary)', paddingBottom: '8px', display: 'inline-block' }}>Table Formatting</h3>
                                        
                                        <div className="form-group" style={{ marginTop: '16px', backgroundColor: 'var(--surface-container-low)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                                            <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>Border Thickness <span>{settings.tableStyle.borderWidth}px</span></label>
                                            <input type="range" name="borderWidth" min="0" max="4" value={settings.tableStyle.borderWidth} onChange={handleStyleChange} style={{ width: '100%', cursor: 'pointer' }} />
                                        </div>
                                        <div className="form-group" style={{ backgroundColor: 'var(--surface-container-low)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                                            <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>Font Size <span>{settings.tableStyle.fontSize}px</span></label>
                                            <input type="range" name="fontSize" min="8" max="18" value={settings.tableStyle.fontSize} onChange={handleStyleChange} style={{ width: '100%', cursor: 'pointer' }} />
                                        </div>
                                        <div className="form-group" style={{ backgroundColor: 'var(--surface-container-low)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                                            <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>Cell Padding <span>{settings.tableStyle.padding}px</span></label>
                                            <input type="range" name="padding" min="0" max="12" value={settings.tableStyle.padding} onChange={handleStyleChange} style={{ width: '100%', cursor: 'pointer' }} />
                                        </div>

                                        <h4 style={{ marginTop: '24px', marginBottom: '12px' }}>Enable/Disable Columns</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {['sno', 'item', 'variants', 'qty', 'rate', 'amount'].map(col => {
                                                const labels = { sno: 'Serial Number (#)', item: 'Item Name', variants: 'Item Variants (Color/Size)', qty: 'Quantity', rate: 'Rate (Price)', amount: 'Total Amount' };
                                                const isMandatory = col === 'item' || col === 'amount';
                                                return (
                                                    <div key={col} onClick={() => !isMandatory && handleColumnToggle(col)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: settings.columns[col] ? 'var(--primary-container)' : 'var(--surface-container-high)', color: settings.columns[col] ? 'var(--on-primary-container)' : 'var(--on-surface)', borderRadius: 'var(--radius-md)', cursor: isMandatory ? 'not-allowed' : 'pointer', opacity: isMandatory ? 0.7 : 1, transition: 'all 0.2s' }}>
                                                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{labels[col]} {isMandatory && '(Required)'}</span>
                                                        <div style={{ width: '40px', height: '20px', backgroundColor: settings.columns[col] ? 'var(--success)' : '#ccc', borderRadius: '20px', position: 'relative', transition: 'all 0.3s' }}>
                                                            <div style={{ width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: settings.columns[col] ? '22px' : '2px', transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* 4. CUSTOM FIELDS */}
                                {activeTab === 'fields' && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: '8px', marginBottom: '16px' }}>
                                            <h3 style={{ margin: 0 }}>Custom Fields</h3>
                                            <button type="button" onClick={addCustomField} className="btn-sm" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '4px 12px', margin: 0 }}>+ Add Field</button>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Add dynamic rows above the table (e.g., "Payment Mode: Cash", "Salesperson: John").</p>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {settings.customFields.length === 0 && <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'var(--surface-container-high)', borderRadius: 'var(--radius-md)', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>No custom fields added yet.</div>}
                                            {settings.customFields.map((field, idx) => (
                                                <div key={field.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--surface-container-lowest)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', boxShadow: 'var(--shadow-sm)' }}>
                                                    <span style={{ fontWeight: 'bold', color: 'var(--outline-variant)' }}>{idx + 1}.</span>
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <input type="text" value={field.label} onChange={(e) => updateCustomField(field.id, 'label', e.target.value)} placeholder="Field Label (e.g., Paid Via)" style={{ padding: '8px', fontSize: '0.85rem' }} />
                                                        <input type="text" value={field.value} onChange={(e) => updateCustomField(field.id, 'value', e.target.value)} placeholder="Default Value (e.g., Cash)" style={{ padding: '8px', fontSize: '0.85rem' }} />
                                                    </div>
                                                    <button type="button" onClick={() => removeCustomField(field.id)} className="btn-sm btn-delete" style={{ padding: '8px', height: '100%' }}><span className="material-icons">delete_outline</span></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 5. FOOTER */}
                                {activeTab === 'footer' && (
                                    <div>
                                        <h3 style={{ marginTop: 0, borderBottom: '2px solid var(--primary)', paddingBottom: '8px', display: 'inline-block' }}>Footer Elements</h3>
                                        <div className="form-group" style={{ marginTop: '16px' }}>
                                            <label>Bottom Message (Terms/Greetings)</label>
                                            <textarea name="footerMessage" value={settings.footerMessage} onChange={handleChange} rows="6" placeholder="Thank you for shopping! \n No Exchange, No Refund." style={{ resize: 'vertical' }}></textarea>
                                        </div>
                                    </div>
                                )}

                                {/* 6. TEMPLATES */}
                                {activeTab === 'templates' && (
                                    <div>
                                        <h3 style={{ marginTop: 0, borderBottom: '2px solid var(--primary)', paddingBottom: '8px', display: 'inline-block' }}>Template Manager</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Save your current configuration to quickly swap between different receipt designs later.</p>
                                        
                                        <button type="button" onClick={saveAsNewTemplate} className="action-btn" style={{ backgroundColor: 'var(--primary)', color: 'white', marginTop: '10px', marginBottom: '24px' }}>
                                            <span className="material-icons">save</span> Save Current as Template
                                        </button>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {templateHistory.map(template => (
                                                <div key={template.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-container-highest)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--primary)' }}>{template.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '4px' }}>Saved: {template.date} | Size: {template.config.paperSize}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button type="button" onClick={() => loadTemplate(template)} className="btn-sm btn-edit" title="Load Layout" style={{ padding: '8px' }}><span className="material-icons">file_upload</span></button>
                                                        <button type="button" onClick={() => deleteTemplate(template.id)} className="btn-sm btn-delete" title="Delete" style={{ padding: '8px' }}><span className="material-icons">delete</span></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <div style={{ padding: 'var(--spacing-16)', backgroundColor: 'var(--surface-container-low)', borderTop: '1px solid var(--outline-variant)' }}>
                    <button type="button" onClick={handleSaveDefault} className="action-btn" style={{ backgroundColor: 'var(--success)', color: 'white', margin: 0, padding: '12px', fontSize: '1.1rem' }}>
                        <span className="material-icons" style={{ marginRight: '8px' }}>check_circle</span> Apply as Default Bill
                    </button>
                </div>
            </div>

            {/* RIGHT PANE: Grand Live Canvas Preview */}
            <div className="card" style={{ flex: 1, backgroundColor: '#cbd5e1', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ backgroundColor: '#94a3b8', padding: '10px 20px', color: 'white', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Live Print Preview</span>
                    <span style={{ fontSize: '0.85rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px' }}>{settings.paperSize} Format</span>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px' }}>
                    
                    {/* The "Paper" */}
                    <motion.div 
                        layout
                        style={{ 
                            backgroundColor: '#fff', 
                            width: settings.paperSize === '58mm' ? '220px' : settings.paperSize === 'A4' ? '100%' : '320px',
                            maxWidth: settings.paperSize === 'A4' ? '700px' : 'none',
                            padding: settings.paperSize === 'A4' ? '40px' : '20px', 
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2), 0 5px 10px rgba(0,0,0,0.1)',
                            fontFamily: settings.fontFamily,
                            color: '#000',
                            height: 'fit-content',
                            transition: 'width 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                            borderRadius: '2px'
                        }}
                    >
                        <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '10px', marginBottom: '15px' }}>
                            {userProfile.gstNumber && <div style={{ fontSize: '10px', textAlign: 'left' }}>GSTIN: {userProfile.gstNumber}</div>}
                            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{settings.headerMessage || ' '}</div>
                            <h2 style={{ margin: '8px 0', fontSize: '22px' }}>{userProfile.name || 'STORE NAME'}</h2>
                            <div style={{ fontSize: '11px' }}>{userProfile.address || 'Store Address line 1, City'}</div>
                            <div style={{ fontSize: '11px' }}>Ph: {userProfile.phone || '9999999999'}</div>
                        </div>

                        {/* Render Custom Fields */}
                        {settings.customFields.length > 0 && (
                            <div style={{ marginBottom: '15px', borderBottom: '1px dashed #ccc', paddingBottom: '10px' }}>
                                {settings.customFields.map(field => (
                                    <div key={field.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: `${settings.tableStyle.fontSize}px`, margin: '4px 0' }}>
                                        <span>{field.label || 'Label'}:</span>
                                        <span style={{ fontWeight: 'bold' }}>{field.value || 'Value'}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <table style={{ width: '100%', fontSize: `${settings.tableStyle.fontSize}px`, borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    {settings.columns.sno && <th style={{ borderTop: tableBorderStyle, borderBottom: tableBorderStyle, padding: tablePaddingStyle, textAlign: 'center', width: '20px' }}>#</th>}
                                    <th style={{ borderTop: tableBorderStyle, borderBottom: tableBorderStyle, padding: tablePaddingStyle }}>Item</th>
                                    {settings.columns.qty && <th style={{ borderTop: tableBorderStyle, borderBottom: tableBorderStyle, padding: tablePaddingStyle, textAlign: 'center' }}>Qty</th>}
                                    {settings.columns.rate && <th style={{ borderTop: tableBorderStyle, borderBottom: tableBorderStyle, padding: tablePaddingStyle, textAlign: 'right' }}>Rate</th>}
                                    {settings.columns.amount && <th style={{ borderTop: tableBorderStyle, borderBottom: tableBorderStyle, padding: tablePaddingStyle, textAlign: 'right' }}>Amount</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Mock Data Rows */}
                                <tr>
                                    {settings.columns.sno && <td style={{ padding: tablePaddingStyle, textAlign: 'center', borderBottom: tableBorderStyle }}>1</td>}
                                    <td style={{ padding: tablePaddingStyle, borderBottom: tableBorderStyle }}>
                                        Premium Shirt
                                        {settings.columns.variants && <><br/><span style={{ fontSize: '0.85em', color: '#555' }}>Navy Blue / XL</span></>}
                                    </td>
                                    {settings.columns.qty && <td style={{ padding: tablePaddingStyle, textAlign: 'center', borderBottom: tableBorderStyle }}>2</td>}
                                    {settings.columns.rate && <td style={{ padding: tablePaddingStyle, textAlign: 'right', borderBottom: tableBorderStyle }}>₹800</td>}
                                    {settings.columns.amount && <td style={{ padding: tablePaddingStyle, textAlign: 'right', fontWeight: 'bold', borderBottom: tableBorderStyle }}>₹1600</td>}
                                </tr>
                                <tr>
                                    {settings.columns.sno && <td style={{ padding: tablePaddingStyle, textAlign: 'center', borderBottom: tableBorderStyle }}>2</td>}
                                    <td style={{ padding: tablePaddingStyle, borderBottom: tableBorderStyle }}>
                                        Denim Jeans
                                        {settings.columns.variants && <><br/><span style={{ fontSize: '0.85em', color: '#555' }}>Black / 32</span></>}
                                    </td>
                                    {settings.columns.qty && <td style={{ padding: tablePaddingStyle, textAlign: 'center', borderBottom: tableBorderStyle }}>1</td>}
                                    {settings.columns.rate && <td style={{ padding: tablePaddingStyle, textAlign: 'right', borderBottom: tableBorderStyle }}>₹1200</td>}
                                    {settings.columns.amount && <td style={{ padding: tablePaddingStyle, textAlign: 'right', fontWeight: 'bold', borderBottom: tableBorderStyle }}>₹1200</td>}
                                </tr>
                            </tbody>
                        </table>

                        <div style={{ marginTop: '10px', paddingTop: '10px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
                            GRAND TOTAL: ₹2800.00
                        </div>

                        <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '30px', whiteSpace: 'pre-line' }}>
                            {settings.footerMessage}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}