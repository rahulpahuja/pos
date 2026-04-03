import React, { useState } from 'react';
import { motion } from 'framer-motion';
import JsBarcode from 'jsbarcode';

const cardContainerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const cardVariants = { hidden: { opacity: 0, y: 16, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22 } } };

export default function ProductCatalog({ catalog }) {
    const [searchQuery, setSearchQuery] = useState('');
    
    // State to track the currently selected size filter for each product card
    // Format: { 'A2Z-123456': 'XL', 'A2Z-987654': 'All' }
    const [selectedSizes, setSelectedSizes] = useState({});

    // Search filter checks both root product details and variant details
    const filteredCatalog = catalog.filter(p => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        
        const matchesRoot = p.id.toLowerCase().includes(query) || p.name.toLowerCase().includes(query);
        const matchesVariant = p.variants && p.variants.some(v => 
            (v.colorName && v.colorName.toLowerCase().includes(query)) ||
            (v.barcode && v.barcode.toLowerCase().includes(query))
        );

        return matchesRoot || matchesVariant;
    });

    const groupedCatalog = {};
    filteredCatalog.forEach(p => { 
        if (!groupedCatalog[p.category]) groupedCatalog[p.category] = []; 
        groupedCatalog[p.category].push(p); 
    });

    // Handle clicking a size badge
    const handleSizeClick = (productId, size) => {
        setSelectedSizes(prev => ({ ...prev, [productId]: size }));
    };

    const printLabel = (item, sizesText) => {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, item.id, { width: 1.5, height: 40, displayValue: false });
        const barcodeDataUrl = canvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank', 'width=400,height=400');
        printWindow.document.write(`
            <html>
                <head><title>Print Label - ${item.id}</title>
                <style>@page { margin: 0; } body { font-family: 'Segoe UI', Tahoma, sans-serif; text-align: center; margin: 0; padding: 10px; width: 2.5in; } h2 { margin: 0; font-size: 18px; font-family: serif; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;} .product-name { font-size: 14px; margin: 4px 0; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;} .size { font-size: 16px; font-weight: bold; border: 1px solid #000; display: inline-block; padding: 2px 6px; margin: 5px 0;} .price { font-size: 18px; font-weight: bold; margin-bottom: 5px; } .barcode-img { max-width: 100%; height: 50px; margin-top: 5px; } .id-text { font-size: 12px; font-family: monospace; letter-spacing: 2px; }</style></head>
                <body><h2>A2Z COLLECTION</h2><div class="product-name">${item.name}</div><div class="size">SIZE: ${sizesText}</div><div class="price">MRP: ₹${item.sellPrice}</div><img class="barcode-img" src="${barcodeDataUrl}" /><div class="id-text">${item.id}</div><script>window.onload = function() { window.print(); }<\/script></body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div>
            <input type="text" className="search-bar" placeholder="Search by Product Name, ID, or Color..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            
            {Object.keys(groupedCatalog).length === 0 ? (<p style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: 'var(--spacing-32) 0' }}>No products found in catalog.</p>) : (
                Object.keys(groupedCatalog).sort().map(category => (
                    <div key={category} className="category-section">
                        <h2 className="category-title">{category}</h2>
                        
                        <motion.div className="grid-container" variants={cardContainerVariants} initial="hidden" animate="visible">
                            {groupedCatalog[category].map(item => {
                                const hasVariants = item.variants && item.variants.length > 0;
                                const uniqueSizesArray = hasVariants ? [...new Set(item.variants.map(v => v.size))] : (item.size ? [item.size] : []);
                                
                                // Determine the currently active size for this specific product card (Defaults to 'All')
                                const currentSelectedSize = selectedSizes[item.id] || 'All';
                                
                                // Calculate Dynamic Stock based on selection
                                let displayStock = 0;
                                if (!hasVariants) {
                                    displayStock = Number(item.stockQty) || 0;
                                } else if (currentSelectedSize === 'All') {
                                    displayStock = item.variants.reduce((sum, v) => sum + (Number(v.stockQty) || 0), 0);
                                } else {
                                    displayStock = item.variants
                                        .filter(v => v.size === currentSelectedSize)
                                        .reduce((sum, v) => sum + (Number(v.stockQty) || 0), 0);
                                }

                                // Calculate Dynamic Colors based on selection
                                let displayColors = '';
                                if (!hasVariants) {
                                    displayColors = item.colorName || 'N/A';
                                } else if (currentSelectedSize === 'All') {
                                    displayColors = [...new Set(item.variants.map(v => v.colorName))].join(', ');
                                } else {
                                    displayColors = [...new Set(item.variants.filter(v => v.size === currentSelectedSize).map(v => v.colorName))].join(', ');
                                }
                                if (!displayColors) displayColors = 'None';

                                const sizesTextForPrint = currentSelectedSize === 'All' ? uniqueSizesArray.join(', ') : currentSelectedSize;

                                return (
                                    <motion.div key={item.id} className="product-card" variants={cardVariants} whileTap={{ scale: 0.98 }}>
                                        <div>
                                            {item.images && item.images.length > 0 ? (<img src={item.images[0]} alt={item.name} />) : (
                                                <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-md)', color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-12)' }}>No Image</div>
                                            )}
                                            <h4>{item.name}</h4>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-8)' }}>{item.id}</div>
                                            
                                            {/* Interactive Size Badges */}
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '8px' }}>
                                                {uniqueSizesArray.length > 0 ? (
                                                    <>
                                                        <span 
                                                            onClick={() => handleSizeClick(item.id, 'All')}
                                                            className="size-badge" 
                                                            style={{ 
                                                                cursor: 'pointer', 
                                                                backgroundColor: currentSelectedSize === 'All' ? 'var(--primary)' : 'var(--secondary-container)',
                                                                color: currentSelectedSize === 'All' ? 'white' : 'var(--on-secondary-container)'
                                                            }}
                                                        >
                                                            All
                                                        </span>
                                                        {uniqueSizesArray.map(s => (
                                                            <span 
                                                                key={s} 
                                                                onClick={() => handleSizeClick(item.id, s)}
                                                                className="size-badge"
                                                                style={{ 
                                                                    cursor: 'pointer', 
                                                                    backgroundColor: currentSelectedSize === s ? 'var(--primary)' : 'var(--secondary-container)',
                                                                    color: currentSelectedSize === s ? 'white' : 'var(--on-secondary-container)'
                                                                }}
                                                            >
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <span className="size-badge">N/A</span>
                                                )}
                                            </div>
                                            
                                            <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
                                                Colors: <span style={{ fontWeight: 500 }}>{displayColors}</span>
                                            </div>
                                            
                                            {/* Dynamic Stock Display */}
                                            <div style={{ 
                                                fontSize: '0.875rem', 
                                                color: displayStock <= 2 ? 'var(--error)' : 'var(--success)', 
                                                fontWeight: '600', 
                                                marginTop: 'var(--spacing-8)', 
                                                display: 'inline-block', 
                                                backgroundColor: displayStock <= 2 ? 'var(--error-container)' : 'var(--success-container)', 
                                                padding: 'var(--spacing-4) var(--spacing-8)', 
                                                borderRadius: 'var(--radius-full)' 
                                            }}>
                                                {currentSelectedSize === 'All' ? 'Total Stock: ' : `${currentSelectedSize} Stock: `} {displayStock}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="prices">
                                                <span style={{ color: 'var(--on-surface-variant)', textDecoration: 'line-through', marginRight: 'var(--spacing-8)' }}>Cost: ₹{item.costPrice}</span>
                                                <strong style={{ color: 'var(--primary)' }}>MRP: ₹{item.sellPrice}</strong>
                                            </div>
                                            <button onClick={() => printLabel(item, sizesTextForPrint)} className="action-btn" style={{ backgroundColor: 'var(--success)', color: 'white' }}>
                                                <span className="material-icons">print</span> Print Label
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                ))
            )}
        </div>
    );
}