import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const rowVariants = {
    hidden: { opacity: 0, x: -12 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.18, ease: 'easeOut' } },
    exit: { opacity: 0, x: 12, transition: { duration: 0.12 } }
};

export default function PointOfSale({ catalog, setCatalog, salesLedger, setSalesLedger, customers, setCustomers, referrers, userProfile, invoiceSettings }) {
    const scannerInputRef = useRef(null);
    const [scanInput, setScanInput] = useState('');
    const [scanSuggestions, setScanSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [selectedReferrer, setSelectedReferrer] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    useEffect(() => { if (scannerInputRef.current) scannerInputRef.current.focus(); }, [invoiceItems]);

    const handleScanSubmit = (e) => {
        e.preventDefault();
        const scanned = scanInput.trim().toUpperCase();
        if (!scanned) return;
        
        let found = null, foundProduct = null;
        for (const p of catalog) {
            if (p.variants) {
                for (const v of p.variants) {
                    if (v.barcode === scanned) { found = v; foundProduct = p; break; }
                }
            }
        }

        if (found && foundProduct) {
            const existingInCart = invoiceItems.find(item => item.barcode === found.barcode);
            const currentQtyInCart = existingInCart ? existingInCart.qty : 0;
            if (currentQtyInCart + 1 > found.stockQty) {
                alert(`Cannot add! Only ${found.stockQty} pieces left for ${found.colorName} / ${found.size}.`);
            } else {
                setInvoiceItems(prev => {
                    if (existingInCart) return prev.map(item => item.barcode === found.barcode ? { ...item, qty: item.qty + 1 } : item);
                    return [...prev, { ...foundProduct, ...found, qty: 1 }];
                });
            }
        } else {
            alert(`Barcode ${scanned} not found in inventory.`);
        }
        setScanInput('');
        setShowSuggestions(false);
    };

    useEffect(() => {
        if (!scanInput) { setScanSuggestions([]); setShowSuggestions(false); return; }
        const query = scanInput.trim().toLowerCase();
        let matches = [];
        catalog.forEach(product => {
            if (product.variants) {
                product.variants.forEach(variant => {
                    if (variant.barcode.toLowerCase().includes(query) || (product.name && product.name.toLowerCase().includes(query)) || (variant.colorName && variant.colorName.toLowerCase().includes(query))) {
                        matches.push({ ...variant, productName: product.name, productId: product.id, productImage: product.images && product.images.length > 0 ? product.images[0] : null, sellPrice: product.sellPrice });
                    }
                });
            }
        });
        setScanSuggestions(matches.slice(0, 8));
        setShowSuggestions(matches.length > 0);
    }, [scanInput, catalog]);

    const handleSuggestionClick = (suggestion) => {
        const existingInCart = invoiceItems.find(item => item.barcode === suggestion.barcode);
        const currentQtyInCart = existingInCart ? existingInCart.qty : 0;
        if (currentQtyInCart + 1 > suggestion.stockQty) {
            alert(`Cannot add! Only ${suggestion.stockQty} pieces left for ${suggestion.colorName} / ${suggestion.size}.`);
        } else {
            setInvoiceItems(prev => {
                if (existingInCart) return prev.map(item => item.barcode === suggestion.barcode ? { ...item, qty: item.qty + 1 } : item);
                return [...prev, { id: suggestion.productId, name: suggestion.productName, images: suggestion.productImage ? [suggestion.productImage] : [], sellPrice: suggestion.sellPrice, ...suggestion, qty: 1 }];
            });
        }
        setScanInput(''); setShowSuggestions(false);
    };

    const updateQty = (barcode, delta) => {
        let variant = null;
        for (const p of catalog) {
            if (p.variants) {
                const v = p.variants.find(vv => vv.barcode === barcode);
                if (v) { variant = v; break; }
            }
        }
        setInvoiceItems(prev => prev.map(item => {
            if (item.barcode === barcode) {
                const newQty = item.qty + delta;
                if (variant && newQty > variant.stockQty) { alert(`Not enough stock! Only ${variant.stockQty} pieces available for ${variant.colorName} / ${variant.size}.`); return item; }
                return newQty > 0 ? { ...item, qty: newQty } : item;
            }
            return item;
        }));
    };

    const removeFromInvoice = (barcode) => setInvoiceItems(prev => prev.filter(item => item.barcode !== barcode));

    const subtotal = invoiceItems.reduce((sum, item) => sum + (Number(item.sellPrice) * item.qty), 0);
    const discountAmount = subtotal * (Number(discountPercentage) / 100);
    const grandTotal = subtotal - discountAmount;

    const completeSaleAndPrint = () => {
        if (invoiceItems.length === 0) { alert("Add items to the invoice first."); return; }
        const invoiceDate = new Date().toISOString();
        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
        
        if (customerName.trim() && customerPhone.trim()) {
            const existingCustomer = customers.find(c => c.phone === customerPhone.trim());
            if (!existingCustomer) {
                setCustomers([...customers, { id: Date.now(), name: customerName.trim(), phone: customerPhone.trim(), joinDate: invoiceDate }]);
            }
        }
        
        setSalesLedger([...salesLedger, { invoiceNo: invoiceNumber, date: invoiceDate, items: invoiceItems, subtotal, discountPercentage, discountAmount, grandTotal, referrer: selectedReferrer, customerName: customerName.trim(), customerPhone: customerPhone.trim() }]);

        const updatedCatalog = catalog.map(catItem => {
            if (!catItem.variants) return catItem;
            const newVariants = catItem.variants.map(variant => {
                const purchased = invoiceItems.find(i => i.barcode === variant.barcode);
                if (purchased) { return { ...variant, stockQty: Number(variant.stockQty) - purchased.qty }; }
                return variant;
            });
            return { ...catItem, variants: newVariants };
        });
        setCatalog(updatedCatalog);

        // --- DYNAMIC INVOICE GENERATION BASED ON DESIGNER SETTINGS --- //
        
        // Failsafe: Use defaults if settings haven't been initialized yet
        const safeSettings = {
            paperSize: invoiceSettings?.paperSize || '80mm',
            fontFamily: invoiceSettings?.fontFamily || 'monospace', // Add this line
            headerMessage: invoiceSettings?.headerMessage || 'Dealer Under Composition Scheme',
            footerMessage: invoiceSettings?.footerMessage || 'Thank you for shopping!',
            columns: invoiceSettings?.columns || { sno: true, item: true, variants: true, rate: true, qty: true, amount: true },
            tableStyle: invoiceSettings?.tableStyle || { borderWidth: 1, fontSize: 11, padding: 4 },
            customFields: invoiceSettings?.customFields || []
        };

        const printWindow = window.open('', '_blank', 'width=600,height=800');
        const storePhone = userProfile.phone || '';
        
        const paperWidth = safeSettings.paperSize === '58mm' ? '220px' : safeSettings.paperSize === 'A4' ? '100%' : '320px';
        const maxWidth = safeSettings.paperSize === 'A4' ? '800px' : 'none';
        const marginStyle = safeSettings.paperSize === 'A4' ? '0 auto' : '0';

        // Build Custom Fields HTML
        let customFieldsHTML = '';
        if (safeSettings.customFields && safeSettings.customFields.length > 0) {
            customFieldsHTML = `<div style="margin-bottom: 10px; border-bottom: 1px dashed #ccc; padding-bottom: 10px;">` + 
                safeSettings.customFields.map(f => `<div style="display: flex; justify-content: space-between; font-size: ${safeSettings.tableStyle.fontSize}px; margin: 2px 0;"><span>${f.label}:</span><span style="font-weight: bold;">${f.value}</span></div>`).join('') + 
            `</div>`;
        }

        // Build Dynamic Headers
        let thHTML = '';
        if (safeSettings.columns.sno) thHTML += `<th style="text-align:center; width: 20px; border-top: ${safeSettings.tableStyle.borderWidth}px solid #000; border-bottom: ${safeSettings.tableStyle.borderWidth}px solid #000; padding: ${safeSettings.tableStyle.padding}px 3px;">#</th>`;
        thHTML += `<th style="text-align:left; border-top: ${safeSettings.tableStyle.borderWidth}px solid #000; border-bottom: ${safeSettings.tableStyle.borderWidth}px solid #000; padding: ${safeSettings.tableStyle.padding}px 3px;">Item</th>`;
        if (safeSettings.columns.qty) thHTML += `<th style="text-align:center; border-top: ${safeSettings.tableStyle.borderWidth}px solid #000; border-bottom: ${safeSettings.tableStyle.borderWidth}px solid #000; padding: ${safeSettings.tableStyle.padding}px 3px;">Qty</th>`;
        if (safeSettings.columns.rate) thHTML += `<th style="text-align:right; border-top: ${safeSettings.tableStyle.borderWidth}px solid #000; border-bottom: ${safeSettings.tableStyle.borderWidth}px solid #000; padding: ${safeSettings.tableStyle.padding}px 3px;">Rate</th>`;
        thHTML += `<th style="text-align:right; border-top: ${safeSettings.tableStyle.borderWidth}px solid #000; border-bottom: ${safeSettings.tableStyle.borderWidth}px solid #000; padding: ${safeSettings.tableStyle.padding}px 3px;">Amount</th>`;

        // Build Dynamic Rows
        const itemRowsHTML = invoiceItems.map((item, i) => {
            let row = '<tr>';
            const tdStyle = `border-bottom: ${safeSettings.tableStyle.borderWidth}px solid #000; padding: ${safeSettings.tableStyle.padding}px 3px;`;
            
            if (safeSettings.columns.sno) row += `<td style="text-align:center; ${tdStyle}">${i + 1}</td>`;
            
            // Item + Variants logic
            let itemText = item.name;
            if (safeSettings.columns.variants && (item.colorName || item.size)) {
                itemText += `<br><span style="font-size:0.85em;color:#555;">${item.colorName || ''} ${item.size ? '/ ' + item.size : ''}</span>`;
            }
            row += `<td style="${tdStyle}">${itemText}</td>`;
            
            if (safeSettings.columns.qty) row += `<td style="text-align:center; ${tdStyle}">${item.qty}</td>`;
            if (safeSettings.columns.rate) row += `<td style="text-align:right; ${tdStyle}">&#8377;${Number(item.sellPrice).toFixed(0)}</td>`;
            row += `<td style="text-align:right; font-weight:bold; ${tdStyle}">&#8377;${(item.sellPrice * item.qty).toFixed(2)}</td>`;
            
            row += '</tr>';
            return row;
        }).join('');

        printWindow.document.write(`
            <html><head><title>Invoice ${invoiceNumber}</title>
            <style>
                @page { margin: 6mm; }
                body { 
                    font-family: ${safeSettings.fontFamily}; /* Update this line */
                    margin: ${marginStyle};
                    padding: 10px; 
                    width: ${paperWidth}; 
                    max-width: ${maxWidth};
                    color: #000; 
                    font-size: ${safeSettings.tableStyle.fontSize}px; 
                }
                .top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; font-weight: bold; }
                .store-name { text-align: center; font-size: 22px; font-weight: bold; margin: 2px 0 3px; }
                hr.dash { border: none; border-top: 1px dashed #000; margin: 7px 0; }
                table.items { width: 100%; border-collapse: collapse; margin-top: 4px; }
                table.totals { width: 100%; border-collapse: collapse; margin-top: 4px; }
                .grand-row td { font-size: 1.2em; font-weight: bold; border-top: 2px solid #000; padding-top: 5px; }
                .footer { text-align: center; margin-top: 14px; color: #555; white-space: pre-line; }
            </style></head>
            <body>
                <div class="top-bar">
                    <div>${userProfile.gstNumber ? 'GSTIN: ' + userProfile.gstNumber : ''}</div>
                    <div>Bill No: ${invoiceNumber}</div>
                </div>
                ${safeSettings.headerMessage ? `<div style="text-align: center; font-size: 0.9em;"><b>${safeSettings.headerMessage}</b></div>` : ''}
                <div class="store-name">${userProfile.name || 'STORE NAME'}</div>
                <div style="text-align: center;">
                    ${userProfile.address}<br/>
                    ${storePhone ? `Ph: ${storePhone}` : ''}
                </div>
                <hr class="dash">
                <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                    <span>Date: ${new Date().toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
                    ${selectedReferrer ? `<span>Ref: ${selectedReferrer}</span>` : ''}
                </div>
                ${customerName.trim() ? `<div style="display: flex; justify-content: space-between; margin: 3px 0;"><span>Customer: ${customerName.trim()}</span>${customerPhone.trim() ? `<span>${customerPhone.trim()}</span>` : ''}</div>` : ''}
                <hr class="dash">
                
                ${customFieldsHTML}

                <table class="items">
                    <thead><tr>${thHTML}</tr></thead>
                    <tbody>${itemRowsHTML}</tbody>
                </table>
                <hr class="dash">
                <table class="totals">
                    <tr><td>Subtotal</td><td style="text-align:right">&#8377;${subtotal.toFixed(2)}</td></tr>
                    ${discountPercentage > 0 ? `<tr><td>Discount (${discountPercentage}%)</td><td style="text-align:right;color:#c00;">-&#8377;${discountAmount.toFixed(2)}</td></tr>` : ''}
                    <tr class="grand-row"><td>GRAND TOTAL</td><td style="text-align:right">&#8377;${grandTotal.toFixed(2)}</td></tr>
                </table>
                <hr class="dash">
                <div class="footer">${safeSettings.footerMessage}</div>
                <script>window.onload = function() { window.print(); }<\/script>
            </body></html>
        `);
        printWindow.document.close();
        setInvoiceItems([]); setDiscountPercentage(0); setSelectedReferrer(''); setCustomerName(''); setCustomerPhone('');
    };

    return (
        <div className="pos-layout">
            <div className="pos-main">
                <div className="card" style={{ position: 'relative' }}>
                    <form onSubmit={handleScanSubmit} autoComplete="off">
                        <label style={{ fontSize: '1.125rem', color: 'var(--success)', fontWeight: '600' }}>Scanner Input</label>
                        <input ref={scannerInputRef} type="text" className="scanner-input" placeholder="Scan barcode or search..." value={scanInput} onChange={e => setScanInput(e.target.value)} onFocus={() => { if (scanSuggestions.length > 0) setShowSuggestions(true); }} onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} style={{ position: 'relative', zIndex: 2 }} />
                        {showSuggestions && scanSuggestions.length > 0 && (
                            <div style={{ position: 'absolute', top: '70px', left: 0, right: 0, background: 'var(--surface-container-highest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 10, maxHeight: '320px', overflowY: 'auto' }}>
                                {scanSuggestions.map((s, idx) => (
                                    <div key={s.barcode} onMouseDown={() => handleSuggestionClick(s)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', cursor: 'pointer', borderBottom: idx !== scanSuggestions.length - 1 ? '1px solid var(--outline-variant)' : 'none', background: 'var(--surface-container-lowest)' }}>
                                        {s.productImage ? (<img src={s.productImage} alt="preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />) : (<div style={{ width: '48px', height: '48px', background: '#f3f3f3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>)}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600 }}>{s.productName}</div>
                                            <div style={{ fontSize: '0.95em', color: '#888' }}>Color: {s.colorName} | Size: {s.size}</div>
                                        </div>
                                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{s.sellPrice}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </form>
                </div>
                <div className="card">
                    <h3 style={{ marginTop: 0, marginBottom: 'var(--spacing-16)' }}>Current Order</h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="data-table">
                            <thead><tr><th>Product</th><th>Color</th><th>Size</th><th>Stock</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr></thead>
                            <tbody>
                                <AnimatePresence>
                                {invoiceItems.length === 0 ? (<tr><td colSpan="8" style={{ textAlign: 'center', padding: 'var(--spacing-20)' }}>No items scanned yet.</td></tr>) : (
                                    invoiceItems.map(item => {
                                        const dbProduct = catalog.find(c => c.id === item.id);
                                        const variant = dbProduct?.variants?.find(v => v.barcode === item.barcode);
                                        const stockLeft = variant ? variant.stockQty - item.qty : 0;
                                        return (
                                            <motion.tr key={item.barcode} variants={rowVariants} initial="hidden" animate="visible" exit="exit">
                                                <td style={{ fontWeight: '600' }}>{item.name}<br /><small style={{ color: 'var(--on-surface-variant)' }}>{item.id}</small></td>
                                                <td>{item.colorName}</td>
                                                <td><span className="size-badge">{item.size}</span></td>
                                                <td style={{ color: stockLeft <= 2 ? 'var(--error)' : 'var(--on-surface-variant)' }}>{stockLeft}</td>
                                                <td>₹{item.sellPrice}</td>
                                                <td><div className="qty-controls"><button className="qty-btn" onClick={() => updateQty(item.barcode, -1)}>-</button><span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{item.qty}</span><button className="qty-btn" onClick={() => updateQty(item.barcode, 1)}>+</button></div></td>
                                                <td style={{ fontWeight: 'bold' }}>₹{(item.sellPrice * item.qty).toFixed(2)}</td>
                                                <td><button className="btn-sm btn-delete" onClick={() => removeFromInvoice(item.barcode)}><span className="material-icons">delete</span></button></td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="pos-sidebar">
                <div>
                    <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>Bill Summary</h3>
                    <div className="totals-row"><span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span></div>
                    <div style={{ marginTop: 'var(--spacing-16)', marginBottom: 'var(--spacing-16)' }}>
                        <label style={{ fontSize: '0.875rem' }}>Discount (%)</label>
                        <input type="number" min="0" max="100" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} style={{ textAlign: 'right', marginTop: 'var(--spacing-4)' }} />
                    </div>
                    {discountPercentage > 0 && (<div className="totals-row" style={{ color: 'var(--success)' }}><span>Discount Amount:</span><span>-₹{discountAmount.toFixed(2)}</span></div>)}
                    <div style={{ marginTop: 'var(--spacing-16)', marginBottom: 'var(--spacing-16)' }}>
                        <label style={{ fontSize: '0.875rem' }}>Customer Name</label>
                        <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Optional" style={{ marginTop: 'var(--spacing-4)' }} />
                    </div>
                    <div style={{ marginTop: 'var(--spacing-16)', marginBottom: 'var(--spacing-16)' }}>
                        <label style={{ fontSize: '0.875rem' }}>Customer Phone</label>
                        <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Optional" style={{ marginTop: 'var(--spacing-4)' }} />
                    </div>
                    <div style={{ marginTop: 'var(--spacing-16)', marginBottom: 'var(--spacing-16)' }}>
                        <label style={{ fontSize: '0.875rem' }}>Refer by</label>
                        <select value={selectedReferrer} onChange={(e) => setSelectedReferrer(e.target.value)} style={{ marginTop: 'var(--spacing-4)' }}>
                            <option value="">Select Referrer (Optional)</option>
                            {referrers.map((referrer, index) => (<option key={index} value={referrer.name}>{referrer.name}</option>))}
                        </select>
                    </div>
                    <div className="totals-row grand-total"><span>Total:</span><span>₹{grandTotal.toFixed(2)}</span></div>
                </div>
                <button className="action-btn" style={{ backgroundColor: 'var(--success)', color: 'white', padding: 'var(--spacing-16)' }} onClick={completeSaleAndPrint}>
                    <span className="material-icons">check_circle</span> Complete Sale & Print
                </button>
            </div>
        </div>
    );
}