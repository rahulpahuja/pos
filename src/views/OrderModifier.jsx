import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderModifier({ salesLedger, setSalesLedger, catalog, setCatalog, parties, setParties }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // list, details, return-flow
    
    // States for return flow
    const [returnQuantities, setReturnQuantities] = useState({}); // { barcode: qty_to_return }
    
    // Filters sales ledger by invoice number, customer name, or customer phone
    const filteredInvoices = salesLedger.filter(sale => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            sale.invoiceNo.toLowerCase().includes(q) ||
            (sale.customerName && sale.customerName.toLowerCase().includes(q)) ||
            (sale.customerPhone && sale.customerPhone.includes(q))
        );
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    // --- STOCK RESTORATION HELPER ---
    const restoreStock = (itemsToRestore) => {
        setCatalog(prevCatalog => {
            return prevCatalog.map(product => {
                if (!product.variants) return product;
                
                let productUpdated = false;
                const updatedVariants = product.variants.map(variant => {
                    const match = itemsToRestore.find(item => item.barcode === variant.barcode);
                    if (match) {
                        productUpdated = true;
                        return {
                            ...variant,
                            stockQty: Number(variant.stockQty) + Number(match.qty)
                        };
                    }
                    return variant;
                });
                
                return productUpdated ? { ...product, variants: updatedVariants } : product;
            });
        });
    };

    // --- PARTY CREDIT ADJUSTMENT HELPER ---
    const adjustPartyCredit = (customerPhone, invoiceNo, amountToReduce) => {
        if (!parties || !setParties || !customerPhone || amountToReduce <= 0) return;
        
        setParties(prevParties => {
            return prevParties.map(party => {
                if (party.phone !== customerPhone) return party;
                
                const newBalance = Math.max(0, party.balance - amountToReduce);
                const adjustmentTxn = {
                    id: `TXN-ADJ-${Date.now().toString().slice(-6)}`,
                    date: new Date().toISOString(),
                    type: 'adjustment',
                    invoiceNo: invoiceNo,
                    amount: 0,
                    paid: amountToReduce,
                    balanceDue: newBalance,
                    description: `Dues adjusted via Return/Void of Invoice ${invoiceNo}`
                };
                
                return {
                    ...party,
                    balance: newBalance,
                    history: [adjustmentTxn, ...party.history]
                };
            });
        });
    };

    // --- VOID INVOICE HANDLER ---
    const handleVoidInvoice = (invoice) => {
        if (!window.confirm(`Are you sure you want to completely VOID Invoice ${invoice.invoiceNo}? This action is irreversible, and all items will be returned to stock.`)) {
            return;
        }

        // 1. Restore inventory levels for all active (non-returned) items in the invoice
        const activeItemsToRestore = invoice.items.map(item => {
            // Find if some quantities of this item were already returned
            const alreadyReturned = (invoice.returnedItems || []).find(r => r.barcode === item.barcode);
            const returnedQty = alreadyReturned ? alreadyReturned.qty : 0;
            const remainingQty = item.qty - returnedQty;
            return { barcode: item.barcode, qty: remainingQty };
        }).filter(item => item.qty > 0);

        restoreStock(activeItemsToRestore);

        // 2. Adjust CRM outstanding dues if partial payment was recorded
        if (invoice.paymentType === 'partial' && invoice.balanceDue > 0 && invoice.customerPhone) {
            adjustPartyCredit(invoice.customerPhone, invoice.invoiceNo, invoice.balanceDue);
        }

        // 3. Mark the invoice as VOID in salesLedger
        setSalesLedger(prevLedger => {
            return prevLedger.map(sale => {
                if (sale.invoiceNo === invoice.invoiceNo) {
                    return {
                        ...sale,
                        status: 'VOID',
                        amountPaid: 0,
                        balanceDue: 0,
                        grandTotal: 0,
                        subtotal: 0,
                        discountAmount: 0,
                        voidedAt: new Date().toISOString()
                    };
                }
                return sale;
            });
        });

        alert(`✨ Invoice ${invoice.invoiceNo} successfully VOIDED! Stock has been returned.`);
        setSelectedInvoice(null);
        setViewMode('list');
    };

    // --- RETURN PROCESS FLOWS ---
    const startReturnFlow = (invoice) => {
        const initialQtys = {};
        invoice.items.forEach(item => {
            initialQtys[item.barcode] = 0; // default return qty is 0
        });
        setReturnQuantities(initialQtys);
        setViewMode('return-flow');
    };

    const handleQtyStepper = (barcode, direction, maxQty) => {
        setReturnQuantities(prev => {
            const current = prev[barcode] || 0;
            let next = direction === 'inc' ? current + 1 : current - 1;
            next = Math.max(0, Math.min(maxQty, next));
            return { ...prev, [barcode]: next };
        });
    };

    const getReturnSummary = (invoice) => {
        let subtotal = 0;
        const itemsToReturnList = [];
        
        invoice.items.forEach(item => {
            const qtyToReturn = returnQuantities[item.barcode] || 0;
            if (qtyToReturn > 0) {
                subtotal += item.sellPrice * qtyToReturn;
                itemsToReturnList.push({
                    barcode: item.barcode,
                    name: item.name,
                    sellPrice: item.sellPrice,
                    colorName: item.colorName,
                    size: item.size,
                    qty: qtyToReturn
                });
            }
        });

        const discountPercentage = Number(invoice.discountPercentage) || 0;
        const discountAmount = subtotal * (discountPercentage / 100);
        const refundTotal = subtotal - discountAmount;

        return { subtotal, discountAmount, refundTotal, itemsToReturn: itemsToReturnList };
    };

    const confirmReturn = (invoice) => {
        const { refundTotal, itemsToReturn } = getReturnSummary(invoice);
        if (itemsToReturn.length === 0) {
            alert("Please select at least 1 item to return.");
            return;
        }

        if (!window.confirm(`Confirm return of selected items? Refund amount: ₹${refundTotal.toFixed(2)}`)) {
            return;
        }

        // 1. Restore stock to inventory
        restoreStock(itemsToReturn);

        // 2. Adjust Customer credit balance
        // If there was a balance due, apply the return value to outstanding due balance first.
        let appliedDuesReduction = 0;
        if (invoice.paymentType === 'partial' && invoice.balanceDue > 0 && invoice.customerPhone) {
            appliedDuesReduction = Math.min(invoice.balanceDue, refundTotal);
            adjustPartyCredit(invoice.customerPhone, invoice.invoiceNo, appliedDuesReduction);
        }

        // 3. Update the invoice in salesLedger
        setSalesLedger(prevLedger => {
            return prevLedger.map(sale => {
                if (sale.invoiceNo === invoice.invoiceNo) {
                    // Update returnedItems list
                    const updatedReturnedItems = [...(sale.returnedItems || [])];
                    itemsToReturn.forEach(item => {
                        const existing = updatedReturnedItems.find(r => r.barcode === item.barcode);
                        if (existing) {
                            existing.qty += item.qty;
                        } else {
                            updatedReturnedItems.push(item);
                        }
                    });

                    // Recalculate totals
                    const totalRefundedSoFar = (sale.refundAmount || 0) + refundTotal;
                    
                    // Check if all items in invoice are returned
                    const originalTotalQty = sale.items.reduce((sum, i) => sum + i.qty, 0);
                    const returnedTotalQty = updatedReturnedItems.reduce((sum, r) => sum + r.qty, 0);
                    const isAllReturned = returnedTotalQty >= originalTotalQty;

                    // Deduct from balance due first, then deduct from paid amount if remaining refund
                    const newBalanceDue = Math.max(0, sale.balanceDue - appliedDuesReduction);
                    const remainingRefund = refundTotal - appliedDuesReduction;
                    const newAmountPaid = Math.max(0, sale.amountPaid - remainingRefund);
                    const newGrandTotal = Math.max(0, sale.grandTotal - refundTotal);

                    return {
                        ...sale,
                        returnedItems: updatedReturnedItems,
                        refundAmount: totalRefundedSoFar,
                        balanceDue: newBalanceDue,
                        amountPaid: newAmountPaid,
                        grandTotal: newGrandTotal,
                        status: isAllReturned ? 'VOID' : 'RETURNED'
                    };
                }
                return sale;
            });
        });

        alert(`✨ Return processed successfully. Refund: ₹${refundTotal.toFixed(2)}`);
        setSelectedInvoice(null);
        setViewMode('list');
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: 'var(--spacing-24)' }}>
            
            {/* LEFT PANE: Scrollable Invoices List */}
            <div className="card" style={{ width: '420px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ padding: 'var(--spacing-20)', borderBottom: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-icons">find_replace</span> Returns & Modifiers
                    </h3>
                    <div style={{ position: 'relative', marginTop: 'var(--spacing-16)' }}>
                        <input 
                            type="text" 
                            className="search-bar" 
                            placeholder="Search by Bill No., Customer Name..." 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            style={{ margin: 0, width: '100%', paddingLeft: '40px' }}
                        />
                        <span className="material-icons" style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--on-surface-variant)', opacity: 0.6 }}>search</span>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-12)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
                    {filteredInvoices.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>
                            No matching invoices found in ledger.
                        </div>
                    ) : (
                        filteredInvoices.map(invoice => {
                            const isSelected = selectedInvoice?.invoiceNo === invoice.invoiceNo;
                            
                            // Visual Status configuration
                            let statusBadge = null;
                            if (invoice.status === 'VOID') {
                                statusBadge = <span style={{ color: 'var(--error)', backgroundColor: 'var(--error-container)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>VOIDED</span>;
                            } else if (invoice.status === 'RETURNED') {
                                statusBadge = <span style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-container)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>RETURNED</span>;
                            } else if (invoice.balanceDue > 0) {
                                statusBadge = <span style={{ color: 'var(--error)', backgroundColor: 'var(--error-container)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>DUE</span>;
                            } else {
                                statusBadge = <span style={{ color: 'var(--success)', backgroundColor: 'var(--success-container)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>PAID</span>;
                            }

                            return (
                                <div 
                                    key={invoice.invoiceNo}
                                    onClick={() => {
                                        setSelectedInvoice(invoice);
                                        setViewMode('details');
                                    }}
                                    style={{
                                        padding: '16px',
                                        borderRadius: 'var(--radius-md)',
                                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                                        backgroundColor: isSelected ? 'var(--primary-container)' : 'var(--surface-container-lowest)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 'bold', fontFamily: 'monospace', color: isSelected ? 'var(--on-primary-container)' : 'var(--primary)' }}>
                                            {invoice.invoiceNo}
                                        </span>
                                        {statusBadge}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>
                                        <span>{invoice.customerName || 'Walk-in Customer'}</span>
                                        <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>₹{invoice.grandTotal.toFixed(2)}</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', opacity: 0.8 }}>
                                        {new Date(invoice.date).toLocaleDateString('en-IN')} | {new Date(invoice.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* RIGHT PANE: Details & Action Flow */}
            <div className="card" style={{ flex: 1, margin: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                    {!selectedInvoice ? (
                        <motion.div 
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', gap: 'var(--spacing-16)' }}
                        >
                            <span className="material-icons" style={{ fontSize: '4.5rem', opacity: 0.3 }}>receipt_long</span>
                            <h3>Select an Invoice to Begin</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Search and click any bill on the left to initiate voiding or returns.</p>
                        </motion.div>
                    ) : viewMode === 'details' ? (
                        <motion.div 
                            key="details"
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                        >
                            {/* Invoice Header Details */}
                            <div style={{ padding: 'var(--spacing-20)', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: 'var(--primary)' }}>Bill Invoice {selectedInvoice.invoiceNo}</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                                        Purchased on: {new Date(selectedInvoice.date).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {selectedInvoice.status !== 'VOID' && (
                                        <>
                                            <button 
                                                onClick={() => startReturnFlow(selectedInvoice)} 
                                                className="btn-sm" 
                                                style={{ backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}
                                            >
                                                <span className="material-icons" style={{ fontSize: '1.1rem' }}>keyboard_return</span> Return Items
                                            </button>
                                            <button 
                                                onClick={() => handleVoidInvoice(selectedInvoice)} 
                                                className="btn-sm btn-delete" 
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}
                                            >
                                                <span className="material-icons" style={{ fontSize: '1.1rem' }}>cancel</span> Void Bill
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Details Body */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-20)' }}>
                                
                                {/* Info Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ padding: '16px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '4px' }}>Customer Info</div>
                                        <div>Name: <b>{selectedInvoice.customerName || 'Walk-in Customer'}</b></div>
                                        {selectedInvoice.customerPhone && <div style={{ marginTop: '4px' }}>Phone: {selectedInvoice.customerPhone}</div>}
                                        {selectedInvoice.referrer && <div style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Referred By: <b>{selectedInvoice.referrer}</b></div>}
                                    </div>
                                    <div style={{ padding: '16px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '4px' }}>Payment Info</div>
                                        <div>Payment Method: <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{selectedInvoice.paymentType}</span></div>
                                        <div style={{ marginTop: '4px' }}>Paid Amount: <b>₹{selectedInvoice.amountPaid.toFixed(2)}</b></div>
                                        {selectedInvoice.balanceDue > 0 && <div style={{ marginTop: '4px', color: 'var(--error)', fontWeight: 'bold' }}>Dues Balance: ₹{selectedInvoice.balanceDue.toFixed(2)}</div>}
                                        {selectedInvoice.refundAmount > 0 && <div style={{ marginTop: '4px', color: 'var(--primary)', fontWeight: 'bold' }}>Refunded So Far: ₹{selectedInvoice.refundAmount.toFixed(2)}</div>}
                                    </div>
                                </div>

                                {/* Items Table */}
                                <h4 style={{ marginBottom: '12px' }}>Purchased Items</h4>
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--on-surface)' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--outline-variant)', textAlign: 'left', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                            <th style={{ padding: '8px' }}>Product</th>
                                            <th style={{ padding: '8px' }}>Variant</th>
                                            <th style={{ padding: '8px', textAlign: 'right' }}>Price</th>
                                            <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                                            <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedInvoice.items.map((item, idx) => {
                                            const returnInfo = (selectedInvoice.returnedItems || []).find(r => r.barcode === item.barcode);
                                            const isReturned = returnInfo && returnInfo.qty > 0;
                                            
                                            return (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                                                    <td style={{ padding: '10px 8px' }}>
                                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                                        {isReturned && (
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--error)', backgroundColor: 'var(--error-container)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                                                                {returnInfo.qty} Returned
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '10px 8px', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                                                        {item.colorName || 'N/A'} {item.size ? '/ ' + item.size : ''}
                                                    </td>
                                                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>₹{item.sellPrice}</td>
                                                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                                        {item.qty} {isReturned && <span style={{ opacity: 0.6, fontSize: '0.85rem' }}>({item.qty - returnInfo.qty} Active)</span>}
                                                    </td>
                                                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold' }}>₹{(item.sellPrice * item.qty).toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Summary Ledger Dues */}
                                <div style={{ float: 'right', width: '250px', marginTop: '20px', borderTop: '2px solid var(--outline-variant)', paddingTop: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span>Subtotal:</span>
                                        <span>₹{selectedInvoice.subtotal.toFixed(2)}</span>
                                    </div>
                                    {selectedInvoice.discountPercentage > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--success)' }}>
                                            <span>Discount ({selectedInvoice.discountPercentage}%):</span>
                                            <span>-₹{selectedInvoice.discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)', marginTop: '8px', borderTop: '1px dashed var(--outline-variant)', paddingTop: '8px' }}>
                                        <span>Total:</span>
                                        <span>₹{selectedInvoice.grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="return-flow"
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                        >
                            {/* Return Flow Header */}
                            <div style={{ padding: 'var(--spacing-20)', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: 'var(--primary)' }}>Return Items: Invoice {selectedInvoice.invoiceNo}</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Choose quantities to return to inventory.</span>
                                </div>
                                <button 
                                    onClick={() => setViewMode('details')} 
                                    className="btn-sm" 
                                    style={{ backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface)', margin: 0 }}
                                >
                                    Cancel
                                </button>
                            </div>

                            {/* Stepper Inputs for Return */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-20)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--on-surface)' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--outline-variant)', textAlign: 'left', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                            <th style={{ padding: '8px' }}>Item</th>
                                            <th style={{ padding: '8px', textAlign: 'right' }}>Price</th>
                                            <th style={{ padding: '8px', textAlign: 'center' }}>Purchased</th>
                                            <th style={{ padding: '8px', textAlign: 'center' }}>Already Returned</th>
                                            <th style={{ padding: '8px', textAlign: 'center', width: '180px' }}>Quantity to Return</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedInvoice.items.map((item, idx) => {
                                            const returnInfo = (selectedInvoice.returnedItems || []).find(r => r.barcode === item.barcode);
                                            const returnedQty = returnInfo ? returnInfo.qty : 0;
                                            const availableToReturn = item.qty - returnedQty;
                                            
                                            const currentReturnQty = returnQuantities[item.barcode] || 0;

                                            return (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                                                    <td style={{ padding: '12px 8px' }}>
                                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                                                            {item.colorName || 'N/A'} {item.size ? '/ ' + item.size : ''}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>₹{item.sellPrice}</td>
                                                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>{item.qty}</td>
                                                    <td style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--error)' }}>{returnedQty}</td>
                                                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                        {availableToReturn <= 0 ? (
                                                            <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>Fully Returned</span>
                                                        ) : (
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                                <button 
                                                                    onClick={() => handleQtyStepper(item.barcode, 'dec', availableToReturn)}
                                                                    disabled={currentReturnQty <= 0}
                                                                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-high)', cursor: currentReturnQty <= 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                                                                >
                                                                    -
                                                                </button>
                                                                <span style={{ fontWeight: 'bold', fontSize: '1rem', width: '30px', display: 'inline-block', textAlign: 'center' }}>
                                                                    {currentReturnQty}
                                                                </span>
                                                                <button 
                                                                    onClick={() => handleQtyStepper(item.barcode, 'inc', availableToReturn)}
                                                                    disabled={currentReturnQty >= availableToReturn}
                                                                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-high)', cursor: currentReturnQty >= availableToReturn ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Return Flow Summary Footer */}
                            <div style={{ padding: 'var(--spacing-20)', backgroundColor: 'var(--surface-container-low)', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    {(() => {
                                        const { subtotal, discountAmount, refundTotal } = getReturnSummary(selectedInvoice);
                                        return (
                                            <div style={{ fontSize: '0.9rem' }}>
                                                <div>Return Subtotal: <b>₹{subtotal.toFixed(2)}</b></div>
                                                {discountAmount > 0 && <div style={{ color: 'var(--success)' }}>Discount Adj ({selectedInvoice.discountPercentage}%): <b>-₹{discountAmount.toFixed(2)}</b></div>}
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '4px' }}>
                                                    Estimated Refund: ₹{refundTotal.toFixed(2)}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                                <button 
                                    onClick={() => confirmReturn(selectedInvoice)} 
                                    className="action-btn" 
                                    style={{ backgroundColor: 'var(--success)', color: 'white', margin: 0, padding: '12px 24px', fontSize: '1rem' }}
                                >
                                    Confirm Return & Refund
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}