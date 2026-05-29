import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const generateNewId = () => `EXP-${Date.now().toString().slice(-6)}`;

export default function CashbookTab({ expenses, setExpenses, salesLedger, parties }) {
    const [viewMode, setViewMode] = useState('ledger'); // 'ledger' or 'add_expense'
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterMode, setFilterMode] = useState('all'); // 'all', 'inflow', 'outflow'
    
    // New Expense Form States
    const [newTransaction, setNewTransaction] = useState({
        type: 'outflow', // 'inflow' or 'outflow'
        amount: '',
        category: 'Utilities',
        paymentMode: 'UPI',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const expenseCategories = ['Rent', 'Salaries', 'Utilities', 'Inventory Restock', 'Tea & Snacks', 'Marketing', 'Printing & Stationery', 'Others'];
    const incomeCategories = ['Side Income', 'Owner Capital', 'Refund Received', 'Others'];

    const handleAddTransaction = (e) => {
        e.preventDefault();
        const amt = Number(newTransaction.amount);
        if (!amt || amt <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        const transaction = {
            id: generateNewId(),
            type: newTransaction.type,
            amount: amt,
            category: newTransaction.category,
            paymentMode: newTransaction.paymentMode,
            description: newTransaction.description.trim(),
            date: new Date(newTransaction.date).toISOString()
        };

        setExpenses(prev => [...prev, transaction]);
        setNewTransaction({
            type: 'outflow',
            amount: '',
            category: 'Utilities',
            paymentMode: 'UPI',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
        setViewMode('ledger');
    };

    // Compiled Cashbook Ledger logic (combining Sales, Party Payments, and Manual Expenses)
    const ledgerEntries = useMemo(() => {
        let entries = [];

        // 1. POS Sales Inflows (actual cash received, i.e., amountPaid)
        salesLedger.forEach(sale => {
            if (sale.status === 'VOID') return;
            const actualPaid = sale.amountPaid !== undefined ? sale.amountPaid : sale.grandTotal;
            if (actualPaid > 0) {
                entries.push({
                    id: `SALE-${sale.invoiceNo}`,
                    date: sale.date,
                    type: 'inflow',
                    category: 'POS Sale',
                    particulars: `Bill Invoice ${sale.invoiceNo} (${sale.customerName || 'Walk-in Customer'})`,
                    mode: sale.paymentType === 'partial' ? 'Partial (Dues Set)' : 'Paid Full',
                    amount: actualPaid
                });
            }
        });

        // 2. Party Payments (customer debt clearing inflows)
        parties.forEach(party => {
            if (party.history) {
                party.history.forEach(txn => {
                    if (txn.type === 'payment') {
                        entries.push({
                            id: txn.id || `PAY-${party.id}-${new Date(txn.date).getTime()}`,
                            date: txn.date,
                            type: 'inflow',
                            category: 'Party Payment',
                            particulars: `Credit Payment from ${party.name}`,
                            mode: txn.paymentMode || 'UPI',
                            amount: txn.amount
                        });
                    }
                });
            }
        });

        // 3. Manual Expenses / Side Income Outflows and Inflows
        expenses.forEach(exp => {
            entries.push({
                id: exp.id,
                date: exp.date,
                type: exp.type,
                category: exp.category,
                particulars: exp.description || `Logged ${exp.category}`,
                mode: exp.paymentMode,
                amount: exp.amount
            });
        });

        // Sort entries by date descending (most recent first)
        return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [salesLedger, parties, expenses]);

    // Computed totals based on the complete ledger
    const stats = useMemo(() => {
        let inflow = 0;
        let outflow = 0;
        let upiIn = 0, upiOut = 0;
        let cashIn = 0, cashOut = 0;
        let bankIn = 0, bankOut = 0;

        ledgerEntries.forEach(entry => {
            const amt = entry.amount;
            const mode = entry.mode.toLowerCase();

            if (entry.type === 'inflow') {
                inflow += amt;
                if (mode.includes('upi')) upiIn += amt;
                else if (mode.includes('cash')) cashIn += amt;
                else bankIn += amt; // card or bank transfer fallback
            } else {
                outflow += amt;
                if (mode.includes('upi')) upiOut += amt;
                else if (mode.includes('cash')) cashOut += amt;
                else bankOut += amt;
            }
        });

        return {
            inflow,
            outflow,
            balance: inflow - outflow,
            cashBalance: cashIn - cashOut,
            upiBalance: upiIn - upiOut,
            bankBalance: bankIn - bankOut
        };
    }, [ledgerEntries]);

    // Apply filters
    const filteredEntries = useMemo(() => {
        return ledgerEntries.filter(entry => {
            const matchesCategory = filterCategory === 'all' || entry.category === filterCategory;
            const matchesMode = filterMode === 'all' || entry.type === filterMode;
            return matchesCategory && matchesMode;
        });
    }, [ledgerEntries, filterCategory, filterMode]);

    // Unique categories present in ledger for filters
    const uniqueCategories = useMemo(() => {
        const cats = new Set();
        ledgerEntries.forEach(e => cats.add(e.category));
        return Array.from(cats);
    }, [ledgerEntries]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-24)' }}>
            
            {/* Cashbook Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-16)' }}>
                <div style={{ backgroundColor: 'var(--surface-container-low)', padding: 'var(--spacing-16)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--success)' }}>
                    <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontWeight: '500' }}>Total Inflows (Cash In)</h4>
                    <h2 style={{ margin: 'var(--spacing-4) 0 0 0', color: 'var(--success)', fontSize: '1.75rem', fontWeight: '700' }}>₹{stats.inflow.toFixed(2)}</h2>
                </div>
                <div style={{ backgroundColor: 'var(--surface-container-low)', padding: 'var(--spacing-16)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--error)' }}>
                    <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontWeight: '500' }}>Total Outflows (Expenses)</h4>
                    <h2 style={{ margin: 'var(--spacing-4) 0 0 0', color: 'var(--error)', fontSize: '1.75rem', fontWeight: '700' }}>₹{stats.outflow.toFixed(2)}</h2>
                </div>
                <div style={{ backgroundColor: 'var(--surface-container-low)', padding: 'var(--spacing-16)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', borderLeft: `4px solid ${stats.balance >= 0 ? 'var(--primary)' : 'var(--error)'}` }}>
                    <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontWeight: '500' }}>Net Cashbook Balance</h4>
                    <h2 style={{ margin: 'var(--spacing-4) 0 0 0', color: stats.balance >= 0 ? 'var(--primary)' : 'var(--error)', fontSize: '1.75rem', fontWeight: '700' }}>₹{stats.balance.toFixed(2)}</h2>
                </div>
            </div>

            {/* Split Account Balances */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-16)', backgroundColor: 'var(--surface-container-highest)', padding: 'var(--spacing-16)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--spacing-8)' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-icons" style={{ fontSize: '18px' }}>payments</span> Cash Balance:</span>
                    <strong style={{ fontSize: '1.1rem', color: stats.cashBalance >= 0 ? 'var(--on-surface)' : 'var(--error)' }}>₹{stats.cashBalance.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--spacing-8)', borderLeft: '1px solid var(--outline-variant)' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-icons" style={{ fontSize: '18px' }}>qr_code_2</span> UPI Balance:</span>
                    <strong style={{ fontSize: '1.1rem', color: stats.upiBalance >= 0 ? 'var(--on-surface)' : 'var(--error)' }}>₹{stats.upiBalance.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--spacing-8)', borderLeft: '1px solid var(--outline-variant)' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-icons" style={{ fontSize: '18px' }}>account_balance</span> Bank / Card:</span>
                    <strong style={{ fontSize: '1.1rem', color: stats.bankBalance >= 0 ? 'var(--on-surface)' : 'var(--error)' }}>₹{stats.bankBalance.toFixed(2)}</strong>
                </div>
            </div>

            {/* View Mode Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-12)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-8)' }}>
                    <button 
                        className={`view-btn ${viewMode === 'ledger' ? 'active' : ''}`} 
                        onClick={() => setViewMode('ledger')}
                        style={{ margin: 0, padding: 'var(--spacing-8) var(--spacing-16)', backgroundColor: viewMode === 'ledger' ? 'var(--primary)' : 'var(--surface-container-high)', color: viewMode === 'ledger' ? 'white' : 'var(--on-surface)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}
                    >
                        <span className="material-icons" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px' }}>menu_book</span>
                        Ledger View
                    </button>
                    <button 
                        className={`view-btn ${viewMode === 'add_expense' ? 'active' : ''}`} 
                        onClick={() => setViewMode('add_expense')}
                        style={{ margin: 0, padding: 'var(--spacing-8) var(--spacing-16)', backgroundColor: viewMode === 'add_expense' ? 'var(--primary)' : 'var(--surface-container-high)', color: viewMode === 'add_expense' ? 'white' : 'var(--on-surface)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}
                    >
                        <span className="material-icons" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px' }}>add_circle</span>
                        Add Income/Expense
                    </button>
                </div>
                
                {viewMode === 'ledger' && (
                    <div style={{ display: 'flex', gap: 'var(--spacing-12)', flexWrap: 'wrap' }}>
                        {/* Direction Filter */}
                        <select 
                            value={filterMode} 
                            onChange={(e) => setFilterMode(e.target.value)}
                            style={{ padding: 'var(--spacing-8)', width: 'auto', fontSize: '0.875rem' }}
                        >
                            <option value="all">All Cashflow</option>
                            <option value="inflow">Inflows (Cash In)</option>
                            <option value="outflow">Outflows (Expenses)</option>
                        </select>

                        {/* Category Filter */}
                        <select 
                            value={filterCategory} 
                            onChange={(e) => setFilterCategory(e.target.value)}
                            style={{ padding: 'var(--spacing-8)', width: 'auto', fontSize: '0.875rem' }}
                        >
                            <option value="all">All Categories</option>
                            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'ledger' ? (
                    // --- CHROMATIC LEDGER TABLE ---
                    <motion.div 
                        key="ledger"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ backgroundColor: 'var(--surface-container-low)', padding: 'var(--spacing-20)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}
                    >
                        <h3 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: 'var(--spacing-16)' }}>Double-Entry Cashbook Register</h3>

                        {filteredEntries.length === 0 ? (
                            <p style={{ color: 'var(--on-surface-variant)', textAlign: 'center', padding: 'var(--spacing-32)', fontStyle: 'italic' }}>
                                No transactions matched the selected filters.
                            </p>
                        ) : (
                            <div style={{ overflow: 'auto' }}>
                                <table className="data-table" style={{ marginTop: 0 }}>
                                    <thead>
                                        <tr>
                                            <th>Date & Time</th>
                                            <th>Particulars (Description)</th>
                                            <th>Type / Category</th>
                                            <th>Mode</th>
                                            <th style={{ textAlign: 'right', color: 'var(--success)' }}>Cash In (Dr)</th>
                                            <th style={{ textAlign: 'right', color: 'var(--error)' }}>Cash Out (Cr)</th>
                                            <th style={{ textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEntries.map(entry => {
                                            const isInflow = entry.type === 'inflow';
                                            const isManual = entry.id.startsWith('EXP-');
                                            return (
                                                <tr key={entry.id}>
                                                    <td style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                                                        {new Date(entry.date).toLocaleDateString('en-IN')} <br/>
                                                        <small>{new Date(entry.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</small>
                                                    </td>
                                                    <td style={{ fontWeight: '500' }}>
                                                        {entry.particulars}
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', backgroundColor: isInflow ? 'var(--success-container)' : 'var(--error-container)', color: isInflow ? 'var(--success)' : 'var(--error)' }}>
                                                            {entry.category}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '0.875rem' }}>{entry.mode}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--success)', fontSize: '1rem' }}>
                                                        {isInflow ? `₹${entry.amount.toFixed(2)}` : '-'}
                                                    </td>
                                                    <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--error)', fontSize: '1rem' }}>
                                                        {!isInflow ? `₹${entry.amount.toFixed(2)}` : '-'}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {isManual ? (
                                                            <button 
                                                                className="btn-sm btn-delete" 
                                                                onClick={() => {
                                                                    if (window.confirm("Delete this manual expense transaction?")) {
                                                                        setExpenses(prev => prev.filter(e => e.id !== entry.id));
                                                                    }
                                                                }}
                                                                title="Delete transaction"
                                                            >
                                                                <span className="material-icons" style={{ fontSize: '16px' }}>delete</span>
                                                            </button>
                                                        ) : (
                                                            <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem', fontStyle: 'italic' }}>Auto</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    // --- ADD INCOME/EXPENSE FORM ---
                    <motion.div 
                        key="add_expense"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ maxWidth: '600px', backgroundColor: 'var(--surface-container-low)', padding: 'var(--spacing-24)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', margin: '0 auto' }}
                    >
                        <h3 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: 'var(--spacing-20)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-icons">post_add</span>Record Cashbook Entry
                        </h3>

                        <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
                            {/* Inflow vs Outflow Selector */}
                            <div>
                                <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Transaction Flow Type</label>
                                <div style={{ display: 'flex', gap: 'var(--spacing-12)' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => setNewTransaction(prev => ({ ...prev, type: 'outflow', category: 'Utilities' }))}
                                        style={{ flex: 1, padding: 'var(--spacing-12)', border: '2px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', backgroundColor: newTransaction.type === 'outflow' ? 'var(--error-container)' : 'transparent', color: newTransaction.type === 'outflow' ? 'var(--error)' : 'var(--on-surface-variant)', borderColor: newTransaction.type === 'outflow' ? 'var(--error)' : 'var(--outline-variant)' }}
                                    >
                                        <span className="material-icons" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px' }}>trending_down</span>
                                        Expense (Cash Out)
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setNewTransaction(prev => ({ ...prev, type: 'inflow', category: 'Side Income' }))}
                                        style={{ flex: 1, padding: 'var(--spacing-12)', border: '2px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', backgroundColor: newTransaction.type === 'inflow' ? 'var(--success-container)' : 'transparent', color: newTransaction.type === 'inflow' ? 'var(--success)' : 'var(--on-surface-variant)', borderColor: newTransaction.type === 'inflow' ? 'var(--success)' : 'var(--outline-variant)' }}
                                    >
                                        <span className="material-icons" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px' }}>trending_up</span>
                                        Other Income (Cash In)
                                    </button>
                                </div>
                            </div>

                            {/* Amount */}
                            <div>
                                <label>Amount (₹) *</label>
                                <input 
                                    type="number" 
                                    value={newTransaction.amount} 
                                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder="Enter transaction value"
                                    required 
                                    style={{ fontSize: '1.1rem', fontWeight: '600' }}
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label>Transaction Date *</label>
                                <input 
                                    type="date" 
                                    value={newTransaction.date} 
                                    onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                                    required 
                                />
                            </div>

                            {/* Category Dropdown */}
                            <div>
                                <label>Category</label>
                                <select 
                                    value={newTransaction.category} 
                                    onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                                >
                                    {newTransaction.type === 'outflow' ? (
                                        expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                                    ) : (
                                        incomeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                                    )}
                                </select>
                            </div>

                            {/* Payment Mode */}
                            <div>
                                <label>Payment Mode</label>
                                <select 
                                    value={newTransaction.paymentMode} 
                                    onChange={(e) => setNewTransaction(prev => ({ ...prev, paymentMode: e.target.value }))}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Card">Card Payment</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label>Description / Notes</label>
                                <textarea 
                                    value={newTransaction.description} 
                                    onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="E.g., paid monthly shop rent, tea expenses for vendor meeting..."
                                    rows="3"
                                />
                            </div>

                            {/* Submit and Cancel Buttons */}
                            <div style={{ display: 'flex', gap: 'var(--spacing-8)', marginTop: 'var(--spacing-8)' }}>
                                <button type="submit" className="action-btn" style={{ margin: 0, flex: 1, backgroundColor: newTransaction.type === 'outflow' ? 'var(--error)' : 'var(--success)' }}>
                                    Save Transaction
                                </button>
                                <button 
                                    type="button" 
                                    className="btn-sm" 
                                    onClick={() => setViewMode('ledger')}
                                    style={{ margin: 0, backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface)' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
