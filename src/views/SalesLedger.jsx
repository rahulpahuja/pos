import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function SalesLedger({ salesLedger }) {
    const [ledgerView, setLedgerView] = useState('table');
    const [selectedPeriod, setSelectedPeriod] = useState('daily');
    const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
    const chartCanvasRef = useRef(null);
    const chartInstanceRef = useRef(null);
    
    const [tableFilters, setTableFilters] = useState({ dateFrom: '', dateTo: '', invoiceSearch: '', minAmount: '', maxAmount: '' });

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
                <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: 'var(--primary-container)' }}>
                            <tr>
                                <th style={{ padding: '12px', color: 'white', textAlign: 'left' }}>Date</th>
                                <th style={{ padding: '12px', color: 'white', textAlign: 'left' }}>Invoice No.</th>
                                <th style={{ padding: '12px', color: 'white', textAlign: 'left' }}>Items Sold</th>
                                <th style={{ padding: '12px', color: 'white', textAlign: 'left' }}>Discount</th>
                                <th style={{ padding: '12px', color: 'white', textAlign: 'left' }}>Grand Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filterSalesLedger().map((sale, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                                    <td style={{ padding: '12px' }}>{new Date(sale.date).toLocaleString()}</td>
                                    <td style={{ padding: '12px', fontFamily: 'monospace' }}>{sale.invoiceNo}</td>
                                    <td style={{ padding: '12px' }}>{sale.items.reduce((sum, item) => sum + item.qty, 0)} items</td>
                                    <td style={{ padding: '12px' }}>{sale.discountPercentage}%</td>
                                    <td style={{ padding: '12px', fontWeight: '600', color: 'var(--primary)' }}>₹{sale.grandTotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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