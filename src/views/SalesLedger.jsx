import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function SalesLedger({ salesLedger }) {
    const [ledgerView, setLedgerView] = useState('table');
    const [selectedPeriod, setSelectedPeriod] = useState('daily');
    const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
    const chartCanvasRef = useRef(null);
    const chartInstanceRef = useRef(null);
    
    const [tableFilters, setTableFilters] = useState({ 
        dateFrom: '', 
        dateTo: '', 
        invoiceSearch: '', 
        minAmount: '', 
        maxAmount: '',
        referrer: 'All',
        customer: 'All'
    });

    const uniqueReferrers = [...new Set(salesLedger.map(sale => sale.referrer).filter(Boolean))].sort();
    const uniqueCustomers = [...new Set(salesLedger.map(sale => sale.customerName).filter(Boolean))].sort();

    const totalRevenue = salesLedger.reduce((sum, sale) => sum + sale.grandTotal, 0);
    const totalInvoices = salesLedger.length;

    // Helper functions
    const getWeekNumber = (date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        return Math.ceil((((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 1))) / 86400000) + 1) / 7);
    };

    const getPeriodKey = (date, period) => {
        const dateObj = new Date(date);
        switch (period) {
            case 'daily': return `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
            case 'weekly': return `${dateObj.getFullYear()}-W${getWeekNumber(dateObj)}`;
            case 'monthly': return `${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
            case 'yearly': return `${dateObj.getFullYear()}`;
            default: return `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
        }
    };

    const getSortValue = (key, period) => {
        switch (period) {
            case 'daily': const [d, m, y] = key.split('/'); return new Date(y, m - 1, d).getTime();
            case 'weekly': const [year, week] = key.split('-W'); return new Date(year, 0, 1 + (week - 1) * 7).getTime();
            case 'monthly': const [month, yearM] = key.split('/'); return new Date(yearM, month - 1, 1).getTime();
            case 'yearly': return new Date(key, 0, 1).getTime();
            default: return 0;
        }
    };

    useEffect(() => {
        if (ledgerView === 'chart' && chartCanvasRef.current) {
            if (chartInstanceRef.current) { chartInstanceRef.current.destroy(); }
            const periodTotals = {};
            salesLedger.forEach(sale => {
                const key = getPeriodKey(sale.date, selectedPeriod);
                periodTotals[key] = (periodTotals[key] || 0) + sale.grandTotal;
            });
            const sortedEntries = Object.entries(periodTotals).sort((a, b) => getSortValue(a[0], selectedPeriod) - getSortValue(b[0], selectedPeriod));
            const ctx = chartCanvasRef.current.getContext('2d');
            const barColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#001451';

            chartInstanceRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sortedEntries.map(([key]) => key),
                    datasets: [{ label: `Total Sales (₹)`, data: sortedEntries.map(([, total]) => total), backgroundColor: barColor, borderRadius: 4 }]
                },
                options: { responsive: true, scales: { y: { beginAtZero: true } } }
            });
        }
    }, [ledgerView, salesLedger, selectedPeriod]);

    const filterSalesLedger = () => {
        return salesLedger.filter(sale => {
            const saleDate = new Date(sale.date);
            if (tableFilters.dateFrom && saleDate < new Date(tableFilters.dateFrom)) return false;
            if (tableFilters.dateTo) { const toDate = new Date(tableFilters.dateTo); toDate.setHours(23, 59, 59, 999); if (saleDate > toDate) return false; }
            if (tableFilters.invoiceSearch && !sale.invoiceNo.toLowerCase().includes(tableFilters.invoiceSearch.toLowerCase())) return false;
            if (tableFilters.minAmount && sale.grandTotal < Number(tableFilters.minAmount)) return false;
            if (tableFilters.maxAmount && sale.grandTotal > Number(tableFilters.maxAmount)) return false;
            if (tableFilters.referrer !== 'All' && sale.referrer !== tableFilters.referrer) return false;
            if (tableFilters.customer !== 'All' && sale.customerName !== tableFilters.customer) return false;
            return true;
        }).reverse();
    };

    return (
        <div className="card">
            <div className="ledger-header">
                <div className="ledger-stat">
                    <h2>₹{totalRevenue.toFixed(2)}</h2>
                    <span>Total Lifetime Revenue</span>
                </div>
                <div className="ledger-stat">
                    <h2>{totalInvoices}</h2>
                    <span>Total Invoices</span>
                </div>
                <div className="view-toggle">
                    <button className={`view-btn ${ledgerView === 'table' ? 'active' : ''}`} onClick={() => setLedgerView('table')}><span className="material-icons">table_chart</span> Table View</button>
                    <button className={`view-btn ${ledgerView === 'chart' ? 'active' : ''}`} onClick={() => setLedgerView('chart')}><span className="material-icons">bar_chart</span> Chart View</button>
                </div>
            </div>

            {ledgerView === 'table' && (
                <div>
                    {/* Filter Section */}
                    <div 
                        style={{ 
                            backgroundColor: 'var(--surface-container-low)', 
                            borderRadius: 'var(--radius-lg)', 
                            padding: 'var(--spacing-16) var(--spacing-20)', 
                            border: '1px solid var(--outline-variant)', 
                            marginBottom: 'var(--spacing-20)'
                        }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--spacing-16)' }}>
                            {/* Search Invoice */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', color: 'var(--on-surface-variant)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search Invoice</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Invoice No..." 
                                        value={tableFilters.invoiceSearch} 
                                        onChange={(e) => setTableFilters(prev => ({ ...prev, invoiceSearch: e.target.value }))} 
                                        style={{ width: '100%', padding: '10px 12px 10px 36px', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '0.9rem' }}
                                    />
                                    <span className="material-icons" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'var(--on-surface-variant)', opacity: 0.7 }}>search</span>
                                </div>
                            </div>

                            {/* Customer Filter */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', color: 'var(--on-surface-variant)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</label>
                                <select 
                                    value={tableFilters.customer} 
                                    onChange={(e) => setTableFilters(prev => ({ ...prev, customer: e.target.value }))}
                                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '0.9rem', height: '42px', cursor: 'pointer' }}
                                >
                                    <option value="All">All Customers</option>
                                    {uniqueCustomers.map(cust => <option key={cust} value={cust}>{cust}</option>)}
                                </select>
                            </div>

                            {/* Referrer Filter */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', color: 'var(--on-surface-variant)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Referred By</label>
                                <select 
                                    value={tableFilters.referrer} 
                                    onChange={(e) => setTableFilters(prev => ({ ...prev, referrer: e.target.value }))}
                                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '0.9rem', height: '42px', cursor: 'pointer' }}
                                >
                                    <option value="All">All Referrers</option>
                                    {uniqueReferrers.map(ref => <option key={ref} value={ref}>{ref}</option>)}
                                </select>
                            </div>

                            {/* Date Range */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', color: 'var(--on-surface-variant)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Range</label>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <input 
                                        type="date" 
                                        value={tableFilters.dateFrom} 
                                        onChange={(e) => setTableFilters(prev => ({ ...prev, dateFrom: e.target.value }))} 
                                        style={{ width: '100%', padding: '9px 8px', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '0.85rem' }} 
                                    />
                                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>to</span>
                                    <input 
                                        type="date" 
                                        value={tableFilters.dateTo} 
                                        onChange={(e) => setTableFilters(prev => ({ ...prev, dateTo: e.target.value }))} 
                                        style={{ width: '100%', padding: '9px 8px', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '0.85rem' }} 
                                    />
                                </div>
                            </div>

                            {/* Amount Range */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', color: 'var(--on-surface-variant)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount Range</label>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <input 
                                        type="number" 
                                        placeholder="Min ₹" 
                                        value={tableFilters.minAmount} 
                                        onChange={(e) => setTableFilters(prev => ({ ...prev, minAmount: e.target.value }))} 
                                        style={{ width: '100%', padding: '10px 8px', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '0.85rem' }} 
                                    />
                                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>to</span>
                                    <input 
                                        type="number" 
                                        placeholder="Max ₹" 
                                        value={tableFilters.maxAmount} 
                                        onChange={(e) => setTableFilters(prev => ({ ...prev, maxAmount: e.target.value }))} 
                                        style={{ width: '100%', padding: '10px 8px', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderBottom: '2px solid var(--primary)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', fontSize: '0.85rem' }} 
                                    />
                                </div>
                            </div>
                        </div>

                        {(tableFilters.dateFrom || tableFilters.dateTo || tableFilters.invoiceSearch || tableFilters.minAmount || tableFilters.maxAmount || tableFilters.referrer !== 'All' || tableFilters.customer !== 'All') && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-12)' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setTableFilters({ dateFrom: '', dateTo: '', invoiceSearch: '', minAmount: '', maxAmount: '', referrer: 'All', customer: 'All' })} 
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '4px', 
                                        backgroundColor: 'transparent', 
                                        color: 'var(--error)', 
                                        border: '1px solid var(--error)', 
                                        borderRadius: 'var(--radius-md)', 
                                        padding: '6px 12px', 
                                        cursor: 'pointer', 
                                        fontWeight: '600',
                                        fontSize: '0.8rem',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--error-container)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    <span className="material-icons" style={{ fontSize: '16px' }}>clear_all</span>
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Table View */}
                    <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: 'var(--primary-container)' }}>
                                <tr>
                                    <th style={{ padding: '12px', color: 'white', textAlign: 'left' }}>Date</th>
                                    <th style={{ padding: '12px', color: 'white', textAlign: 'left' }}>Invoice No.</th>
                                    <th style={{ padding: '12px', color: 'white', textAlign: 'left' }}>Customer</th>
                                    <th style={{ padding: '12px', color: 'white', textAlign: 'left' }}>Referred By</th>
                                    <th style={{ padding: '12px', color: 'white', textAlign: 'left' }}>Items Sold</th>
                                    <th style={{ padding: '12px', color: 'white', textAlign: 'left' }}>Discount</th>
                                    <th style={{ padding: '12px', color: 'white', textAlign: 'right' }}>Grand Total</th>
                                    <th style={{ padding: '12px', color: 'white', textAlign: 'right' }}>Paid</th>
                                    <th style={{ padding: '12px', color: 'white', textAlign: 'right' }}>Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterSalesLedger().map((sale, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                                        <td style={{ padding: '12px' }}>{new Date(sale.date).toLocaleString()}</td>
                                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>{sale.invoiceNo}</td>
                                        <td style={{ padding: '12px' }}>{sale.customerName || <em style={{ opacity: 0.5 }}>Walk-in</em>}</td>
                                        <td style={{ padding: '12px' }}>{sale.referrer || <em style={{ opacity: 0.5 }}>None</em>}</td>
                                        <td style={{ padding: '12px' }}>{sale.items.reduce((sum, item) => sum + item.qty, 0)} items</td>
                                        <td style={{ padding: '12px' }}>{sale.discountPercentage}%</td>
                                        <td style={{ padding: '12px', fontWeight: '600', color: 'var(--primary)', textAlign: 'right' }}>₹{sale.grandTotal.toFixed(2)}</td>
                                        <td style={{ padding: '12px', color: 'var(--on-surface)', textAlign: 'right' }}>₹{(sale.amountPaid !== undefined ? sale.amountPaid : sale.grandTotal).toFixed(2)}</td>
                                        <td style={{ padding: '12px', color: (sale.balanceDue > 0 ? 'var(--error)' : 'var(--on-surface)'), fontWeight: sale.balanceDue > 0 ? '600' : 'normal', textAlign: 'right' }}>₹{(sale.balanceDue !== undefined ? sale.balanceDue : 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {ledgerView === 'chart' && (
                <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                        <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                            <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <canvas ref={chartCanvasRef}></canvas>
                </div>
            )}
        </div>
    );
}