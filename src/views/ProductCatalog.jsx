import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JsBarcode from 'jsbarcode';

const ProductCardImage = ({ src, alt }) => {
    const [failed, setFailed] = useState(false);
    if (failed || !src) {
        return (
            <div style={{ height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-md)', color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-12)' }}>
                <span className="material-icons" style={{ fontSize: '32px', color: 'var(--on-surface-variant)', opacity: 0.7, marginBottom: '4px' }}>image_not_supported</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>No Image Preview</span>
            </div>
        );
    }
    return (
        <img 
            src={src} 
            alt={alt} 
            onError={() => setFailed(true)} 
        />
    );
};

const cardContainerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const cardVariants = { hidden: { opacity: 0, y: 16, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22 } } };

export default function ProductCatalog({ catalog, labelSettings, setCurrentTab }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSizes, setSelectedSizes] = useState({});
    const [catalogViewMode, setCatalogViewMode] = useState('grid');
    
    // Filtering States
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [genderFilter, setGenderFilter] = useState('All');
    const [stockFilter, setStockFilter] = useState('All');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Get all unique categories from catalog
    const categories = [...new Set(catalog.map(p => p.category))].filter(Boolean).sort();

    // Determine if any filters are active
    const hasActiveFilters = categoryFilter !== 'All' || genderFilter !== 'All' || stockFilter !== 'All' || minPrice !== '' || maxPrice !== '' || searchQuery !== '';

    const clearAllFilters = () => {
        setCategoryFilter('All');
        setGenderFilter('All');
        setStockFilter('All');
        setMinPrice('');
        setMaxPrice('');
        setSearchQuery('');
    };

    // Filter Logic
    const filteredCatalog = catalog.filter(p => {
        // 1. Search Query Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesRoot = p.id.toLowerCase().includes(query) || p.name.toLowerCase().includes(query) || (p.hsnCode && p.hsnCode.toLowerCase().includes(query)) || (p.brand && p.brand.toLowerCase().includes(query)) || (p.supplierName && p.supplierName.toLowerCase().includes(query));
            const matchesVariant = p.variants && p.variants.some(v => 
                (v.colorName && v.colorName.toLowerCase().includes(query)) ||
                (v.barcode && v.barcode.toLowerCase().includes(query))
            );
            if (!matchesRoot && !matchesVariant) return false;
        }

        // 2. Category Filter
        if (categoryFilter !== 'All' && p.category !== categoryFilter) {
            return false;
        }

        // 3. Gender Filter
        const itemGender = p.gender || 'Unisex';
        if (genderFilter !== 'All' && itemGender.toLowerCase() !== genderFilter.toLowerCase()) {
            return false;
        }

        // 4. Stock Qty Filter
        const totalStock = p.variants && p.variants.length > 0 
            ? p.variants.reduce((sum, v) => sum + (Number(v.stockQty) || 0), 0)
            : Number(p.stockQty) || 0;

        if (stockFilter === 'InStock' && totalStock === 0) return false;
        if (stockFilter === 'LowStock' && (totalStock <= 0 || totalStock > 2)) return false;
        if (stockFilter === 'OutOfStock' && totalStock !== 0) return false;

        // 5. Price Filter
        const price = Number(p.sellPrice) || 0;
        if (minPrice && price < Number(minPrice)) return false;
        if (maxPrice && price > Number(maxPrice)) return false;

        return true;
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
        const settings = labelSettings || {
            width: '2.5in',
            height: '1.5in',
            padding: '10px',
            bg: '#ffffff',
            fontColor: '#000000',
            borderColor: '#000000',
            headerText: 'M1x COLLECTION',
            headerFontSize: '16px',
            headerFontWeight: 'bold',
            headerFontFamily: 'serif',
            nameFontSize: '12px',
            nameFontWeight: 'bold',
            showProductId: true,
            idFontSize: '10px',
            idLetterSpacing: '2px',
            sizeFontSize: '14px',
            sizeBorder: true,
            priceFontSize: '16px',
            priceFontWeight: 'bold',
            showPrice: true,
            pricePrefix: 'MRP: ₹',
            barcodeWidth: 1.5,
            barcodeHeight: 35,
            barcodeColor: '#000000',
            showBarcodeValue: false,
            fontFamily: 'Arial, sans-serif'
        };

        const canvas = document.createElement('canvas');
        JsBarcode(canvas, item.id, { 
            width: Number(settings.barcodeWidth) || 1.5, 
            height: Number(settings.barcodeHeight) || 35, 
            lineColor: settings.barcodeColor || '#000000',
            displayValue: settings.showBarcodeValue || false,
            fontSize: 10,
            margin: 0,
            background: 'transparent'
        });
        const barcodeDataUrl = canvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank', 'width=500,height=500');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Label - ${item.id}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Manrope:wght@400;700&family=Outfit:wght@400;700&family=Poppins:wght@400;700&family=Montserrat:wght@400;700&family=Open+Sans:wght@400;700&family=Roboto+Mono&display=swap" rel="stylesheet">
                    <style>
                        @page { margin: 0; } 
                        body { 
                            font-family: ${settings.fontFamily || 'Arial, sans-serif'}; 
                            text-align: center; 
                            margin: 0; 
                            padding: ${settings.padding}; 
                            width: ${settings.width}; 
                            height: ${settings.height};
                            background-color: ${settings.bg};
                            color: ${settings.fontColor};
                            box-sizing: border-box;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            overflow: hidden;
                        } 
                        .header { 
                            margin: 0; 
                            font-size: ${settings.headerFontSize}; 
                            font-family: ${settings.headerFontFamily}; 
                            font-weight: ${settings.headerFontWeight}; 
                            border-bottom: 1px solid ${settings.borderColor}; 
                            padding-bottom: 2px; 
                            margin-bottom: 4px;
                            width: 100%;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            flex-shrink: 0;
                        } 
                        .product-name { 
                            font-size: ${settings.nameFontSize}; 
                            margin: 2px 0; 
                            font-weight: ${settings.nameFontWeight}; 
                            white-space: nowrap; 
                            overflow: hidden; 
                            text-overflow: ellipsis;
                            width: 100%;
                            flex-shrink: 0;
                        } 
                        .size-price-row {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            gap: 8px;
                            margin: 3px 0;
                            flex-shrink: 0;
                        }
                        .size { 
                            font-size: ${settings.sizeFontSize}; 
                            font-weight: bold; 
                            border: ${settings.sizeBorder ? `1px solid ${settings.borderColor}` : 'none'}; 
                            display: inline-block; 
                            padding: 1px 5px;
                        } 
                        .price { 
                            font-size: ${settings.priceFontSize}; 
                            font-weight: ${settings.priceFontWeight}; 
                        } 
                        .barcode-img { 
                            max-width: 100%; 
                            display: block;
                            margin-top: 2px;
                            flex-shrink: 0;
                        } 
                        .id-text { 
                            font-size: ${settings.idFontSize}; 
                            font-family: monospace; 
                            letter-spacing: ${settings.idLetterSpacing}; 
                            margin-top: 1px;
                            text-transform: uppercase;
                            flex-shrink: 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">${settings.headerText}</div>
                    <div class="product-name">${item.name}</div>
                    <div class="size-price-row">
                        <div class="size">SIZE: ${sizesText}</div>
                        ${settings.showPrice ? `<div class="price">${settings.pricePrefix}${item.sellPrice}</div>` : ''}
                    </div>
                    <img class="barcode-img" src="${barcodeDataUrl}" />
                    ${settings.showProductId && !settings.showBarcodeValue ? `<div class="id-text">${item.id}</div>` : ''}
                    <script>
                        window.onload = function() { 
                            window.print(); 
                            setTimeout(function() { window.close(); }, 500);
                        }
                    <\/script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-24)', flexWrap: 'wrap', gap: 'var(--spacing-12)' }}>
                <h2 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons">inventory</span> Product Catalog
                </h2>
                {setCurrentTab && (
                    <button 
                        onClick={() => setCurrentTab('admin')} 
                        className="action-btn" 
                        style={{ margin: 0, width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px var(--spacing-20)' }}
                    >
                        <span className="material-icons">add</span> Add Product
                    </button>
                )}
            </div>
            <h4 style={{ color: 'var(--secondary)', marginTop: 0, marginBottom: 'var(--spacing-8)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-icons">search</span> Search Products
            </h4>
            <div style={{ display: 'flex', gap: 'var(--spacing-16)', alignItems: 'center', marginBottom: 'var(--spacing-24)', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <input 
                        type="text" 
                        className="search-bar" 
                        placeholder="Search by Product Name, ID, HSN or Color..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        style={{ margin: 0, paddingLeft: '48px' }}
                    />
                    <span className="material-icons" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', pointerEvents: 'none' }}>search</span>
                </div>
                
                <div style={{ display: 'flex', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '48px' }}>
                    <button 
                        onClick={() => setCatalogViewMode('grid')}
                        style={{ 
                            padding: '0 var(--spacing-16)', 
                            backgroundColor: catalogViewMode === 'grid' ? 'var(--primary)' : 'var(--surface-container-low)', 
                            color: catalogViewMode === 'grid' ? 'white' : 'var(--on-surface)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span className="material-icons" style={{ fontSize: '18px' }}>grid_view</span> Grid
                    </button>
                    <button 
                        onClick={() => setCatalogViewMode('table')}
                        style={{ 
                            padding: '0 var(--spacing-16)', 
                            backgroundColor: catalogViewMode === 'table' ? 'var(--primary)' : 'var(--surface-container-low)', 
                            color: catalogViewMode === 'table' ? 'white' : 'var(--on-surface)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span className="material-icons" style={{ fontSize: '18px' }}>view_list</span> Table
                    </button>
                </div>
            </div>

            <div 
                style={{ 
                    backgroundColor: 'var(--surface-container-low)', 
                    borderRadius: 'var(--radius-lg)', 
                    padding: 'var(--spacing-20)', 
                    border: '1px solid var(--outline-variant)', 
                    marginBottom: 'var(--spacing-24)'
                }}
            >
                <h4 style={{ color: 'var(--secondary)', marginTop: 0, marginBottom: 'var(--spacing-16)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons">filter_list</span> Filters
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-16)' }}>
                    {/* Category Filter */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--on-surface)', marginBottom: '8px' }}>Category</label>
                        <select 
                            value={categoryFilter} 
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: 'var(--spacing-12)', 
                                backgroundColor: 'var(--surface-container-highest)', 
                                color: 'var(--on-surface)', 
                                border: '1px solid var(--outline-variant)', 
                                borderBottom: '2px solid var(--primary)', 
                                borderRadius: 'var(--radius-md) var(--radius-md) 0 0', 
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: '500'
                            }}
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    {/* Gender Filter */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--on-surface)', marginBottom: '8px' }}>Gender</label>
                        <select 
                            value={genderFilter} 
                            onChange={(e) => setGenderFilter(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: 'var(--spacing-12)', 
                                backgroundColor: 'var(--surface-container-highest)', 
                                color: 'var(--on-surface)', 
                                border: '1px solid var(--outline-variant)', 
                                borderBottom: '2px solid var(--primary)', 
                                borderRadius: 'var(--radius-md) var(--radius-md) 0 0', 
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: '500'
                            }}
                        >
                            <option value="All">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Unisex">Unisex</option>
                        </select>
                    </div>

                    {/* Stock Qty Filter */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--on-surface)', marginBottom: '8px' }}>Stock Status</label>
                        <select 
                            value={stockFilter} 
                            onChange={(e) => setStockFilter(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: 'var(--spacing-12)', 
                                backgroundColor: 'var(--surface-container-highest)', 
                                color: 'var(--on-surface)', 
                                border: '1px solid var(--outline-variant)', 
                                borderBottom: '2px solid var(--primary)', 
                                borderRadius: 'var(--radius-md) var(--radius-md) 0 0', 
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: '500'
                            }}
                        >
                            <option value="All">All Stock Status</option>
                            <option value="InStock">In Stock (&gt;0)</option>
                            <option value="LowStock">Low Stock (≤2)</option>
                            <option value="OutOfStock">Out of Stock (0)</option>
                        </select>
                    </div>

                    {/* Price Range Filters */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--on-surface)', marginBottom: '8px' }}>Price Range (MRP)</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input 
                                type="number" 
                                placeholder="Min ₹" 
                                value={minPrice} 
                                onChange={(e) => setMinPrice(e.target.value)} 
                                style={{ 
                                    width: '100%', 
                                    padding: 'var(--spacing-12)', 
                                    backgroundColor: 'var(--surface-container-highest)', 
                                    color: 'var(--on-surface)', 
                                    border: '1px solid var(--outline-variant)', 
                                    borderBottom: '2px solid var(--primary)', 
                                    borderRadius: 'var(--radius-md) var(--radius-md) 0 0', 
                                    fontSize: '0.95rem'
                                }} 
                            />
                            <span style={{ color: 'var(--on-surface-variant)' }}>to</span>
                            <input 
                                type="number" 
                                placeholder="Max ₹" 
                                value={maxPrice} 
                                onChange={(e) => setMaxPrice(e.target.value)} 
                                style={{ 
                                    width: '100%', 
                                    padding: 'var(--spacing-12)', 
                                    backgroundColor: 'var(--surface-container-highest)', 
                                    color: 'var(--on-surface)', 
                                    border: '1px solid var(--outline-variant)', 
                                    borderBottom: '2px solid var(--primary)', 
                                    borderRadius: 'var(--radius-md) var(--radius-md) 0 0', 
                                    fontSize: '0.95rem'
                                }} 
                            />
                        </div>
                    </div>
                </div>

                {hasActiveFilters && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-16)' }}>
                        <button 
                            type="button" 
                            onClick={clearAllFilters} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px', 
                                backgroundColor: 'transparent', 
                                color: 'var(--error)', 
                                border: '1px solid var(--error)', 
                                borderRadius: 'var(--radius-md)', 
                                padding: 'var(--spacing-8) var(--spacing-16)', 
                                cursor: 'pointer', 
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--error-container)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                            <span className="material-icons" style={{ fontSize: '18px' }}>clear_all</span>
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>
            
            {Object.keys(groupedCatalog).length === 0 ? (<p style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: 'var(--spacing-32) 0' }}>No products found in catalog.</p>) : (
                Object.keys(groupedCatalog).sort().map(category => (
                    <div key={category} className="category-section">
                        <h2 className="category-title">{category}</h2>
                        
                        {catalogViewMode === 'grid' ? (
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
                                                <ProductCardImage src={item.images && item.images[0]} alt={item.name} />
                                                 <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                                     <span>{item.brand || 'Generic'}</span>
                                                     <span style={{ color: 'var(--on-surface-variant)', textTransform: 'none', fontWeight: '500', fontSize: '0.7rem' }}>Supplier: {item.supplierName || 'Generic'}</span>
                                                 </div>
                                                <h4>{item.name}</h4>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-8)' }}>{item.id}{item.hsnCode ? ` | HSN: ${item.hsnCode}` : ''}</div>
                                                
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
                                                <div style={{ fontSize: '0.825rem', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                                                    Type: <span style={{ fontWeight: 500 }}>{item.itemType || 'Goods'}</span> | Subcat: <span style={{ fontWeight: 500 }}>{item.subCategory || 'Other'}{item.subCategoryPattern && item.subCategoryPattern !== 'default' ? ` (${item.subCategoryPattern})` : ''}</span>
                                                </div>
                                                <div style={{ fontSize: '0.825rem', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                                                    Tax: <span style={{ fontWeight: 500, color: item.gstType === 'GST' ? 'var(--primary)' : 'var(--on-surface-variant)' }}>{item.gstType === 'GST' ? `GST @ ${item.gstRate || 0}% (CGST ${(item.gstRate || 0)/2}%, SGST ${(item.gstRate || 0)/2}%)` : 'Non-GST'}</span>
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
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ color: 'var(--on-surface-variant)', textDecoration: 'line-through' }}>Cost: ₹{item.costPrice}</span>
                                                        <strong style={{ color: 'var(--primary)' }}>MRP: ₹{item.sellPrice}</strong>
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 'bold', marginTop: '4px', textAlign: 'center' }}>
                                                        Profit Margin: {item.profitMargin ? `${item.profitMargin}%` : `${item.costPrice ? Math.round(((item.sellPrice - item.costPrice) / item.costPrice) * 100) : 0}%`}
                                                    </div>
                                                </div>
                                                <button onClick={() => printLabel(item, sizesTextForPrint)} className="action-btn" style={{ backgroundColor: 'var(--success)', color: 'white' }}>
                                                    <span className="material-icons">print</span> Print Label
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <div style={{ overflowX: 'auto', marginTop: 'var(--spacing-16)' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Product ID</th>
                                             <th>Brand</th>
                                             <th>Supplier</th>
                                             <th>Name</th>
                                            <th>Subcategory</th>
                                            <th>Item Type</th>
                                            <th>HSN Code</th>
                                            <th>GST Rate</th>
                                            <th>Gender</th>
                                            <th>Cost Price</th>
                                            <th>Sell Price</th>
                                            <th>Profit Margin</th>
                                            <th>Size Selector</th>
                                            <th>Stock Count</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupedCatalog[category].map(item => {
                                            const hasVariants = item.variants && item.variants.length > 0;
                                            const uniqueSizesArray = hasVariants ? [...new Set(item.variants.map(v => v.size))] : (item.size ? [item.size] : []);
                                            const currentSelectedSize = selectedSizes[item.id] || 'All';
                                            
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

                                            const sizesTextForPrint = currentSelectedSize === 'All' ? uniqueSizesArray.join(', ') : currentSelectedSize;

                                            return (
                                                <tr key={item.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                                                    <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{item.id}</td>
                                                     <td style={{ fontWeight: '600' }}>{item.brand || 'Generic'}</td>
                                                     <td>{item.supplierName || 'Generic'}</td>
                                                     <td>{item.name}</td>
                                                    <td>{item.subCategory || '-'}{item.subCategoryPattern && item.subCategoryPattern !== 'default' ? ` (${item.subCategoryPattern})` : ''}</td>
                                                    <td>{item.itemType || '-'}</td>
                                                    <td>{item.hsnCode || '-'}</td>
                                                    <td>{item.gstType === 'GST' ? `${item.gstRate}% (CGST ${item.cgstRate}%, SGST ${item.sgstRate}%)` : 'Non-GST'}</td>
                                                    <td>{item.gender || 'Unisex'}</td>
                                                    <td>₹{item.costPrice}</td>
                                                    <td style={{ fontWeight: 'bold' }}>₹{item.sellPrice}</td>
                                                    <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                                                        {item.profitMargin ? `${item.profitMargin}%` : `${item.costPrice ? Math.round(((item.sellPrice - item.costPrice) / item.costPrice) * 100) : 0}%`}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                            {uniqueSizesArray.length > 0 ? (
                                                                <>
                                                                    <span 
                                                                        onClick={() => handleSizeClick(item.id, 'All')}
                                                                        className="size-badge" 
                                                                        style={{ 
                                                                            cursor: 'pointer', 
                                                                            backgroundColor: currentSelectedSize === 'All' ? 'var(--primary)' : 'var(--secondary-container)',
                                                                            color: currentSelectedSize === 'All' ? 'white' : 'var(--on-secondary-container)',
                                                                            padding: '4px 8px',
                                                                            fontSize: '0.75rem',
                                                                            borderRadius: '4px'
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
                                                                                color: currentSelectedSize === s ? 'white' : 'var(--on-secondary-container)',
                                                                                padding: '4px 8px',
                                                                                fontSize: '0.75rem',
                                                                                borderRadius: '4px'
                                                                            }}
                                                                        >
                                                                            {s}
                                                                        </span>
                                                                    ))}
                                                                </>
                                                            ) : (
                                                                <span className="size-badge" style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}>N/A</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ fontWeight: '600', color: displayStock <= 2 ? 'var(--error)' : 'var(--success)' }}>
                                                        {displayStock}
                                                    </td>
                                                    <td>
                                                        <button 
                                                            onClick={() => printLabel(item, sizesTextForPrint)} 
                                                            className="action-btn" 
                                                            title="Print Label"
                                                            style={{ 
                                                                backgroundColor: 'var(--success)', 
                                                                color: 'white',
                                                                height: '32px',
                                                                padding: '0 12px',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '4px',
                                                                borderRadius: 'var(--radius-md)',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                margin: 0,
                                                                fontSize: '0.85rem'
                                                            }}
                                                        >
                                                            <span className="material-icons" style={{ fontSize: '16px' }}>print</span> Print
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}