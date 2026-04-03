import React from 'react';

export default function CustomersTab({ customers, setCustomers }) {
    const sortedCustomers = [...customers].sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));

    return (
        <div className="card">
            <h2 style={{ marginTop: 0, marginBottom: 'var(--spacing-16)' }}>Customer Contacts</h2>
            
            {sortedCustomers.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: 'var(--spacing-32)' }}>
                    <p>No customers yet. Add customer details while creating an invoice.</p>
                </div>
            ) : (
                <div style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--on-surface)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--primary-container)' }}>
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'left', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Customer Name</th>
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'left', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Phone Number</th>
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'left', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Join Date</th>
                                <th style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'center', fontWeight: '600', color: 'var(--on-primary-container)', borderBottom: '1px solid var(--outline-variant)' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedCustomers.map((customer) => (
                                <tr key={customer.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', color: 'var(--on-surface)' }}>{customer.name}</td>
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', color: 'var(--on-surface)', fontFamily: 'monospace' }}>{customer.phone}</td>
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>{new Date(customer.joinDate).toLocaleDateString('en-IN')}</td>
                                    <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', textAlign: 'center' }}>
                                        <button 
                                            className="btn-sm btn-delete" 
                                            onClick={() => setCustomers(customers.filter(c => c.id !== customer.id))} 
                                            title="Delete customer"
                                        >
                                            <span className="material-icons">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <div style={{ marginTop: 'var(--spacing-20)', padding: 'var(--spacing-16)', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ marginTop: 0, color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
                    <strong>Total Customers:</strong> {sortedCustomers.length}
                </p>
            </div>
        </div>
    );
}