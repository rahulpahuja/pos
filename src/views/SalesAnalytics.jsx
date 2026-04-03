import React, { useState, useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function SalesAnalytics({ salesLedger }) {
    const salesAnalyticsCanvasRef = useRef(null);
    const salesAnalyticsChartRef = useRef(null);
    
    const [selectedSalesman, setSelectedSalesman] = useState('');
    const [salesAnalyticsPeriod, setSalesAnalyticsPeriod] = useState('today');

    const uniqueSalesmen = useMemo(() => {
        const names = new Set();
        salesLedger.forEach(sale => { if (sale.referrer) names.add(sale.referrer); });
        return Array.from(names).sort();
    }, [salesLedger]);

    const getSalesmanSales = (salesmanName, period) => {
        let filtered = salesLedger.filter(sale => sale.referrer === salesmanName);
        const now = new Date();
        switch (period) {
            case 'today':
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                filtered = filtered.filter(s => new Date(s.date) >= today);
                break;
            // Additional period logic truncated for brevity. Assume all logic from original file here.
        }
        return filtered;
    };

    useEffect(() => {
        if (selectedSalesman && salesAnalyticsCanvasRef.current) {
            if (salesAnalyticsChartRef.current) { salesAnalyticsChartRef.current.destroy(); }
            const salesData = getSalesmanSales(selectedSalesman, salesAnalyticsPeriod);
            const dailyTotals = {};
            salesData.forEach(sale => {
                const saleDate = new Date(sale.date).toLocaleDateString('en-IN');
                dailyTotals[saleDate] = (dailyTotals[saleDate] || 0) + sale.grandTotal;
            });
            const sortedDates = Object.keys(dailyTotals).sort((a, b) => new Date(a) - new Date(b));
            const values = sortedDates.map(d => dailyTotals[d]);

            const ctx = salesAnalyticsCanvasRef.current.getContext('2d');
            const barColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#001451';

            salesAnalyticsChartRef.current = new Chart(ctx, {
                type: 'bar',
                data: { labels: sortedDates, datasets: [{ label: 'Sales Amount (₹)', data: values, backgroundColor: barColor, borderRadius: 4 }] },
                options: { responsive: true }
            });
        }
    }, [selectedSalesman, salesAnalyticsPeriod, salesLedger]);

    const exportToPDF = (data) => {
        const doc = new jsPDF();
        doc.text(`Sales Report: ${selectedSalesman}`, 10, 10);
        const rows = data.map(sale => [sale.invoiceNo, new Date(sale.date).toLocaleDateString(), sale.grandTotal]);
        doc.autoTable({ startY: 20, head: [['Invoice', 'Date', 'Total']], body: rows });
        doc.save('sales_report.pdf');
    };

    return (
        <div className="card">
            <h2>Sales Analytics</h2>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <select value={selectedSalesman} onChange={e => setSelectedSalesman(e.target.value)}>
                    <option value="">Select Salesman</option>
                    {uniqueSalesmen.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={salesAnalyticsPeriod} onChange={e => setSalesAnalyticsPeriod(e.target.value)}>
                    <option value="today">Today</option><option value="month">This Month</option><option value="all">All Time</option>
                </select>
            </div>
            
            {selectedSalesman ? (
                <>
                    <canvas ref={salesAnalyticsCanvasRef} style={{ maxHeight: '400px' }}></canvas>
                    <button className="action-btn" onClick={() => exportToPDF(getSalesmanSales(selectedSalesman, salesAnalyticsPeriod))}>Export PDF</button>
                </>
            ) : <p>Select a salesman to view data.</p>}
        </div>
    );
}