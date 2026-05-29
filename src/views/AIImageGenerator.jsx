import React, { useState, useRef } from 'react';

const STYLES = [
    { label: 'Realistic', value: 'realistic, photographic, high quality' },
    { label: 'Illustration', value: 'digital illustration, colorful, artistic' },
    { label: 'Minimalist', value: 'minimalist, clean, flat design' },
    { label: 'Product Shot', value: 'product photography, white background, studio lighting' },
    { label: 'Watercolor', value: 'watercolor painting, soft, artistic' },
    { label: '3D Render', value: '3D render, glossy, modern' },
];

const SIZES = [
    { label: 'Square (1:1)', w: 512, h: 512 },
    { label: 'Landscape (4:3)', w: 768, h: 576 },
    { label: 'Portrait (3:4)', w: 576, h: 768 },
    { label: 'Wide (16:9)', w: 896, h: 504 },
];

export default function AIImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
    const [selectedSize, setSelectedSize] = useState(SIZES[0]);
    const [images, setImages] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [count, setCount] = useState(1);
    const seedRef = useRef(Date.now());

    const buildUrl = (seed) => {
        const fullPrompt = `${prompt.trim()}, ${selectedStyle.value}`;
        const encoded = encodeURIComponent(fullPrompt);
        return `https://image.pollinations.ai/prompt/${encoded}?width=${selectedSize.w}&height=${selectedSize.h}&seed=${seed}&nologo=true`;
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt to generate an image.');
            return;
        }
        setError('');
        setIsGenerating(true);
        seedRef.current = Date.now();

        const newImages = Array.from({ length: count }, (_, i) => ({
            id: seedRef.current + i,
            url: buildUrl(seedRef.current + i),
            prompt: prompt.trim(),
            style: selectedStyle.label,
            size: selectedSize.label,
            loaded: false,
            failed: false,
        }));

        setImages(prev => [...newImages, ...prev]);
        setIsGenerating(false);
    };

    const handleImageLoad = (id) => {
        setImages(prev => prev.map(img => img.id === id ? { ...img, loaded: true } : img));
    };

    const handleImageError = (id) => {
        setImages(prev => prev.map(img => img.id === id ? { ...img, failed: true, loaded: true } : img));
    };

    const handleDownload = (img) => {
        const a = document.createElement('a');
        a.href = img.url;
        a.download = `ai-image-${img.id}.jpg`;
        a.target = '_blank';
        a.click();
    };

    const handleCopyUrl = (url) => {
        navigator.clipboard.writeText(url).then(() => {
            /* silent success */
        });
    };

    const handleClear = () => {
        setImages([]);
        setPreviewImage(null);
    };

    return (
        <div style={{ padding: 'var(--spacing-8)' }}>
            {/* Header */}
            <div style={{ marginBottom: 'var(--spacing-24)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-12)', marginBottom: 'var(--spacing-8)' }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <span className="material-icons" style={{ color: 'var(--on-primary)', fontSize: 24 }}>auto_awesome</span>
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--on-surface)' }}>AI Image Generator</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Generate product images, banners & visuals using AI</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-20)', maxWidth: 900 }}>

                {/* Prompt Card */}
                <div className="card" style={{ padding: 'var(--spacing-20)' }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--on-surface)', marginBottom: 'var(--spacing-8)' }}>
                        Describe your image
                    </label>
                    <div style={{ display: 'flex', gap: 'var(--spacing-8)' }}>
                        <textarea
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleGenerate(); }}
                            placeholder="e.g. A pair of red sneakers on a clean white background..."
                            rows={3}
                            style={{
                                flex: 1, padding: 'var(--spacing-12)', borderRadius: 'var(--radius-md)',
                                border: '1.5px solid var(--outline-variant)', fontSize: '0.9rem',
                                fontFamily: 'var(--font-body)', resize: 'vertical',
                                background: 'var(--surface-container-lowest)', color: 'var(--on-surface)',
                                outline: 'none', lineHeight: 1.5,
                            }}
                        />
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                        Tip: Ctrl + Enter to generate
                    </p>
                </div>

                {/* Options Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-16)' }}>

                    {/* Style */}
                    <div className="card" style={{ padding: 'var(--spacing-16)' }}>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Style</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {STYLES.map(s => (
                                <button
                                    key={s.value}
                                    onClick={() => setSelectedStyle(s)}
                                    style={{
                                        padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                                        border: selectedStyle.value === s.value ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                                        background: selectedStyle.value === s.value ? 'var(--primary-container)' : 'transparent',
                                        color: selectedStyle.value === s.value ? 'var(--on-primary-container)' : 'var(--on-surface)',
                                        fontWeight: selectedStyle.value === s.value ? 600 : 400,
                                        fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Size */}
                    <div className="card" style={{ padding: 'var(--spacing-16)' }}>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Size</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {SIZES.map(s => (
                                <button
                                    key={s.label}
                                    onClick={() => setSelectedSize(s)}
                                    style={{
                                        padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                                        border: selectedSize.label === s.label ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                                        background: selectedSize.label === s.label ? 'var(--primary-container)' : 'transparent',
                                        color: selectedSize.label === s.label ? 'var(--on-primary-container)' : 'var(--on-surface)',
                                        fontWeight: selectedSize.label === s.label ? 600 : 400,
                                        fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <span>{s.label}</span>
                                    <span style={{ marginLeft: 6, fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{s.w}×{s.h}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Count + Generate */}
                    <div className="card" style={{ padding: 'var(--spacing-16)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12)' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity</label>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {[1, 2, 4].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setCount(n)}
                                        style={{
                                            flex: 1, padding: '6px', borderRadius: 'var(--radius-sm)',
                                            border: count === n ? '1.5px solid var(--primary)' : '1.5px solid var(--outline-variant)',
                                            background: count === n ? 'var(--primary)' : 'transparent',
                                            color: count === n ? 'var(--on-primary)' : 'var(--on-surface)',
                                            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim()}
                            style={{
                                marginTop: 'auto', padding: 'var(--spacing-12)',
                                borderRadius: 'var(--radius-md)', border: 'none',
                                background: isGenerating || !prompt.trim() ? 'var(--outline-variant)' : 'var(--primary)',
                                color: isGenerating || !prompt.trim() ? 'var(--on-surface-variant)' : 'var(--on-primary)',
                                fontWeight: 700, fontSize: '0.95rem', cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                transition: 'all 0.2s',
                            }}
                        >
                            <span className="material-icons" style={{ fontSize: 20 }}>
                                {isGenerating ? 'hourglass_empty' : 'auto_awesome'}
                            </span>
                            {isGenerating ? 'Generating…' : 'Generate'}
                        </button>

                        {images.length > 0 && (
                            <button
                                onClick={handleClear}
                                style={{
                                    padding: 'var(--spacing-8)',
                                    borderRadius: 'var(--radius-md)', border: '1.5px solid var(--outline-variant)',
                                    background: 'transparent', color: 'var(--on-surface-variant)',
                                    fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                }}
                            >
                                <span className="material-icons" style={{ fontSize: 16 }}>delete_sweep</span>
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        padding: 'var(--spacing-12) var(--spacing-16)', borderRadius: 'var(--radius-md)',
                        background: 'var(--error-container)', color: 'var(--error)',
                        display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem',
                    }}>
                        <span className="material-icons" style={{ fontSize: 18 }}>error_outline</span>
                        {error}
                    </div>
                )}

                {/* Image Grid */}
                {images.length > 0 && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-12)' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                                Generated Images <span style={{ color: 'var(--on-surface-variant)', fontWeight: 400 }}>({images.length})</span>
                            </h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--spacing-16)' }}>
                            {images.map(img => (
                                <div key={img.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
                                    {/* Image */}
                                    <div
                                        style={{
                                            position: 'relative', background: 'var(--surface-container-high)',
                                            aspectRatio: `${selectedSize.w} / ${selectedSize.h}`,
                                            cursor: 'pointer', overflow: 'hidden',
                                        }}
                                        onClick={() => setPreviewImage(img)}
                                    >
                                        {!img.loaded && !img.failed && (
                                            <div style={{
                                                position: 'absolute', inset: 0, display: 'flex',
                                                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                gap: 8, color: 'var(--on-surface-variant)',
                                            }}>
                                                <span className="material-icons" style={{ fontSize: 32, opacity: 0.4 }}>image</span>
                                                <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Generating…</span>
                                            </div>
                                        )}
                                        {img.failed && (
                                            <div style={{
                                                position: 'absolute', inset: 0, display: 'flex',
                                                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                gap: 8, color: 'var(--error)',
                                            }}>
                                                <span className="material-icons" style={{ fontSize: 32 }}>broken_image</span>
                                                <span style={{ fontSize: '0.75rem' }}>Failed to load</span>
                                            </div>
                                        )}
                                        <img
                                            src={img.url}
                                            alt={img.prompt}
                                            onLoad={() => handleImageLoad(img.id)}
                                            onError={() => handleImageError(img.id)}
                                            style={{
                                                width: '100%', height: '100%', objectFit: 'cover',
                                                display: img.loaded && !img.failed ? 'block' : 'none',
                                                transition: 'transform 0.2s',
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
                                            opacity: 0, transition: 'opacity 0.2s', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                        }}
                                            className="img-hover-overlay"
                                        >
                                            <span className="material-icons" style={{ color: '#fff', fontSize: 32 }}>open_in_full</span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div style={{ padding: '10px var(--spacing-12)' }}>
                                        <p style={{
                                            margin: '0 0 6px', fontSize: '0.78rem', color: 'var(--on-surface)',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }} title={img.prompt}>
                                            {img.prompt}
                                        </p>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{
                                                fontSize: '0.7rem', color: 'var(--on-surface-variant)',
                                                background: 'var(--surface-container-high)', padding: '2px 6px',
                                                borderRadius: 'var(--radius-full)',
                                            }}>{img.style}</span>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button
                                                    onClick={() => handleCopyUrl(img.url)}
                                                    title="Copy URL"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--on-surface-variant)', borderRadius: 'var(--radius-sm)' }}
                                                >
                                                    <span className="material-icons" style={{ fontSize: 16 }}>content_copy</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(img)}
                                                    title="Open / Download"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--on-surface-variant)', borderRadius: 'var(--radius-sm)' }}
                                                >
                                                    <span className="material-icons" style={{ fontSize: 16 }}>open_in_new</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {images.length === 0 && (
                    <div style={{
                        padding: 'var(--spacing-40)', textAlign: 'center',
                        color: 'var(--on-surface-variant)', borderRadius: 'var(--radius-xl)',
                        border: '2px dashed var(--outline-variant)', background: 'var(--surface-container-lowest)',
                    }}>
                        <span className="material-icons" style={{ fontSize: 48, opacity: 0.3, display: 'block', marginBottom: 12 }}>image_search</span>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>No images yet</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>Enter a prompt above and hit Generate</p>
                    </div>
                )}
            </div>

            {/* Lightbox Preview */}
            {previewImage && (
                <div
                    onClick={() => setPreviewImage(null)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999, padding: 'var(--spacing-20)',
                    }}
                >
                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
                        <img
                            src={previewImage.url}
                            alt={previewImage.prompt}
                            style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 'var(--radius-lg)', objectFit: 'contain' }}
                        />
                        <button
                            onClick={() => setPreviewImage(null)}
                            style={{
                                position: 'absolute', top: -16, right: -16,
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'var(--surface-container-highest)', border: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', boxShadow: 'var(--shadow-md)',
                            }}
                        >
                            <span className="material-icons" style={{ fontSize: 18, color: 'var(--on-surface)' }}>close</span>
                        </button>
                        <div style={{ marginTop: 12, textAlign: 'center' }}>
                            <p style={{ margin: 0, color: '#fff', fontSize: '0.875rem', opacity: 0.8 }}>{previewImage.prompt}</p>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 10 }}>
                                <button
                                    onClick={() => handleDownload(previewImage)}
                                    style={{
                                        padding: '8px 20px', borderRadius: 'var(--radius-md)',
                                        background: 'var(--primary)', color: 'var(--on-primary)',
                                        border: 'none', fontWeight: 600, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 6,
                                    }}
                                >
                                    <span className="material-icons" style={{ fontSize: 18 }}>open_in_new</span>
                                    Open Image
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .img-hover-overlay { pointer-events: none; }
                div:hover > div.img-hover-overlay { opacity: 1 !important; }
            `}</style>
        </div>
    );
}
