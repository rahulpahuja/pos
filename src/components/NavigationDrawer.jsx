import React, { useState } from 'react';

export default function NavigationDrawer({ isDrawerOpen, setIsDrawerOpen, currentTab, setCurrentTab, confirmLogout }) {
    const [isHovered, setIsHovered] = useState(false);

    const isExpanded = isDrawerOpen || isHovered;

    const handleNavClick = (tab) => {
        setCurrentTab(tab);
        // Only collapse overlay on mobile
        if (window.innerWidth <= 768) {
            setIsDrawerOpen(false);
        }
    };

    return (
        <>
            <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
            <div 
                className={`nav-drawer ${isDrawerOpen ? 'open' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="drawer-header" style={{ display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'space-between' : 'center', transition: 'all 0.3s ease' }}>
                    {isExpanded ? (
                        <>
                            <h2><span className="material-icons">menu_open</span> Menu</h2>
                            <span className="material-icons" style={{ cursor: 'pointer' }} onClick={() => setIsDrawerOpen(false)}>close</span>
                        </>
                    ) : (
                        <span className="material-icons" style={{ cursor: 'pointer', fontSize: '28px', color: 'var(--primary)', margin: 0 }}>point_of_sale</span>
                    )}
                </div>
                
                <div className="drawer-content">
                    
                    {/* SECTION 1: Sales & Checkout */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div className="drawer-section-label">
                            Sales & Checkout
                        </div>
                        <button className={`drawer-btn ${currentTab === 'pos' ? 'active' : ''}`} onClick={() => handleNavClick('pos')} title="POS / Billing">
                            <span className="material-icons">point_of_sale</span>
                            <span className="drawer-text">POS / Billing</span>
                        </button>
                        <button className={`drawer-btn ${currentTab === 'grid' ? 'active' : ''}`} onClick={() => handleNavClick('grid')} title="Product Catalog">
                            <span className="material-icons">grid_view</span>
                            <span className="drawer-text">Product Catalog</span>
                        </button>
                        <button className={`drawer-btn ${currentTab === 'modifier' ? 'active' : ''}`} onClick={() => handleNavClick('modifier')} title="Returns & Modifiers">
                            <span className="material-icons">find_replace</span>
                            <span className="drawer-text">Returns & Modifiers</span>
                        </button>
                    </div>

                    <hr className="drawer-divider" />

                    {/* SECTION 2: Finance & Reports */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div className="drawer-section-label">
                            Finance & Ledger
                        </div>
                        <button className={`drawer-btn ${currentTab === 'invoices' ? 'active' : ''}`} onClick={() => handleNavClick('invoices')} title="Invoices">
                            <span className="material-icons">receipt</span>
                            <span className="drawer-text">Invoices</span>
                        </button>
                        <button className={`drawer-btn ${currentTab === 'ledger' ? 'active' : ''}`} onClick={() => handleNavClick('ledger')} title="Sales Ledger">
                            <span className="material-icons">analytics</span>
                            <span className="drawer-text">Sales Ledger</span>
                        </button>
                        <button className={`drawer-btn ${currentTab === 'cashbook' ? 'active' : ''}`} onClick={() => handleNavClick('cashbook')} title="Cashbook & Expenses">
                            <span className="material-icons">account_balance_wallet</span>
                            <span className="drawer-text">Cashbook & Expenses</span>
                        </button>
                        <button className={`drawer-btn ${currentTab === 'salesanalytics' ? 'active' : ''}`} onClick={() => handleNavClick('salesanalytics')} title="Sales Analytics">
                            <span className="material-icons">trending_up</span>
                            <span className="drawer-text">Sales Analytics</span>
                        </button>
                    </div>

                    <hr className="drawer-divider" />

                    {/* SECTION 3: Stakeholders */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div className="drawer-section-label">
                            CRM & Stakeholders
                        </div>
                        <button className={`drawer-btn ${currentTab === 'customers' ? 'active' : ''}`} onClick={() => handleNavClick('customers')} title="Customers">
                            <span className="material-icons">contacts</span>
                            <span className="drawer-text">Customers</span>
                        </button>
                        <button className={`drawer-btn ${currentTab === 'parties' ? 'active' : ''}`} onClick={() => handleNavClick('parties')} title="Party Management">
                            <span className="material-icons">handshake</span>
                            <span className="drawer-text">Party Management</span>
                        </button>
                        <button className={`drawer-btn ${currentTab === 'referrers' ? 'active' : ''}`} onClick={() => handleNavClick('referrers')} title="Referrers">
                            <span className="material-icons">people</span>
                            <span className="drawer-text">Referrers</span>
                        </button>
                    </div>

                    <hr className="drawer-divider" />

                    {/* SECTION 4: Setup & Management */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div className="drawer-section-label">
                            Operations & Setup
                        </div>
                        <button className={`drawer-btn ${currentTab === 'admin' ? 'active' : ''}`} onClick={() => handleNavClick('admin')} title="Manage Inventory">
                            <span className="material-icons">inventory</span>
                            <span className="drawer-text">Manage Inventory</span>
                        </button>
                        <button className={`drawer-btn ${currentTab === 'designer' ? 'active' : ''}`} onClick={() => handleNavClick('designer')} title="Invoice Designer">
                            <span className="material-icons">receipt_long</span>
                            <span className="drawer-text">Invoice Designer</span>
                        </button>
                        <button className={`drawer-btn ${currentTab === 'labeldesigner' ? 'active' : ''}`} onClick={() => handleNavClick('labeldesigner')} title="Label Designer">
                            <span className="material-icons">label</span>
                            <span className="drawer-text">Label Designer</span>
                        </button>
                        <button className={`drawer-btn ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => handleNavClick('profile')} title="Profile & Settings">
                            <span className="material-icons">settings</span>
                            <span className="drawer-text">Profile & Settings</span>
                        </button>
                    </div>

                    <hr className="drawer-divider" />

                    {/* SECTION 5: AI Intelligence */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div className="drawer-section-label">
                            AI Intelligence
                        </div>
                        <button className="drawer-btn has-badge" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} title="Smart Sales Forecaster (Soon)">
                            <span className="btn-content">
                                <span className="material-icons">psychology</span>
                                <span className="drawer-text">Smart Sales Forecaster</span>
                            </span>
                            <span className="badge-soon">Soon</span>
                        </button>
                        <button className="drawer-btn has-badge" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} title="Customer Insights AI (Soon)">
                            <span className="btn-content">
                                <span className="material-icons">auto_awesome</span>
                                <span className="drawer-text">Customer Insights AI</span>
                            </span>
                            <span className="badge-soon">Soon</span>
                        </button>
                    </div>

                </div>
                
                {/* Logout Button Pinned to Bottom of Drawer */}
                <div className="logout-container">
                    <button 
                        className="drawer-btn" 
                        onClick={() => { setIsDrawerOpen(false); confirmLogout(); }}
                        style={{ width: '100%', color: 'var(--error)', transition: 'all 0.2s ease', backgroundColor: 'transparent', margin: 0 }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--error-container)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        title="Logout"
                    >
                        <span className="material-icons" style={{ color: 'var(--error)' }}>power_settings_new</span>
                        <span className="drawer-text">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}