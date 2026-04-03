import React, { useState, useMemo } from 'react';

export default function InvoicesTab({ salesLedger }) {
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
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'center', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Items</th>
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
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', color: 'var(--on-surface-variant)', textAlign: 'center', fontSize: '0.875rem' }}>{invoice.items.length}</td>
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