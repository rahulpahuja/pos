import React, { useState } from 'react';

const generateNewId = () => `A2Z-${Date.now().toString().slice(-6)}`;

export default function ReferrersTab({ referrers, setReferrers }) {
    const [newReferrer, setNewReferrer] = useState({ name: '', phone: '', email: '', address: '', notes: '' });
    const [editingReferrer, setEditingReferrer] = useState(null);

    const handleAddReferrer = (e) => {
        e.preventDefault();
        if (!newReferrer.name.trim()) return;
        const referrer = { 
            id: generateNewId(), 
            name: newReferrer.name.trim(), 
            phone: newReferrer.phone.trim(), 
            email: newReferrer.email.trim(), 
            address: newReferrer.address.trim(), 
            notes: newReferrer.notes.trim(), 
            createdDate: new Date().toISOString() 
        };
        setReferrers(prev => [...prev, referrer]);
        setNewReferrer({ name: '', phone: '', email: '', address: '', notes: '' });
    };

    const handleUpdateReferrer = (e) => {
        e.preventDefault();
        if (!newReferrer.name.trim()) return;
        setReferrers(prev => prev.map(r => r.id === editingReferrer.id ? { 
            ...r, 
            name: newReferrer.name.trim(), 
            phone: newReferrer.phone.trim(), 
            email: newReferrer.email.trim(), 
            address: newReferrer.address.trim(), 
            notes: newReferrer.notes.trim() 
        } : r));
        setEditingReferrer(null);
        setNewReferrer({ name: '', phone: '', email: '', address: '', notes: '' });
    };

    const startEditing = (referrer) => {
        setEditingReferrer(referrer);
        setNewReferrer({ 
            name: referrer.name, 
            phone: referrer.phone || '', 
            email: referrer.email || '', 
            address: referrer.address || '', 
            notes: referrer.notes || '' 
        });
    };

    const cancelEditing = () => {
        setEditingReferrer(null);
        setNewReferrer({ name: '', phone: '', email: '', address: '', notes: '' });
    };

    const deleteReferrer = (referrer) => {
        if (window.confirm(`Delete referrer "${referrer.name}"?`)) {
            setReferrers(prev => prev.filter(r => r.id !== referrer.id));
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-20)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: 'var(--spacing-8)', fontSize: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)' }}>
                <span className="material-icons">people</span>Manage Referrers
            </h3>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-20)', fontSize: '0.875rem' }}>Add and manage referrer contacts for billing purposes.</p>

            <form onSubmit={handleAddReferrer} style={{ marginBottom: 'var(--spacing-24)' }}>
                <h4 style={{ color: 'var(--secondary)', marginBottom: 'var(--spacing-16)', fontSize: '1.125rem', fontWeight: '600' }}>Add New Referrer</h4>
                <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-16)' }}>
                        <div><label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Full Name *</label><input type="text" value={newReferrer.name} onChange={(e) => setNewReferrer(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter referrer's full name" required style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem' }} /></div>
                        <div><label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Phone Number</label><input type="tel" value={newReferrer.phone} onChange={(e) => setNewReferrer(prev => ({ ...prev, phone: e.target.value }))} placeholder="Enter phone number" style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem' }} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-16)' }}>
                        <div><label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Email Address</label><input type="email" value={newReferrer.email} onChange={(e) => setNewReferrer(prev => ({ ...prev, email: e.target.value }))} placeholder="Enter email address" style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem' }} /></div>
                        <div><label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Address</label><input type="text" value={newReferrer.address} onChange={(e) => setNewReferrer(prev => ({ ...prev, address: e.target.value }))} placeholder="Enter address" style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem' }} /></div>
                    </div>
                    <div><label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Notes</label><textarea value={newReferrer.notes} onChange={(e) => setNewReferrer(prev => ({ ...prev, notes: e.target.value }))} placeholder="Additional notes about this referrer" rows="2" style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem', resize: 'vertical', minHeight: '60px' }} /></div>
                </div>
                <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: 'var(--spacing-12) var(--spacing-20)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)', marginTop: 'var(--spacing-16)' }}>
                    <span className="material-icons">person_add</span> Add Referrer
                </button>
            </form>

            <div>
                <h4 style={{ color: 'var(--secondary)', marginBottom: 'var(--spacing-16)', fontSize: '1.125rem', fontWeight: '600' }}>Referrer List ({referrers.length})</h4>
                {referrers.length === 0 ? (
                    <p style={{ color: 'var(--on-surface-variant)', textAlign: 'center', padding: 'var(--spacing-20)', fontStyle: 'italic' }}>No referrers added yet. Add your first referrer above.</p>
                ) : (
                    <div style={{ display: 'grid', gap: 'var(--spacing-12)' }}>
                        {referrers.map(referrer => (
                            <div key={referrer.id} style={{ backgroundColor: 'var(--surface-container-highest)', padding: 'var(--spacing-16)', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ flex: 1 }}>
                                    <h5 style={{ margin: '0 0 var(--spacing-8) 0', color: 'var(--primary)', fontSize: '1.125rem', fontWeight: '600' }}>{referrer.name}</h5>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-8)', fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
                                        {referrer.phone && <div><strong style={{ color: 'var(--on-surface)' }}>Phone:</strong> {referrer.phone}</div>}
                                        {referrer.email && <div><strong style={{ color: 'var(--on-surface)' }}>Email:</strong> {referrer.email}</div>}
                                        {referrer.address && <div><strong style={{ color: 'var(--on-surface)' }}>Address:</strong> {referrer.address}</div>}
                                        <div><strong style={{ color: 'var(--on-surface)' }}>Added:</strong> {new Date(referrer.createdDate).toLocaleDateString()}</div>
                                    </div>
                                    {referrer.notes && (<div style={{ marginTop: 'var(--spacing-12)', fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}><strong style={{ color: 'var(--on-surface)' }}>Notes:</strong> {referrer.notes}</div>)}
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--spacing-8)' }}>
                                    <button style={{ backgroundColor: 'var(--secondary-container)', color: 'var(--on-secondary-container)', border: 'none', padding: 'var(--spacing-8)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => startEditing(referrer)} title="Edit referrer"><span className="material-icons" style={{ fontSize: '1.125rem' }}>edit</span></button>
                                    <button style={{ backgroundColor: 'var(--error-container)', color: 'var(--error)', border: 'none', padding: 'var(--spacing-8)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => deleteReferrer(referrer)} title="Delete referrer"><span className="material-icons" style={{ fontSize: '1.125rem' }}>delete</span></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {editingReferrer && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div style={{ backgroundColor: 'var(--surface-container-low)', padding: 'var(--spacing-24)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', maxWidth: '500px', width: '90%', boxShadow: 'var(--shadow-lg)' }}>
                        <h4 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: 'var(--spacing-20)', fontSize: '1.25rem', fontWeight: '600' }}>Edit Referrer</h4>
                        <form onSubmit={handleUpdateReferrer}>
                            <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
                                <div><label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Full Name *</label><input type="text" value={newReferrer.name} onChange={(e) => setNewReferrer(prev => ({ ...prev, name: e.target.value }))} required style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem' }} /></div>
                                <div><label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Phone Number</label><input type="tel" value={newReferrer.phone} onChange={(e) => setNewReferrer(prev => ({ ...prev, phone: e.target.value }))} style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem' }} /></div>
                                <div><label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Email Address</label><input type="email" value={newReferrer.email} onChange={(e) => setNewReferrer(prev => ({ ...prev, email: e.target.value }))} style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem' }} /></div>
                                <div><label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Address</label><input type="text" value={newReferrer.address} onChange={(e) => setNewReferrer(prev => ({ ...prev, address: e.target.value }))} style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem' }} /></div>
                                <div><label style={{ color: 'var(--on-surface)', display: 'block', marginBottom: 'var(--spacing-8)', fontSize: '0.875rem', fontWeight: '500' }}>Notes</label><textarea value={newReferrer.notes} onChange={(e) => setNewReferrer(prev => ({ ...prev, notes: e.target.value }))} rows="2" style={{ width: '100%', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '1rem', resize: 'vertical', minHeight: '60px' }} /></div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--spacing-12)', justifyContent: 'flex-end', marginTop: 'var(--spacing-20)' }}>
                                <button type="button" onClick={cancelEditing} style={{ backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline)', padding: 'var(--spacing-10) var(--spacing-16)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                                <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: 'var(--spacing-10) var(--spacing-16)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)' }}><span className="material-icons" style={{ fontSize: '1.125rem' }}>save</span> Update Referrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}