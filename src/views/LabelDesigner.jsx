import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JsBarcode from 'jsbarcode';

export default function LabelDesigner({ labelSettings, setLabelSettings }) {
    // --- DEFAULT INITIAL STATE ---
    const defaultSettings = {
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

    const initialSettings = { ...defaultSettings, ...labelSettings };
    const [settings, setSettings] = useState(initialSettings);
    const [activeTab, setActiveTab] = useState('layout'); // layout, text, barcode, templates
    const [savedTemplates, setSavedTemplates] = useState(() => {
        const saved = localStorage.getItem('M1x_LabelTemplates');
        return saved ? JSON.parse(saved) : [
            {
                id: 'preset-standard',
                name: 'Standard Clothing Tag',
                config: { ...defaultSettings }
            },
            {
                id: 'preset-compact',
                name: 'Compact Barcode Label',
                config: {
                    ...defaultSettings,
                    width: '2.0in',
                    height: '1.0in',
                    padding: '6px',
                    headerText: 'M1X POS',
                    headerFontSize: '12px',
                    nameFontSize: '10px',
                    priceFontSize: '12px',
                    barcodeHeight: 25,
                    idFontSize: '8px'
                }
            },
            {
                id: 'preset-jewelry',
                name: 'Elegant Black Jewelry Tag',
                config: {
                    ...defaultSettings,
                    width: '3.0in',
                    height: '1.5in',
                    bg: '#1a1a1a',
                    fontColor: '#f1c40f',
                    borderColor: '#f1c40f',
                    headerText: '★ EXCLUSIVE ★',
                    headerFontFamily: 'sans-serif',
                    headerFontSize: '14px',
                    barcodeColor: '#f1c40f',
                    showBarcodeValue: true,
                    fontFamily: "'Montserrat', sans-serif"
                }
            }
        ];
    });

    useEffect(() => {
        localStorage.setItem('M1x_LabelTemplates', JSON.stringify(savedTemplates));
    }, [savedTemplates]);

    // Draw Barcode in Preview Canvas
    const canvasRef = useRef(null);
    useEffect(() => {
        if (canvasRef.current) {
            try {
                JsBarcode(canvasRef.current, 'M1X-SAMPLE', {
                    width: settings.barcodeWidth,
                    height: settings.barcodeHeight,
                    lineColor: settings.barcodeColor,
                    displayValue: settings.showBarcodeValue,
                    fontSize: 10,
                    margin: 0,
                    background: 'transparent'
                });
            } catch (err) {
                console.error("Barcode drawing error in designer: ", err);
            }
        }
    }, [settings.barcodeWidth, settings.barcodeHeight, settings.barcodeColor, settings.showBarcodeValue]);

    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name.includes('Width') || name.includes('Height') ? Number(value) : value)
        }));
    };

    const handleSaveDefault = () => {
        setLabelSettings(settings);
        alert('✨ Default product label layout updated successfully!');
    };

    const handleTemplateSave = () => {
        const name = prompt("Enter a name for this label template:");
        if (!name) return;
        const newTemplate = { id: Date.now().toString(), name, config: { ...settings } };
        setSavedTemplates(prev => [...prev, newTemplate]);
    };

    const loadTemplate = (template) => {
        if (window.confirm(`Load template "${template.name}"? Unsaved changes will be overridden.`)) {
            setSettings({ ...template.config });
        }
    };

    const deleteTemplate = (id, e) => {
        e.stopPropagation();
        if (id.startsWith('preset-')) {
            alert('Cannot delete system default presets.');
            return;
        }
        if (window.confirm("Are you sure you want to delete this custom template?")) {
            setSavedTemplates(prev => prev.filter(t => t.id !== id));
        }
    };

    const tabList = [
        { id: 'layout', icon: 'aspect_ratio', label: 'Layout & Colors' },
        { id: 'text', icon: 'font_download', label: 'Text & Fonts' },
        { id: 'barcode', icon: 'qr_code', label: 'Barcode Style' },
        { id: 'templates', icon: 'bookmarks', label: 'Presets' }
    ];

    // CSS Dimensions for Preview Box
    const convertDimensionToPx = (dim, isWidth = true) => {
        const fallback = isWidth ? 240 : 120; // Default to 2.5in x 1.25in
        if (!dim) return fallback;
        
        const cleanDim = String(dim).trim().toLowerCase();
        if (cleanDim === '') return fallback;
        
        const val = parseFloat(cleanDim);
        if (isNaN(val)) return fallback;
        
        if (cleanDim.endsWith('in')) {
            return val * 96;
        } else if (cleanDim.endsWith('mm')) {
            return val * 3.779;
        } else if (cleanDim.endsWith('px')) {
            return val;
        } else {
            // No unit specified, infer based on size
            if (val <= 15) {
                return val * 96; // Treat as inches
            } else {
                return val; // Treat as pixels
            }
        }
    };

    const previewWidth = convertDimensionToPx(settings.width, true);
    const previewHeight = convertDimensionToPx(settings.height, false);

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: 'var(--spacing-24)' }}>
            
            {/* LEFT INSPECTOR CONTAINER */}
            <div className="card" style={{ width: '400px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ padding: 'var(--spacing-20)', borderBottom: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-icons">label</span> Label Designer
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Customize parameters for product tags & stickers.</p>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    
                    {/* Vertical categories list */}
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

                    {/* Properties Form Panel */}
                    <div style={{ flex: 1, padding: 'var(--spacing-20)', overflowY: 'auto', backgroundColor: 'var(--surface-container-lowest)' }}>
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activeTab} 
                                initial={{ opacity: 0, x: 10 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -10 }} 
                                transition={{ duration: 0.15 }}
                            >
                                {/* 1. LAYOUT & COLOR TAB */}
                                {activeTab === 'layout' && (
                                    <div>
                                        <h3 style={{ marginTop: 0, borderBottom: '2px solid var(--primary)', paddingBottom: '6px', display: 'inline-block', fontSize: '1rem' }}>Layout & Background</h3>
                                        
                                        <div className="form-group" style={{ marginTop: '16px' }}>
                                            <label>Label Width (e.g. 2.5in or 60mm)</label>
                                            <input type="text" name="width" value={settings.width} onChange={handleChange} placeholder="2.5in" />
                                        </div>

                                        <div className="form-group">
                                            <label>Label Height (e.g. 1.25in or 30mm)</label>
                                            <input type="text" name="height" value={settings.height} onChange={handleChange} placeholder="1.25in" />
                                        </div>

                                        <div className="form-group">
                                            <label>Interior Padding</label>
                                            <input type="text" name="padding" value={settings.padding} onChange={handleChange} placeholder="10px" />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                                            <div className="form-group">
                                                <label>Background (BG)</label>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <input type="color" name="bg" value={settings.bg} onChange={handleChange} style={{ padding: 0, border: 'none', width: '32px', height: '32px', cursor: 'pointer' }} />
                                                    <input type="text" name="bg" value={settings.bg} onChange={handleChange} style={{ flex: 1, fontSize: '0.85rem' }} />
                                                </div>
                                            </div>
                                            
                                            <div className="form-group">
                                                <label>Text Color</label>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <input type="color" name="fontColor" value={settings.fontColor} onChange={handleChange} style={{ padding: 0, border: 'none', width: '32px', height: '32px', cursor: 'pointer' }} />
                                                    <input type="text" name="fontColor" value={settings.fontColor} onChange={handleChange} style={{ flex: 1, fontSize: '0.85rem' }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-group" style={{ marginTop: '8px' }}>
                                            <label>Borders Color</label>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <input type="color" name="borderColor" value={settings.borderColor} onChange={handleChange} style={{ padding: 0, border: 'none', width: '32px', height: '32px', cursor: 'pointer' }} />
                                                <input type="text" name="borderColor" value={settings.borderColor} onChange={handleChange} style={{ flex: 1, fontSize: '0.85rem' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. TEXT & FONTS TAB */}
                                {activeTab === 'text' && (
                                    <div>
                                        <h3 style={{ marginTop: 0, borderBottom: '2px solid var(--primary)', paddingBottom: '6px', display: 'inline-block', fontSize: '1rem' }}>Header & Typography</h3>
                                        
                                        <div className="form-group" style={{ marginTop: '16px' }}>
                                            <label>Global Font Style</label>
                                            <select name="fontFamily" value={settings.fontFamily || 'Arial, sans-serif'} onChange={handleChange}>
                                                <option value="Arial, sans-serif">Sans-Serif (Arial/Clean)</option>
                                                <option value="'Courier New', Courier, monospace">Monospace (Classic Courier)</option>
                                                <option value="'Times New Roman', serif">Serif (Traditional)</option>
                                                <option value="'Inter', sans-serif">Inter (Modern Premium)</option>
                                                <option value="'Manrope', sans-serif">Manrope (Clean Display)</option>
                                                <option value="'Outfit', sans-serif">Outfit (Geometric Elegance)</option>
                                                <option value="'Poppins', sans-serif">Poppins (Friendly Rounded)</option>
                                                <option value="'Montserrat', sans-serif">Montserrat (Sleek Geometric)</option>
                                                <option value="'Open Sans', sans-serif">Open Sans (Highly Legible)</option>
                                                <option value="'Roboto Mono', monospace">Roboto Mono (Developer Mono)</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Header Line</label>
                                            <input type="text" name="headerText" value={settings.headerText} onChange={handleChange} />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div className="form-group">
                                                <label>Header Font Family</label>
                                                <select name="headerFontFamily" value={settings.headerFontFamily} onChange={handleChange}>
                                                    <option value="serif">Elegant Serif</option>
                                                    <option value="sans-serif">Clean Sans-Serif</option>
                                                    <option value="monospace">Mono Code</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Header Font Size</label>
                                                <input type="text" name="headerFontSize" value={settings.headerFontSize} onChange={handleChange} placeholder="16px" />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div className="form-group">
                                                <label>Prod Name Size</label>
                                                <input type="text" name="nameFontSize" value={settings.nameFontSize} onChange={handleChange} placeholder="12px" />
                                            </div>
                                            <div className="form-group">
                                                <label>Size Text Size</label>
                                                <input type="text" name="sizeFontSize" value={settings.sizeFontSize} onChange={handleChange} placeholder="14px" />
                                            </div>
                                        </div>

                                        <hr style={{ border: 'none', borderTop: '1px solid var(--outline-variant)', margin: '16px 0' }} />

                                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input type="checkbox" id="showPrice" name="showPrice" checked={settings.showPrice} onChange={handleChange} />
                                            <label htmlFor="showPrice" style={{ cursor: 'pointer', margin: 0 }}>Show Price (MRP)</label>
                                        </div>

                                        {settings.showPrice && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                <div className="form-group">
                                                    <label>Price Prefix</label>
                                                    <input type="text" name="pricePrefix" value={settings.pricePrefix} onChange={handleChange} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Price Font Size</label>
                                                    <input type="text" name="priceFontSize" value={settings.priceFontSize} onChange={handleChange} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                                            <input type="checkbox" id="showProductId" name="showProductId" checked={settings.showProductId} onChange={handleChange} />
                                            <label htmlFor="showProductId" style={{ cursor: 'pointer', margin: 0 }}>Show Product ID</label>
                                        </div>

                                        {settings.showProductId && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                <div className="form-group">
                                                    <label>ID Font Size</label>
                                                    <input type="text" name="idFontSize" value={settings.idFontSize} onChange={handleChange} />
                                                </div>
                                                <div className="form-group">
                                                    <label>ID Letter Spacing</label>
                                                    <input type="text" name="idLetterSpacing" value={settings.idLetterSpacing} onChange={handleChange} />
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                                            <input type="checkbox" id="sizeBorder" name="sizeBorder" checked={settings.sizeBorder} onChange={handleChange} />
                                            <label htmlFor="sizeBorder" style={{ cursor: 'pointer', margin: 0 }}>Put border around sizes</label>
                                        </div>
                                    </div>
                                )}

                                {/* 3. BARCODE STYLE TAB */}
                                {activeTab === 'barcode' && (
                                    <div>
                                        <h3 style={{ marginTop: 0, borderBottom: '2px solid var(--primary)', paddingBottom: '6px', display: 'inline-block', fontSize: '1rem' }}>Barcode Settings</h3>
                                        
                                        <div className="form-group" style={{ marginTop: '16px' }}>
                                            <label>Barcode Height (px)</label>
                                            <input type="range" name="barcodeHeight" min="15" max="80" value={settings.barcodeHeight} onChange={handleChange} style={{ width: '100%' }} />
                                            <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', float: 'right' }}>{settings.barcodeHeight}px</span>
                                        </div>

                                        <div className="form-group" style={{ marginTop: '12px' }}>
                                            <label>Barcode Line Width (Multiplier)</label>
                                            <select name="barcodeWidth" value={settings.barcodeWidth} onChange={handleChange}>
                                                <option value="1">1.0 (Thin)</option>
                                                <option value="1.25">1.25</option>
                                                <option value="1.5">1.5 (Standard)</option>
                                                <option value="1.75">1.75</option>
                                                <option value="2">2.0 (Thick)</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Barcode Color</label>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <input type="color" name="barcodeColor" value={settings.barcodeColor} onChange={handleChange} style={{ padding: 0, border: 'none', width: '32px', height: '32px', cursor: 'pointer' }} />
                                                <input type="text" name="barcodeColor" value={settings.barcodeColor} onChange={handleChange} style={{ flex: 1, fontSize: '0.85rem' }} />
                                            </div>
                                        </div>

                                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                                            <input type="checkbox" id="showBarcodeValue" name="showBarcodeValue" checked={settings.showBarcodeValue} onChange={handleChange} />
                                            <label htmlFor="showBarcodeValue" style={{ cursor: 'pointer', margin: 0 }}>Draw text ID directly on barcode image</label>
                                        </div>
                                    </div>
                                )}

                                {/* 4. PRESETS & TEMPLATES TAB */}
                                {activeTab === 'templates' && (
                                    <div>
                                        <h3 style={{ marginTop: 0, borderBottom: '2px solid var(--primary)', paddingBottom: '6px', display: 'inline-block', fontSize: '1rem' }}>Templates Presets</h3>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                                            {savedTemplates.map(template => (
                                                <div 
                                                    key={template.id}
                                                    onClick={() => loadTemplate(template)}
                                                    style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        alignItems: 'center', 
                                                        padding: '12px', 
                                                        backgroundColor: 'var(--surface-container-high)', 
                                                        borderRadius: 'var(--radius-md)', 
                                                        border: '1px solid var(--outline-variant)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-container-highest)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-container-high)'; }}
                                                >
                                                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--on-surface)' }}>{template.name}</span>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        {!template.id.startsWith('preset-') && (
                                                            <button 
                                                                onClick={(e) => deleteTemplate(template.id, e)}
                                                                style={{ background: 'transparent', border: 'none', color: 'var(--error)', padding: '4px', cursor: 'pointer' }}
                                                            >
                                                                <span className="material-icons" style={{ fontSize: '18px' }}>delete</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button 
                                            onClick={handleTemplateSave}
                                            style={{ 
                                                marginTop: '20px', 
                                                width: '100%', 
                                                padding: '12px', 
                                                backgroundColor: 'transparent', 
                                                color: 'var(--primary)', 
                                                border: '1.5px dashed var(--primary)', 
                                                borderRadius: 'var(--radius-md)',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <span className="material-icons">bookmark_add</span> Save Current Layout
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer buttons */}
                <div style={{ padding: 'var(--spacing-16)', borderTop: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)', display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={handleSaveDefault}
                        className="action-btn"
                        style={{ flex: 1, backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                        <span className="material-icons" style={{ fontSize: '18px' }}>save</span> Save Default
                    </button>
                </div>
            </div>

            {/* RIGHT PANEL: LIVE LABEL PREVIEW */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Interactive Print Preview</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>
                        Physical Dimensions: {settings.width} × {settings.height}
                    </span>
                </div>

                <div 
                    style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        backgroundColor: 'var(--surface-container-high)', 
                        borderRadius: 'var(--radius-lg)', 
                        border: '1px dashed var(--outline-variant)',
                        padding: '32px',
                        overflow: 'auto'
                    }}
                >
                    {/* The Live Rendered CSS Label */}
                    <div 
                        style={{
                            width: `${previewWidth}px`,
                            height: `${previewHeight}px`,
                            padding: settings.padding,
                            backgroundColor: settings.bg,
                            color: settings.fontColor,
                            fontFamily: settings.fontFamily || 'Arial, sans-serif',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            boxSizing: 'border-box',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                            borderRadius: '2px',
                            border: `1px solid ${settings.borderColor}`,
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header text */}
                        <div 
                            style={{
                                fontFamily: settings.headerFontFamily,
                                fontSize: settings.headerFontSize,
                                fontWeight: settings.headerFontWeight,
                                borderBottom: `1px solid ${settings.borderColor}`,
                                paddingBottom: '3px',
                                marginBottom: '4px',
                                width: '100%',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                flexShrink: 0
                            }}
                        >
                            {settings.headerText}
                        </div>

                        {/* Product Name */}
                        <div 
                            style={{ 
                                fontSize: settings.nameFontSize, 
                                fontWeight: settings.nameFontWeight, 
                                margin: '2px 0',
                                width: '100%',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                flexShrink: 0
                            }}
                        >
                            Slim Fit Cotton Chinos
                        </div>

                        {/* Size Badge & Price */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', margin: '4px 0', flexShrink: 0 }}>
                            <div 
                                style={{ 
                                    fontSize: settings.sizeFontSize, 
                                    fontWeight: 'bold', 
                                    border: settings.sizeBorder ? `1px solid ${settings.borderColor}` : 'none', 
                                    display: 'inline-block', 
                                    padding: '1px 5px'
                                }}
                            >
                                SIZE: XL
                            </div>
                            
                            {settings.showPrice && (
                                <div style={{ fontSize: settings.priceFontSize, fontWeight: settings.priceFontWeight }}>
                                    {settings.pricePrefix}1,499
                                </div>
                            )}
                        </div>

                        {/* Barcode Area */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2px', flexShrink: 0 }}>
                            <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }}></canvas>
                            {settings.showProductId && !settings.showBarcodeValue && (
                                <div 
                                    style={{ 
                                        fontSize: settings.idFontSize, 
                                        fontFamily: 'monospace', 
                                        letterSpacing: settings.idLetterSpacing,
                                        marginTop: '2px',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    M1X-SAMPLE
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: 'var(--spacing-16) var(--spacing-20)' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)' }}>
                        <span className="material-icons" style={{ color: 'var(--primary)' }}>info</span>
                        <span>When printing from the <strong>Product Catalog</strong>, the system will apply these exact visual styles, dimensions, and layout configurations.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
