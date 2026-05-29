import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const generateNewId = () => `PRT-${Date.now().toString().slice(-6)}`;

export default function PartiesTab({ parties, setParties, salesLedger }) {
    const [selectedPartyId, setSelectedPartyId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'dues', 'settled'

    // Form states for creating/editing a party
    const [newParty, setNewParty] = useState({ name: '', phone: '', email: '', address: '', gstin: '', notes: '' });
    const [editingPartyId, setEditingPartyId] = useState(null);

    // Form states for recording a payment
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({ amount: '', paymentMode: 'UPI', notes: '', date: new Date().toISOString().split('T')[0] });

    const handleAddParty = (e) => {
        e.preventDefault();
        if (!newParty.name.trim()) return;

        const party = {
            id: generateNewId(),
            name: newParty.name.trim(),
            phone: newParty.phone.trim(),
            email: newParty.email.trim(),
            address: newParty.address.trim(),
            gstin: newParty.gstin.trim(),
            notes: newParty.notes.trim(),
            balance: 0,
            history: [],
            createdDate: new Date().toISOString()
        };

        setParties(prev => [...prev, party]);
        setNewParty({ name: '', phone: '', email: '', address: '', gstin: '', notes: '' });
    };

    const handleUpdateParty = (e) => {
        e.preventDefault();
        if (!newParty.name.trim() || !editingPartyId) return;

        setParties(prev => prev.map(p => p.id === editingPartyId ? {
            ...p,
            name: newParty.name.trim(),
            phone: newParty.phone.trim(),
            email: newParty.email.trim(),
            address: newParty.address.trim(),
            gstin: newParty.gstin.trim(),
            notes: newParty.notes.trim()
        } : p));

        setEditingPartyId(null);
        setNewParty({ name: '', phone: '', email: '', address: '', gstin: '', notes: '' });
    };

    const startEditing = (party) => {
        setEditingPartyId(party.id);
        setNewParty({
            name: party.name,
            phone: party.phone || '',
            email: party.email || '',
            address: party.address || '',
            gstin: party.gstin || '',
            notes: party.notes || ''
        });
    };

    const cancelEditing = () => {
        setEditingPartyId(null);
        setNewParty({ name: '', phone: '', email: '', address: '', gstin: '', notes: '' });
    };

    const handleDeleteParty = (party) => {
        if (party.balance > 0) {
            alert(`Cannot delete party "${party.name}" because they have an outstanding balance of ₹${party.balance.toFixed(2)}.`);
            return;
        }
        if (window.confirm(`Are you sure you want to delete party "${party.name}"?`)) {
            setParties(prev => prev.filter(p => p.id !== party.id));
            if (selectedPartyId === party.id) {
                setSelectedPartyId(null);
            }
        }
    };

    const handleRecordPayment = (e) => {
        e.preventDefault();
        const amt = Number(paymentDetails.amount);
        if (!amt || amt <= 0) {
            alert("Please enter a valid payment amount.");
            return;
        }

        const selectedParty = parties.find(p => p.id === selectedPartyId);
        if (!selectedParty) return;

        const newPaymentTxn = {
            id: `TXN-PAY-${Date.now().toString().slice(-6)}`,
            date: new Date(paymentDetails.date).toISOString(),
            type: 'payment',
            amount: amt,
            paymentMode: paymentDetails.paymentMode,
            description: `Payment received via ${paymentDetails.paymentMode}${paymentDetails.notes ? ' - ' + paymentDetails.notes : ''}`
        };

        setParties(prev => prev.map(p => {
            if (p.id === selectedPartyId) {
                return {
                    ...p,
                    balance: Math.max(0, p.balance - amt),
                    history: [newPaymentTxn, ...p.history]
                };
            }
            return p;
        }));

        setShowPaymentForm(false);
        setPaymentDetails({ amount: '', paymentMode: 'UPI', notes: '', date: new Date().toISOString().split('T')[0] });
    };

    // Computations
    const selectedParty = parties.find(p => p.id === selectedPartyId);

    const filteredParties = parties.filter(p => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = p.name.toLowerCase().includes(query) || p.phone.includes(query) || (p.gstin && p.gstin.toLowerCase().includes(query));
        
        if (filterType === 'dues') return matchesSearch && p.balance > 0;
        if (filterType === 'settled') return matchesSearch && p.balance === 0;
        return matchesSearch;
    });

    const totalReceivables = parties.reduce((sum, p) => sum + p.balance, 0);
    const partiesWithDues = parties.filter(p => p.balance > 0).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-24)' }}>
            
            {/* Top Stats Banner */}
            {!selectedPartyId && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--spacing-16)' }}>
                    <div style={{ backgroundColor: 'var(--surface-container-low)', padding: 'var(--spacing-16) var(--spacing-20)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--primary)' }}>
                        <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontWeight: '500' }}>Total Parties</h4>
                        <h2 style={{ margin: 'var(--spacing-4) 0 0 0', color: 'var(--primary)', fontSize: '2rem', fontWeight: '700' }}>{parties.length}</h2>
                    </div>
                    <div style={{ backgroundColor: 'var(--surface-container-low)', padding: 'var(--spacing-16) var(--spacing-20)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--error)' }}>
                        <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontWeight: '500' }}>Total Outstanding Receivables</h4>
                        <h2 style={{ margin: 'var(--spacing-4) 0 0 0', color: 'var(--error)', fontSize: '2rem', fontWeight: '700' }}>₹{totalReceivables.toFixed(2)}</h2>
                    </div>
                    <div style={{ backgroundColor: 'var(--surface-container-low)', padding: 'var(--spacing-16) var(--spacing-20)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--success)' }}>
                        <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontWeight: '500' }}>Parties with Outstanding Dues</h4>
                        <h2 style={{ margin: 'var(--spacing-4) 0 0 0', color: 'var(--success)', fontSize: '2rem', fontWeight: '700' }}>{partiesWithDues}</h2>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {!selectedPartyId ? (
                    // --- DIRECTORY VIEW ---
                    <motion.div 
                        key="directory"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ display: 'flex', gap: 'var(--spacing-24)', flexWrap: 'wrap' }}
                    >
                        {/* Parties List Section */}
                        <div style={{ flex: '2 1 600px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-20)', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-12)', marginBottom: 'var(--spacing-16)' }}>
                                <h3 style={{ color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)' }}>
                                    <span className="material-icons">supervised_user_circle</span>Party Directory
                                </h3>
                                
                                {/* Search and Filters */}
                                <div style={{ display: 'flex', gap: 'var(--spacing-8)', alignItems: 'center', width: '100%', maxWidth: '400px' }}>
                                    <span className="material-icons" style={{ color: 'var(--on-surface-variant)' }}>search</span>
                                    <input 
                                        type="text" 
                                        placeholder="Search by name, phone, gstin..." 
                                        value={searchQuery} 
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ padding: 'var(--spacing-8) var(--spacing-12)', fontSize: '0.875rem' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--spacing-8)', marginBottom: 'var(--spacing-16)' }}>
                                <button 
                                    className={`btn-sm ${filterType === 'all' ? 'btn-edit' : ''}`} 
                                    onClick={() => setFilterType('all')} 
                                    style={{ margin: 0, backgroundColor: filterType === 'all' ? 'var(--primary)' : 'var(--surface-container-high)', color: filterType === 'all' ? 'white' : 'var(--on-surface)' }}
                                >
                                    All Parties
                                </button>
                                <button 
                                    className={`btn-sm ${filterType === 'dues' ? 'btn-edit' : ''}`} 
                                    onClick={() => setFilterType('dues')} 
                                    style={{ margin: 0, backgroundColor: filterType === 'dues' ? 'var(--error)' : 'var(--surface-container-high)', color: filterType === 'dues' ? 'white' : 'var(--on-surface)' }}
                                >
                                    With Dues
                                </button>
                                <button 
                                    className={`btn-sm ${filterType === 'settled' ? 'btn-edit' : ''}`} 
                                    onClick={() => setFilterType('settled')} 
                                    style={{ margin: 0, backgroundColor: filterType === 'settled' ? 'var(--success)' : 'var(--surface-container-high)', color: filterType === 'settled' ? 'white' : 'var(--on-surface)' }}
                                >
                                    Settled
                                </button>
                            </div>

                            {filteredParties.length === 0 ? (
                                <p style={{ color: 'var(--on-surface-variant)', textAlign: 'center', padding: 'var(--spacing-32)', fontStyle: 'italic' }}>
                                    No parties found matching the search/filter.
                                </p>
                            ) : (
                                <div style={{ overflow: 'auto', borderRadius: 'var(--radius-md)' }}>
                                    <table className="data-table" style={{ marginTop: 0 }}>
                                        <thead>
                                            <tr>
                                                <th>Party Name</th>
                                                <th>Contact details</th>
                                                <th>GSTIN</th>
                                                <th style={{ textAlign: 'right' }}>Outstanding Balance</th>
                                                <th style={{ textAlign: 'center' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredParties.map(party => (
                                                <tr key={party.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedPartyId(party.id)}>
                                                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                                        {party.name}
                                                        {party.notes && <div style={{ fontWeight: '400', fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '2px' }}>{party.notes}</div>}
                                                    </td>
                                                    <td style={{ fontSize: '0.875rem' }}>
                                                        <div><span className="material-icons" style={{ fontSize: '12px', verticalAlign: 'middle', marginRight: '4px' }}>phone</span>{party.phone}</div>
                                                        {party.email && <div><span className="material-icons" style={{ fontSize: '12px', verticalAlign: 'middle', marginRight: '4px' }}>email</span>{party.email}</div>}
                                                    </td>
                                                    <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{party.gstin || '-'}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: '700', fontSize: '1rem' }}>
                                                        {party.balance > 0 ? (
                                                            <span style={{ color: 'var(--error)', backgroundColor: 'var(--error-container)', padding: 'var(--spacing-4) var(--spacing-8)', borderRadius: 'var(--radius-md)' }}>
                                                                ₹{party.balance.toFixed(2)}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: 'var(--success)', backgroundColor: 'var(--success-container)', padding: 'var(--spacing-4) var(--spacing-8)', borderRadius: 'var(--radius-md)' }}>
                                                                Settled
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                            <button className="btn-sm btn-edit" onClick={() => startEditing(party)} title="Edit party details">
                                                                <span className="material-icons" style={{ fontSize: '16px' }}>edit</span>
                                                            </button>
                                                            <button className="btn-sm btn-delete" onClick={() => handleDeleteParty(party)} title="Delete party">
                                                                <span className="material-icons" style={{ fontSize: '16px' }}>delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Add/Edit Party Form Section */}
                        <div style={{ flex: '1 1 300px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-20)', boxShadow: 'var(--shadow-sm)', height: 'fit-content' }}>
                            <h4 style={{ color: 'var(--secondary)', marginTop: 0, marginBottom: 'var(--spacing-16)', fontSize: '1.125rem', fontWeight: '600' }}>
                                {editingPartyId ? 'Edit Party Details' : 'Add New Party'}
                            </h4>
                            <form onSubmit={editingPartyId ? handleUpdateParty : handleAddParty} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12)' }}>
                                <div>
                                    <label>Party Name *</label>
                                    <input 
                                        type="text" 
                                        value={newParty.name} 
                                        onChange={(e) => setNewParty(prev => ({ ...prev, name: e.target.value }))} 
                                        placeholder="Enter company or person name" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label>Phone Number *</label>
                                    <input 
                                        type="tel" 
                                        value={newParty.phone} 
                                        onChange={(e) => setNewParty(prev => ({ ...prev, phone: e.target.value }))} 
                                        placeholder="Enter contact number" 
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Email Address</label>
                                    <input 
                                        type="email" 
                                        value={newParty.email} 
                                        onChange={(e) => setNewParty(prev => ({ ...prev, email: e.target.value }))} 
                                        placeholder="Enter email address" 
                                    />
                                </div>
                                <div>
                                    <label>GSTIN Number</label>
                                    <input 
                                        type="text" 
                                        value={newParty.gstin} 
                                        onChange={(e) => setNewParty(prev => ({ ...prev, gstin: e.target.value }))} 
                                        placeholder="GST Registration No." 
                                        style={{ fontFamily: 'monospace' }}
                                    />
                                </div>
                                <div>
                                    <label>Address</label>
                                    <textarea 
                                        value={newParty.address} 
                                        onChange={(e) => setNewParty(prev => ({ ...prev, address: e.target.value }))} 
                                        placeholder="Enter full billing address" 
                                        rows="2"
                                        style={{ resize: 'vertical', minHeight: '60px' }}
                                    />
                                </div>
                                <div>
                                    <label>Additional Notes</label>
                                    <textarea 
                                        value={newParty.notes} 
                                        onChange={(e) => setNewParty(prev => ({ ...prev, notes: e.target.value }))} 
                                        placeholder="E.g. Credit limit, terms, payment cycle..." 
                                        rows="2"
                                        style={{ resize: 'vertical', minHeight: '60px' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--spacing-8)', marginTop: 'var(--spacing-8)' }}>
                                    <button type="submit" className="action-btn" style={{ margin: 0, flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                        <span className="material-icons">{editingPartyId ? 'save' : 'person_add'}</span>
                                        {editingPartyId ? 'Save Changes' : 'Create Party'}
                                    </button>
                                    {editingPartyId && (
                                        <button type="button" className="btn-sm" onClick={cancelEditing} style={{ margin: 0, backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)' }}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </motion.div>
                ) : (
                    // --- PARTY DETAILS VIEW ---
                    <motion.div 
                        key="details"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}
                    >
                        {/* Header Controls */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button 
                                className="btn-sm" 
                                onClick={() => { setSelectedPartyId(null); setShowPaymentForm(false); }}
                                style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface)' }}
                            >
                                <span className="material-icons" style={{ fontSize: '18px' }}>arrow_back</span>
                                Back to Directory
                            </button>
                            <h3 style={{ margin: 0, color: 'var(--primary)' }}>Party Details & Ledger</h3>
                        </div>

                        {selectedParty && (
                            <div style={{ display: 'flex', gap: 'var(--spacing-24)', flexWrap: 'wrap' }}>
                                
                                {/* Left Side: Party profile and Outstanding summary */}
                                <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
                                    
                                    {/* Profile Card */}
                                    <div style={{ backgroundColor: 'var(--surface-container-low)', padding: 'var(--spacing-20)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-16)', marginBottom: 'var(--spacing-16)' }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                                {selectedParty.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, color: 'var(--primary)' }}>{selectedParty.name}</h4>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Party ID: {selectedParty.id}</span>
                                            </div>
                                        </div>

                                        <hr style={{ border: 'none', borderTop: '1px solid var(--outline-variant)', margin: 'var(--spacing-16) 0' }} />

                                        <div style={{ display: 'grid', gap: 'var(--spacing-12)', fontSize: '0.875rem' }}>
                                            {selectedParty.phone && (
                                                <div>
                                                    <span style={{ fontWeight: '600', color: 'var(--on-surface)', display: 'block' }}>Phone Number:</span>
                                                    <span style={{ color: 'var(--on-surface-variant)' }}>{selectedParty.phone}</span>
                                                </div>
                                            )}
                                            {selectedParty.email && (
                                                <div>
                                                    <span style={{ fontWeight: '600', color: 'var(--on-surface)', display: 'block' }}>Email Address:</span>
                                                    <span style={{ color: 'var(--on-surface-variant)' }}>{selectedParty.email}</span>
                                                </div>
                                            )}
                                            {selectedParty.gstin && (
                                                <div>
                                                    <span style={{ fontWeight: '600', color: 'var(--on-surface)', display: 'block' }}>GSTIN Number:</span>
                                                    <span style={{ color: 'var(--on-surface-variant)', fontFamily: 'monospace' }}>{selectedParty.gstin}</span>
                                                </div>
                                            )}
                                            {selectedParty.address && (
                                                <div>
                                                    <span style={{ fontWeight: '600', color: 'var(--on-surface)', display: 'block' }}>Billing Address:</span>
                                                    <span style={{ color: 'var(--on-surface-variant)' }}>{selectedParty.address}</span>
                                                </div>
                                            )}
                                            {selectedParty.notes && (
                                                <div>
                                                    <span style={{ fontWeight: '600', color: 'var(--on-surface)', display: 'block' }}>Internal Notes:</span>
                                                    <span style={{ color: 'var(--on-surface-variant)' }}>{selectedParty.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Financial Balance Status */}
                                    <div style={{ backgroundColor: selectedParty.balance > 0 ? 'var(--error-container)' : 'var(--success-container)', color: selectedParty.balance > 0 ? 'var(--error)' : 'var(--success)', padding: 'var(--spacing-20)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
                                        <span style={{ fontSize: '0.875rem', fontWeight: '500', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {selectedParty.balance > 0 ? 'Outstanding Balance' : 'Outstanding Balance'}
                                        </span>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 'var(--spacing-8) 0', color: 'inherit' }}>
                                            ₹{selectedParty.balance.toFixed(2)}
                                        </h2>
                                        <span style={{ fontSize: '0.875rem' }}>
                                            {selectedParty.balance > 0 ? 'Payment is overdue' : 'Ledger is settled. Perfect!'}
                                        </span>

                                        {selectedParty.balance > 0 && (
                                            <button 
                                                className="action-btn" 
                                                style={{ backgroundColor: 'var(--error)', border: 'none', color: 'white', marginTop: 'var(--spacing-16)' }}
                                                onClick={() => setShowPaymentForm(true)}
                                            >
                                                Record Payment
                                            </button>
                                        )}
                                    </div>

                                    {/* Inline Payment Form */}
                                    {showPaymentForm && (
                                        <div style={{ backgroundColor: 'var(--surface-container-low)', padding: 'var(--spacing-20)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--outline-variant)' }}>
                                            <h4 style={{ margin: '0 0 var(--spacing-16) 0', color: 'var(--primary)' }}>Record Payment Received</h4>
                                            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12)' }}>
                                                <div>
                                                    <label>Amount Received (₹) *</label>
                                                    <input 
                                                        type="number" 
                                                        min="1" 
                                                        max={selectedParty.balance} 
                                                        value={paymentDetails.amount} 
                                                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, amount: e.target.value }))} 
                                                        placeholder={`Max ₹${selectedParty.balance.toFixed(2)}`} 
                                                        required 
                                                    />
                                                </div>
                                                <div>
                                                    <label>Payment Date</label>
                                                    <input 
                                                        type="date" 
                                                        value={paymentDetails.date} 
                                                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, date: e.target.value }))} 
                                                        required 
                                                    />
                                                </div>
                                                <div>
                                                    <label>Payment Mode</label>
                                                    <select 
                                                        value={paymentDetails.paymentMode} 
                                                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, paymentMode: e.target.value }))}
                                                    >
                                                        <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                                                        <option value="Cash">Cash</option>
                                                        <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                                                        <option value="Card">Credit/Debit Card</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label>Reference Details / Notes</label>
                                                    <textarea 
                                                        value={paymentDetails.notes} 
                                                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, notes: e.target.value }))} 
                                                        placeholder="Transaction ID, check number, etc. (optional)" 
                                                        rows="2"
                                                    />
                                                </div>

                                                <div style={{ display: 'flex', gap: 'var(--spacing-8)', marginTop: 'var(--spacing-8)' }}>
                                                    <button type="submit" className="action-btn" style={{ margin: 0, flex: 1, backgroundColor: 'var(--success)' }}>
                                                        Save Payment
                                                    </button>
                                                    <button type="button" className="btn-sm" onClick={() => setShowPaymentForm(false)} style={{ margin: 0, backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface)' }}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                </div>

                                {/* Right Side: Ledger history */}
                                <div style={{ flex: '2 1 500px', backgroundColor: 'var(--surface-container-low)', padding: 'var(--spacing-20)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                                    <h4 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: 'var(--spacing-16)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="material-icons">receipt_long</span>Ledger Transaction History
                                    </h4>

                                    {selectedParty.history.length === 0 ? (
                                        <p style={{ color: 'var(--on-surface-variant)', textAlign: 'center', padding: 'var(--spacing-32)', fontStyle: 'italic' }}>
                                            No transactions found in this party's ledger. Sales recorded as partial credit will appear here.
                                        </p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12)' }}>
                                            {selectedParty.history.map((txn, index) => {
                                                const isSale = txn.type === 'sale';
                                                return (
                                                    <div 
                                                        key={txn.id || index} 
                                                        style={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between', 
                                                            alignItems: 'center', 
                                                            backgroundColor: 'var(--surface-container-highest)', 
                                                            padding: 'var(--spacing-16)', 
                                                            borderRadius: 'var(--radius-md)', 
                                                            border: '1px solid var(--outline-variant)',
                                                            borderLeft: `5px solid ${isSale ? 'var(--error)' : 'var(--success)'}`
                                                        }}
                                                    >
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)', marginBottom: 'var(--spacing-4)' }}>
                                                                <span 
                                                                    style={{ 
                                                                        fontSize: '0.75rem', 
                                                                        fontWeight: '700', 
                                                                        padding: '2px 6px', 
                                                                        borderRadius: '4px', 
                                                                        textTransform: 'uppercase',
                                                                        backgroundColor: isSale ? 'var(--error-container)' : 'var(--success-container)',
                                                                        color: isSale ? 'var(--error)' : 'var(--success)'
                                                                    }}
                                                                >
                                                                    {isSale ? 'Sale Credit' : 'Payment Received'}
                                                                </span>
                                                                <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                                                                    {new Date(txn.date).toLocaleDateString('en-IN')} {new Date(txn.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p style={{ margin: 0, fontWeight: '600', color: 'var(--on-surface)', fontSize: '0.925rem' }}>
                                                                {txn.description}
                                                            </p>
                                                            {txn.invoiceNo && (
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                                                    Invoice No: {txn.invoiceNo}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            {isSale ? (
                                                                <>
                                                                    <div style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--error)' }}>
                                                                        +₹{(txn.amount - txn.paid).toFixed(2)}
                                                                    </div>
                                                                    <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                                                                        Bill: ₹{txn.amount.toFixed(0)} | Paid: ₹{txn.paid.toFixed(0)}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--success)' }}>
                                                                        -₹{txn.amount.toFixed(2)}
                                                                    </div>
                                                                    <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                                                                        Mode: {txn.paymentMode}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
