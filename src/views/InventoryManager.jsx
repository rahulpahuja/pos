import React, { useState, useEffect, useMemo } from 'react';
import JsBarcode from 'jsbarcode';
// Notice: ColorThief import is completely removed from here!

const generateNewId = () => `A2Z-${Date.now().toString().slice(-6)}`;
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL', 'XXXXXL', 'XXXXXXL', 'XXXXXXXL'];

export default function InventoryManager({ catalog, setCatalog }) {
    const [isEditing, setIsEditing] = useState(false);
    const emptyProduct = { id: generateNewId(), name: '', category: '', gender: 'Unisex', costPrice: '', sellPrice: '', images: [], entryDate: '', variants: [] };
    const [product, setProduct] = useState(emptyProduct);
    const [variantInput, setVariantInput] = useState({ colorName: '', colorCode: '', size: 'M', stockQty: '', barcode: '' });
    const [colorNamesList, setColorNamesList] = useState([]);

    const uniqueCategories = useMemo(() => Array.from(new Set(catalog.map(item => item.category).filter(Boolean))).sort(), [catalog]);

    useEffect(() => {
        fetch('https://cdn.jsdelivr.net/gh/meodai/color-names/dist/colornames.json')
            .then(res => res.json())
            .then(data => setColorNamesList(Object.keys(data).map(hex => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return { hex: hex, name: data[hex], rgb: result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0] };
            })))
            .catch(err => console.warn('Color names not loaded:', err));
    }, []);

    useEffect(() => {
        if (product.variants) {
            product.variants.forEach((v, i) => {
                const svg = document.getElementById(`barcode-variant-${i}`);
                if (svg) JsBarcode(svg, v.barcode, { width: 1.5, height: 40, displayValue: true });
            });
        }
    }, [product.variants]);

    const handleInputChange = (e) => setProduct(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleVariantInputChange = (e) => setVariantInput(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader(); reader.readAsDataURL(file);
            reader.onload = event => {
                const img = new Image(); img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas'); const MAX_WIDTH = 400; const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH; canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.6));
                };
            };
        });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) { alert("Max 5 images."); e.target.value = ""; return; }
        Promise.all(files.map(compressImage)).then(compressed => {
            setProduct(prev => ({ ...prev, images: compressed }));
            if (compressed.length > 0 && colorNamesList.length > 0) {
                const imgElement = new Image(); imgElement.src = compressed[0];
                imgElement.onload = () => {
                    // Call it from the global window object
                    const colorThief = new window.ColorThief(); 
                    const colorArr = colorThief.getColor(imgElement);
                    let minDistance = Infinity; let closestName = "Unknown";
                    for (let c of colorNamesList) {
                        const dist = Math.sqrt(Math.pow(colorArr[0] - c.rgb[0], 2) + Math.pow(colorArr[1] - c.rgb[1], 2) + Math.pow(colorArr[2] - c.rgb[2], 2));
                        if (dist < minDistance) { minDistance = dist; closestName = c.name; }
                    }
                    setVariantInput(prev => ({ ...prev, colorName: closestName }));
                };
            }
        });
    };

    const addVariant = () => {
        if (!variantInput.colorName || !variantInput.size || !variantInput.stockQty) { alert('Please fill color, size, and stock.'); return; }
        const colorCode = (variantInput.colorCode || variantInput.colorName).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
        const barcode = `${product.id}-${colorCode}-${variantInput.size}`;
        const existingVariantIndex = product.variants.findIndex(v => v.barcode === barcode);

        setProduct(prev => {
            const newVariants = [...(prev.variants || [])];
            if (existingVariantIndex !== -1) newVariants[existingVariantIndex] = { ...variantInput, colorCode, barcode, stockQty: Number(variantInput.stockQty) };
            else newVariants.push({ ...variantInput, colorCode, barcode, stockQty: Number(variantInput.stockQty) });
            return { ...prev, variants: newVariants };
        });
        setVariantInput({ colorName: '', colorCode: '', size: 'M', stockQty: '', barcode: '' });
    };

    const removeVariant = (barcode) => setProduct(prev => ({ ...prev, variants: prev.variants.filter(v => v.barcode !== barcode) }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const productToSave = { ...product, costPrice: Number(product.costPrice) || 0, sellPrice: Number(product.sellPrice) || 0 };
        if (!productToSave.variants || productToSave.variants.length === 0) { alert('Add at least one color/size variant.'); return; }
        
        if (isEditing) { setCatalog(catalog.map(item => item.id === product.id ? productToSave : item)); setIsEditing(false); }
        else { setCatalog([...catalog, { ...productToSave, entryDate: new Date().toLocaleString() }]); }
        
        setProduct({ ...emptyProduct, id: generateNewId() });
        setVariantInput({ colorName: '', colorCode: '', size: 'M', stockQty: '', barcode: '' });
        document.getElementById("imageInput").value = "";
    };

    return (
        <div className="card">
            <h3>{isEditing ? `Edit Product: ${product.id}` : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Product ID</label><input type="text" value={product.id} readOnly style={{ color: '#aaa' }} /></div>
                <div className="form-group"><label>Product Name</label><input type="text" name="name" value={product.name} onChange={handleInputChange} required /></div>
                <div className="row-group">
                    <div><label>Category</label><input type="text" name="category" list="categoryOptions" value={product.category} onChange={handleInputChange} placeholder="Select or type..." required /><datalist id="categoryOptions">{uniqueCategories.map((cat, i) => <option key={i} value={cat} />)}</datalist></div>
                    <div><label>Gender</label><select name="gender" value={product.gender} onChange={handleInputChange}><option value="Male">Male</option><option value="Female">Female</option><option value="Unisex">Unisex</option></select></div>
                </div>
                <div className="row-group" style={{ marginTop: '15px' }}>
                    <div><label>Cost Price</label><div className="input-wrapper"><span className="currency-symbol">₹</span><input type="number" name="costPrice" value={product.costPrice} onChange={handleInputChange} min="0" required /></div></div>
                    <div><label>Sell Price (MRP)</label><div className="input-wrapper"><span className="currency-symbol">₹</span><input type="number" name="sellPrice" value={product.sellPrice} onChange={handleInputChange} min="0" required /></div></div>
                </div>
                <div className="form-group" style={{ marginTop: '15px' }}>
                    <label>Images (Max 5)</label><input id="imageInput" type="file" multiple accept="image/*" onChange={handleImageUpload} />
                    {product.images.length > 0 && (<div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>{product.images.map((imgSrc, index) => (<img key={index} src={imgSrc} alt="Preview" className="img-preview" />))}</div>)}
                </div>
                
                {/* Variants Section */}
                <div className="form-group" style={{ marginTop: '15px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '15px', backgroundColor: 'var(--surface-container-low)' }}>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: '12px' }}>{variantInput.colorName ? 'Modify Variant' : 'Add Color/Size/Stock Variant'}</label>
                    <div className="row-group" style={{ gap: '12px' }}>
                        <div><label>Color Name</label><input type="text" name="colorName" value={variantInput.colorName} onChange={handleVariantInputChange} /></div>
                        <div><label>Color Code</label><input type="text" name="colorCode" value={variantInput.colorCode} onChange={handleVariantInputChange} /></div>
                        <div><label>Size</label><select name="size" value={variantInput.size} onChange={handleVariantInputChange}>{sizeOptions.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                        <div><label>Stock Qty</label><input type="number" name="stockQty" value={variantInput.stockQty} onChange={handleVariantInputChange} min="0" /></div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: '6px' }}>
                            <button type="button" className="btn-sm btn-edit" onClick={addVariant} style={{ height: '36px' }}>Add/Update</button>
                        </div>
                    </div>
                    {product.variants && product.variants.length > 0 && (
                        <div style={{ marginTop: '15px', backgroundColor: 'var(--surface-container-low)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                            <strong>Variants:</strong>
                            {product.variants.map((v, i) => (
                                <div key={v.barcode} style={{ backgroundColor: 'var(--surface-container-highest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: 700 }}>{v.colorName}</span><span className="size-badge">{v.size}</span><span>Stock: {v.stockQty}</span>
                                        </div>
                                        <div style={{ marginTop: '8px' }}>
                                            <div style={{ fontSize: '0.85rem' }}>Barcode: <span style={{ fontFamily: 'monospace' }}>{v.barcode}</span></div>
                                            <div className="barcode-container"><svg id={`barcode-variant-${i}`}></svg></div>
                                        </div>
                                    </div>
                                    <button type="button" className="btn-sm btn-delete" onClick={() => removeVariant(v.barcode)}><span className="material-icons">delete</span></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" className="action-btn">{isEditing ? 'Update Product' : 'Save Product'}</button>
            </form>

            <div style={{ marginTop: '40px' }}>
                <h3 style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '10px' }}>Current Inventory</h3>
                {catalog.map((item, index) => (
                    <div key={index} style={{ borderBottom: '1px solid var(--surface-container-high)', padding: '15px 0', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <strong>{item.name}</strong>
                            {item.variants && item.variants.map(v => <span key={v.barcode} className="size-badge" style={{ marginLeft: '8px' }}>{v.colorName}/{v.size}/Stk:{v.stockQty}</span>)}
                            <br /><small>{item.id} | MRP: ₹{item.sellPrice}</small>
                        </div>
                        <div>
                            <button onClick={() => { setProduct(item); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn-sm btn-edit"><span className="material-icons">edit</span></button>
                            <button onClick={() => { if (window.confirm(`Delete ${item.id}?`)) setCatalog(catalog.filter(i => i.id !== item.id)); }} className="btn-sm btn-delete"><span className="material-icons">delete</span></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}