import React from 'react';

export default function NavigationDrawer({ isDrawerOpen, setIsDrawerOpen, currentTab, setCurrentTab, confirmLogout }) {
    const handleNavClick = (tab) => {
        setCurrentTab(tab);
        setIsDrawerOpen(false);
    };

    return (
        <>
            <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
            <div className={`nav-drawer ${isDrawerOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <h2><span className="material-icons">menu_open</span> Menu</h2>
                    <span className="material-icons" style={{ cursor: 'pointer' }} onClick={() => setIsDrawerOpen(false)}>close</span>
                </div>
                <div className="drawer-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    
                    {/* SECTION 1: Sales & Checkout */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.08em', padding: '6px 12px 2px 12px', opacity: 0.8 }}>
                            Sales & Checkout
                        </div>
                        <button className={`drawer-btn ${currentTab === 'pos' ? 'active' : ''}`} onClick={() => handleNavClick('pos')}>
                            <span className="material-icons">point_of_sale</span> POS / Billing
                        </button>
                        <button className={`drawer-btn ${currentTab === 'grid' ? 'active' : ''}`} onClick={() => handleNavClick('grid')}>
                            <span className="material-icons">grid_view</span> Product Catalog
                        </button>
                        <button className={`drawer-btn ${currentTab === 'modifier' ? 'active' : ''}`} onClick={() => handleNavClick('modifier')}>
                            <span className="material-icons">find_replace</span> Returns & Modifiers
                        </button>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--outline-variant)', margin: '8px 0', opacity: 0.6 }} />

                    {/* SECTION 2: Finance & Reports */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.08em', padding: '6px 12px 2px 12px', opacity: 0.8 }}>
                            Finance & Ledger
                        </div>
                        <button className={`drawer-btn ${currentTab === 'invoices' ? 'active' : ''}`} onClick={() => handleNavClick('invoices')}>
                            <span className="material-icons">receipt</span> Invoices
                        </button>
                        <button className={`drawer-btn ${currentTab === 'ledger' ? 'active' : ''}`} onClick={() => handleNavClick('ledger')}>
                            <span className="material-icons">analytics</span> Sales Ledger
                        </button>
                        <button className={`drawer-btn ${currentTab === 'cashbook' ? 'active' : ''}`} onClick={() => handleNavClick('cashbook')}>
                            <span className="material-icons">account_balance_wallet</span> Cashbook & Expenses
                        </button>
                        <button className={`drawer-btn ${currentTab === 'salesanalytics' ? 'active' : ''}`} onClick={() => handleNavClick('salesanalytics')}>
                            <span className="material-icons">trending_up</span> Sales Analytics
                        </button>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--outline-variant)', margin: '8px 0', opacity: 0.6 }} />

                    {/* SECTION 3: Stakeholders */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.08em', padding: '6px 12px 2px 12px', opacity: 0.8 }}>
                            CRM & Stakeholders
                        </div>
                        <button className={`drawer-btn ${currentTab === 'customers' ? 'active' : ''}`} onClick={() => handleNavClick('customers')}>
                            <span className="material-icons">contacts</span> Customers
                        </button>
                        <button className={`drawer-btn ${currentTab === 'parties' ? 'active' : ''}`} onClick={() => handleNavClick('parties')}>
                            <span className="material-icons">handshake</span> Party Management
                        </button>
                        <button className={`drawer-btn ${currentTab === 'referrers' ? 'active' : ''}`} onClick={() => handleNavClick('referrers')}>
                            <span className="material-icons">people</span> Referrers
                        </button>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--outline-variant)', margin: '8px 0', opacity: 0.6 }} />

                    {/* SECTION 4: Setup & Management */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.08em', padding: '6px 12px 2px 12px', opacity: 0.8 }}>
                            Operations & Setup
                        </div>
                        <button className={`drawer-btn ${currentTab === 'admin' ? 'active' : ''}`} onClick={() => handleNavClick('admin')}>
                            <span className="material-icons">inventory</span> Manage Inventory
                        </button>
                        <button className={`drawer-btn ${currentTab === 'designer' ? 'active' : ''}`} onClick={() => handleNavClick('designer')}>
                            <span className="material-icons">receipt_long</span> Invoice Designer
                        </button>
                        <button className={`drawer-btn ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => handleNavClick('profile')}>
                            <span className="material-icons">settings</span> Profile & Settings
                        </button>
                    </div>

                </div>
                
                {/* Logout Button Pinned to Bottom of Drawer */}
                <div style={{ padding: 'var(--spacing-16)', borderTop: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)' }}>
                    <button 
                        className="drawer-btn" 
                        onClick={() => { setIsDrawerOpen(false); confirmLogout(); }}
                        style={{ width: '100%', color: 'var(--error)', transition: 'all 0.2s ease', backgroundColor: 'transparent', margin: 0 }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--error-container)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        <span className="material-icons" style={{ color: 'var(--error)' }}>power_settings_new</span> Logout
                    </button>
                </div>
            </div>
        </>
    );
}