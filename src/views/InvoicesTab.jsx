import React, { useState, useMemo } from 'react';

export default function InvoicesTab({ salesLedger, invoiceSettings, userProfile }) {
    const printInvoice = (invoice) => {
        const safeSettings = invoiceSettings || {
            paperSize: '80mm',
            fontFamily: 'monospace',
            fontColor: '#000000',
            logo: null,
            logoHeight: 50,
            logoAlign: 'center',
            headerMessage: 'Dealer Under Composition Scheme',
            footerMessage: 'Thank you for shopping with us!',
            columns: { sno: true, item: true, variants: true, rate: true, qty: true, amount: true },
            tableStyle: { borderWidth: 1, fontSize: 11, padding: 4 }
        };

        const printWindow = window.open('', '_blank', 'width=600,height=800');
        const storePhone = userProfile?.phone || '';
        
        let paperWidth = '320px';
        let maxWidth = 'none';
        let marginStyle = '0';
        
        switch (safeSettings.paperSize) {
            case '58mm':
                paperWidth = '220px';
                maxWidth = '220px';
                marginStyle = '0';
                break;
            case '80mm':
                paperWidth = '320px';
                maxWidth = '320px';
                marginStyle = '0';
                break;
            case '100mm':
                paperWidth = '400px';
                maxWidth = '400px';
                marginStyle = '0';
                break;
            case 'A5':
                paperWidth = '100%';
                maxWidth = '540px';
                marginStyle = '0 auto';
                break;
            case 'A4':
                paperWidth = '100%';
                maxWidth = '800px';
                marginStyle = '0 auto';
                break;
            case 'Letter':
            case 'Legal':
                paperWidth = '100%';
                maxWidth = '820px';
                marginStyle = '0 auto';
                break;
            default:
                paperWidth = '320px';
                maxWidth = 'none';
                marginStyle = '0';
        }

        // Build Custom Fields HTML
        let customFieldsHTML = '';
        if (safeSettings.customFields && safeSettings.customFields.length > 0) {
            customFieldsHTML = `<div style="margin-bottom: 10px; border-bottom: 1px dashed ${safeSettings.fontColor}; padding-bottom: 10px;">` + 
                safeSettings.customFields.map(f => `<div style="display: flex; justify-content: space-between; font-size: ${safeSettings.tableStyle.fontSize}px; margin: 2px 0;"><span>${f.label}:</span><span style="font-weight: bold;">${f.value}</span></div>`).join('') + 
            `</div>`;
        }

        // Build Dynamic Headers
        let thHTML = '';
        if (safeSettings.columns.sno) thHTML += `<th style="text-align:center; width: 20px; border-top: ${safeSettings.tableStyle.borderWidth}px solid ${safeSettings.fontColor}; border-bottom: ${safeSettings.tableStyle.borderWidth}px solid ${safeSettings.fontColor}; padding: ${safeSettings.tableStyle.padding}px 3px;">#</th>`;
        thHTML += `<th style="text-align:left; border-top: ${safeSettings.tableStyle.borderWidth}px solid ${safeSettings.fontColor}; border-bottom: ${safeSettings.tableStyle.borderWidth}px solid ${safeSettings.fontColor}; padding: ${safeSettings.tableStyle.padding}px 3px;">Item</th>`;
        if (safeSettings.columns.qty) thHTML += `<th style="text-align:center; border-top: ${safeSettings.tableStyle.borderWidth}px solid ${safeSettings.fontColor}; border-bottom: ${safeSettings.tableStyle.borderWidth}px solid ${safeSettings.fontColor}; padding: ${safeSettings.tableStyle.padding}px 3px;">Qty</th>`;
        if (safeSettings.columns.rate) thHTML += `<th style="text-align:right; border-top: ${safeSettings.tableStyle.borderWidth}px solid ${safeSettings.fontColor}; border-bottom: ${safeSettings.tableStyle.borderWidth}px solid ${safeSettings.fontColor}; padding: ${safeSettings.tableStyle.padding}px 3px;">Rate</th>`;
        thHTML += `<th style="text-align:right; border-top: ${safeSettings.tableStyle.borderWidth}px solid ${safeSettings.fontColor}; border-bottom: ${safeSettings.tableStyle.borderWidth}px solid ${safeSettings.fontColor}; padding: ${safeSettings.tableStyle.padding}px 3px;">Amount</th>`;

        // Compute GST breakdowns
        let totalTaxableValue = 0;
        let totalGstAmount = 0;
        let totalCgstAmount = 0;
        let totalSgstAmount = 0;
        let hasGstItems = false;

        invoice.items.forEach(item => {
            const qty = Number(item.qty) || 0;
            const sellPrice = Number(item.sellPrice) || 0;
            const itemSubtotal = sellPrice * qty;
            const itemDiscount = itemSubtotal * (Number(invoice.discountPercentage) / 100);
            const itemGrandTotal = itemSubtotal - itemDiscount;

            if (item.gstType === 'GST' && Number(item.gstRate) > 0) {
                hasGstItems = true;
                const rate = Number(item.gstRate);
                const taxable = itemGrandTotal / (1 + rate / 100);
                const tax = itemGrandTotal - taxable;
                totalTaxableValue += taxable;
                totalGstAmount += tax;
                totalCgstAmount += tax / 2;
                totalSgstAmount += tax / 2;
            } else {
                totalTaxableValue += itemGrandTotal;
            }
        });

        // Build Dynamic Rows
        const itemRowsHTML = invoice.items.map((item, i) => {
            let row = '<tr>';
            const tdStyle = `border-bottom: ${safeSettings.tableStyle.borderWidth}px solid ${safeSettings.fontColor}; padding: ${safeSettings.tableStyle.padding}px 3px;`;
            
            if (safeSettings.columns.sno) row += `<td style="text-align:center; ${tdStyle}">${i + 1}</td>`;
            
            let itemText = item.brand ? `[${item.brand}] ${item.name}` : item.name;
            if (item.hsnCode) {
                itemText += ` <span style="font-size:0.85em;opacity:0.8;">[HSN: ${item.hsnCode}]</span>`;
            }
            if (item.gstType === 'GST' && Number(item.gstRate) > 0) {
                itemText += ` <span style="font-size:0.8em;opacity:0.8;">[GST: ${item.gstRate}%]</span>`;
            }
            if (safeSettings.columns.variants && (item.colorName || item.size)) {
                itemText += `<br><span style="font-size:0.85em;opacity:0.7;">${item.colorName || ''} ${item.size ? '/ ' + item.size : ''}</span>`;
            }
            row += `<td style="${tdStyle}">${itemText}</td>`;
            
            if (safeSettings.columns.qty) row += `<td style="text-align:center; ${tdStyle}">${item.qty}</td>`;
            if (safeSettings.columns.rate) row += `<td style="text-align:right; ${tdStyle}">&#8377;${Number(item.sellPrice).toFixed(0)}</td>`;
            row += `<td style="text-align:right; font-weight:bold; ${tdStyle}">&#8377;${(item.sellPrice * item.qty).toFixed(2)}</td>`;
            
            row += '</tr>';
            return row;
        }).join('');

        printWindow.document.write(`
            <html><head><title>Invoice ${invoice.invoiceNo}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Manrope:wght@200..800&family=Montserrat:wght@100..900&family=Open+Sans:wght@300..800&family=Outfit:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:wght@100..900&family=Roboto+Mono:wght@100..700&family=Lora:ital,wght@0,400..700;1,400..700&family=Ubuntu:wght@300..700&display=swap" rel="stylesheet">
            <style>
                @page { margin: 6mm; }
                body { 
                    font-family: ${safeSettings.fontFamily};
                    margin: ${marginStyle};
                    padding: 10px; 
                    width: ${paperWidth}; 
                    max-width: ${maxWidth};
                    color: ${safeSettings.fontColor}; 
                    font-size: ${safeSettings.tableStyle.fontSize}px; 
                }
                .top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; font-weight: bold; }
                .store-name { text-align: center; font-size: 22px; font-weight: bold; margin: 2px 0 3px; }
                hr.dash { border: none; border-top: 1px dashed ${safeSettings.fontColor}; margin: 7px 0; }
                table.items { width: 100%; border-collapse: collapse; margin-top: 4px; }
                table.totals { width: 100%; border-collapse: collapse; margin-top: 4px; }
                .grand-row td { font-size: 1.2em; font-weight: bold; border-top: 2px solid ${safeSettings.fontColor}; padding-top: 5px; }
                .footer { text-align: center; margin-top: 14px; color: ${safeSettings.fontColor}; opacity: 0.8; white-space: pre-line; }
            </style></head>
            <body>
                \${safeSettings.logo ? \`<div style="text-align: \${safeSettings.logoAlign || 'center'}; margin-bottom: 10px;"><img src="\${safeSettings.logo}" style="height: \${safeSettings.logoHeight || 50}px; object-fit: contain;" /></div>\` : ''}
                <div class="top-bar">
                    <div>\${userProfile?.gstNumber ? 'GSTIN: ' + userProfile.gstNumber : ''}</div>
                    <div>Bill No: \${invoice.invoiceNo}</div>
                </div>
                \${safeSettings.headerMessage ? \`<div style="text-align: center; font-size: 0.9em;"><b>\${safeSettings.headerMessage}</b></div>\` : ''}
                <div class="store-name">\${userProfile?.name || 'STORE NAME'}</div>
                <div style="text-align: center;">
                    \${userProfile?.address || ''}<br/>
                    \${storePhone ? \`Ph: \${storePhone}\` : ''}
                </div>
                <hr class="dash">
                <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                    <span>Date: \${new Date(invoice.date).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
                    \${invoice.referrer ? \`<span>Ref: \${invoice.referrer}</span>\` : ''}
                </div>
                \${invoice.customerName ? \`<div style="display: flex; justify-content: space-between; margin: 3px 0;"><span>Customer: \${invoice.customerName}</span>\${invoice.customerPhone ? \`<span>\${invoice.customerPhone}</span>\` : ''}</div>\` : ''}
                <hr class="dash">
                
                \${customFieldsHTML}

                <table class="items">
                    <thead><tr>\${thHTML}</tr></thead>
                    <tbody>\${itemRowsHTML}</tbody>
                </table>
                <hr class="dash">
                <table class="totals">
                    <tr><td>Subtotal</td><td style="text-align:right">&#8377;\${invoice.subtotal.toFixed(2)}</td></tr>
                    \${invoice.discountPercentage > 0 ? \`<tr><td>Discount (\${invoice.discountPercentage}%)</td><td style="text-align:right;color:#c00;">-&#8377;\${invoice.discountAmount.toFixed(2)}</td></tr>\` : ''}
                    \${hasGstItems ? \`
                    <tr><td>Taxable Value</td><td style="text-align:right">&#8377;\${totalTaxableValue.toFixed(2)}</td></tr>
                    <tr><td>CGST</td><td style="text-align:right">&#8377;\${totalCgstAmount.toFixed(2)}</td></tr>
                    <tr><td>SGST</td><td style="text-align:right">&#8377;\${totalSgstAmount.toFixed(2)}</td></tr>
                    \` : ''}
                    <tr class="grand-row"><td>GRAND TOTAL</td><td style="text-align:right">&#8377;\${invoice.grandTotal.toFixed(2)}</td></tr>
                    \${invoice.paymentType === 'partial' ? \`
                    <tr><td>Amount Paid</td><td style="text-align:right">&#8377;\${invoice.amountPaid.toFixed(2)}</td></tr>
                    <tr style="color:#c00;font-weight:bold;"><td>BALANCE DUE</td><td style="text-align:right">&#8377;\${invoice.balanceDue.toFixed(2)}</td></tr>
                    \` : ''}
                </table>
                <hr class="dash">
                <div class="footer">\${safeSettings.footerMessage}</div>
                <script>window.onload = function() { window.print(); }<\/script>
            </body></html>
        `);
        printWindow.document.close();
    };

    const mailInvoice = (invoice) => {
        const storeName = userProfile?.name || 'M1x Store';
        const recipient = prompt(`Enter recipient email address for Customer ${invoice.customerName || ''}:`, '');
        if (recipient === null) return;

        const subject = encodeURIComponent(`Invoice ${invoice.invoiceNo} from ${storeName}`);
        const itemsSummary = invoice.items.map(item => {
            const variantText = (item.colorName || item.size) ? ` (${item.colorName || ''} ${item.size || ''})` : '';
            return `${item.name}${variantText} x ${item.qty} - ₹${(item.sellPrice * item.qty).toFixed(2)}`;
        }).join('\n');

        const bodyText = `Dear Customer,

Here is the invoice summary for your recent purchase at ${storeName}:

Invoice No: ${invoice.invoiceNo}
Date: ${new Date(invoice.date).toLocaleDateString('en-IN')}

Items:
${itemsSummary}

Subtotal: ₹${invoice.subtotal.toFixed(2)}
Discount: ${invoice.discountPercentage > 0 ? `${invoice.discountPercentage}% (-₹${invoice.discountAmount.toFixed(2)})` : 'None'}
Grand Total: ₹${invoice.grandTotal.toFixed(2)}
Amount Paid: ₹${(invoice.amountPaid !== undefined ? invoice.amountPaid : invoice.grandTotal).toFixed(2)}
Balance Due: ₹${(invoice.balanceDue !== undefined ? invoice.balanceDue : 0).toFixed(2)}

Thank you for shopping with us!

Regards,
${storeName}`;

        const body = encodeURIComponent(bodyText);
        window.open(`mailto:${recipient}?subject=${subject}&body=${body}`, '_blank');
    };
    const [invoiceFilterDay, setInvoiceFilterDay] = useState('');
    const [invoiceFilterReferrer, setInvoiceFilterReferrer] = useState('');

    // Get unique days and referrers from sales ledger
    const uniqueDays = useMemo(() => {
        const days = new Set();
        salesLedger.forEach(sale => {
            const date = new Date(sale.date).toLocaleDateString('en-IN');
            days.add(date);
        });
        return Array.from(days).sort().reverse();
    }, [salesLedger]);

    const uniqueReferrersInvoices = useMemo(() => {
        const names = new Set();
        salesLedger.forEach(sale => {
            if (sale.referrer) names.add(sale.referrer);
        });
        return Array.from(names).sort();
    }, [salesLedger]);

    // Filter invoices
    const filteredInvoices = useMemo(() => {
        return salesLedger.filter(sale => {
            const saleDay = new Date(sale.date).toLocaleDateString('en-IN');
            const matchDay = !invoiceFilterDay || saleDay === invoiceFilterDay;
            const matchReferrer = !invoiceFilterReferrer || sale.referrer === invoiceFilterReferrer;
            return matchDay && matchReferrer;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [salesLedger, invoiceFilterDay, invoiceFilterReferrer]);

    return (
        <div className="card">
            <h2 style={{ marginTop: 0, marginBottom: 'var(--spacing-16)' }}>Invoices</h2>

            {/* Filters Section */}
            <div style={{ backgroundColor: 'var(--surface-container-low)', padding: 'var(--spacing-20)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-20)', boxShadow: 'var(--shadow-sm)' }}>
                <h4 style={{ color: 'var(--secondary)', marginTop: 0, marginBottom: 'var(--spacing-16)' }}>
                    <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: 'var(--spacing-8)' }}>filter_list</span>
                    Filters
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-16)' }}>
                    <div>
                        <label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Filter by Day</label>
                        <select value={invoiceFilterDay} onChange={(e) => setInvoiceFilterDay(e.target.value)} style={{ width: '100%', padding: 'var(--spacing-8)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
                            <option value="">All Days</option>
                            {uniqueDays.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Filter by Referrer</label>
                        <select value={invoiceFilterReferrer} onChange={(e) => setInvoiceFilterReferrer(e.target.value)} style={{ width: '100%', padding: 'var(--spacing-8)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
                            <option value="">All Referrers</option>
                            {uniqueReferrersInvoices.map(referrer => <option key={referrer} value={referrer}>{referrer}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            {filteredInvoices.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: 'var(--spacing-32)' }}>
                    <p>No invoices found for the selected filters.</p>
                </div>
            ) : (
                <div style={{ overflow: 'auto', boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-container-low)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--on-surface)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--primary-container)' }}>
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'left', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Invoice No.</th>
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'left', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Date & Time</th>
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'left', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Referrer</th>
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'left', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Customer</th>
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'right', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Subtotal (₹)</th>
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'right', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Discount</th>
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'right', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Grand Total (₹)</th>
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'right', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Paid (₹)</th>
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'right', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Due (₹)</th>
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'center', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Status</th>
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'center', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Items</th>
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'center', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((invoice, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', color: 'var(--primary)', fontWeight: '600', fontFamily: 'monospace' }}>{invoice.invoiceNo}</td>
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', color: 'var(--on-surface)', fontSize: '0.875rem' }}>
                                        {new Date(invoice.date).toLocaleDateString('en-IN')} {new Date(invoice.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', color: 'var(--secondary)', fontWeight: '500' }}>{invoice.referrer || '-'}</td>
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', color: 'var(--on-surface)', fontSize: '0.875rem' }}>{invoice.customerName || '-'}</td>
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', color: 'var(--on-surface)', textAlign: 'right' }}>₹{invoice.subtotal.toFixed(2)}</td>
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', color: invoice.discountPercentage > 0 ? 'var(--success)' : 'var(--on-surface)', textAlign: 'right' }}>
                                        {invoice.discountPercentage > 0 ? `${invoice.discountPercentage}% (-₹${invoice.discountAmount.toFixed(2)})` : 'None'}
                                    </td>
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', color: 'var(--primary)', fontWeight: 'bold', textAlign: 'right' }}>₹{invoice.grandTotal.toFixed(2)}</td>
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', color: 'var(--on-surface)', textAlign: 'right' }}>
                                        ₹{(invoice.amountPaid !== undefined ? invoice.amountPaid : invoice.grandTotal).toFixed(2)}
                                    </td>
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', color: (invoice.balanceDue > 0 ? 'var(--error)' : 'var(--on-surface)'), fontWeight: invoice.balanceDue > 0 ? '600' : 'normal', textAlign: 'right' }}>
                                        ₹{(invoice.balanceDue !== undefined ? invoice.balanceDue : 0).toFixed(2)}
                                    </td>
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'center' }}>
                                        {invoice.status === 'VOID' ? (
                                            <span style={{ color: 'var(--error)', backgroundColor: 'var(--error-container)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>VOIDED</span>
                                        ) : invoice.status === 'RETURNED' ? (
                                            <span style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-container)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>RETURNED</span>
                                        ) : invoice.balanceDue > 0 ? (
                                            <span style={{ color: 'var(--error)', backgroundColor: 'var(--error-container)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>DUE</span>
                                        ) : (
                                            <span style={{ color: 'var(--success)', backgroundColor: 'var(--success-container)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>PAID</span>
                                        )}
                                    </td>
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', color: 'var(--on-surface-variant)', textAlign: 'center', fontSize: '0.875rem' }}>{invoice.items.length}</td>
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                                            <button 
                                                onClick={() => printInvoice(invoice)} 
                                                title="Download / Print Invoice" 
                                                style={{ 
                                                    background: 'var(--primary-container)', 
                                                    border: 'none', 
                                                    cursor: 'pointer', 
                                                    color: 'var(--on-primary-container)', 
                                                    padding: '6px', 
                                                    borderRadius: 'var(--radius-sm)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.15s ease'
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.95)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
                                            >
                                                <span className="material-icons" style={{ fontSize: '18px' }}>download</span>
                                            </button>
                                            <button 
                                                onClick={() => mailInvoice(invoice)} 
                                                title="Mail Invoice Summary" 
                                                style={{ 
                                                    background: 'var(--success-container)', 
                                                    border: 'none', 
                                                    cursor: 'pointer', 
                                                    color: 'var(--success)', 
                                                    padding: '6px', 
                                                    borderRadius: 'var(--radius-sm)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.15s ease'
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.95)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
                                            >
                                                <span className="material-icons" style={{ fontSize: '18px' }}>mail</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div style={{ marginTop: 'var(--spacing-20)', padding: 'var(--spacing-16)', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ marginTop: 0, color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
                    <strong>Total Invoices:</strong> {filteredInvoices.length} / {salesLedger.length}
                </p>
            </div>
        </div>
    );
}