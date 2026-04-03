import React from 'react';

export default function NavigationDrawer({ isDrawerOpen, setIsDrawerOpen, currentTab, setCurrentTab }) {
    const handleNavClick = (tab) => {
        setCurrentTab(tab);
        setIsDrawerOpen(false);
    };

    return (
        <>
            <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
            <div className={`nav-drawer ${isDrawerOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <h2><span className="material-icons">inventory_2</span> Menu</h2>
                    <span className="material-icons" style={{ cursor: 'pointer' }} onClick={() => setIsDrawerOpen(false)}>close</span>
                </div>
                <div className="drawer-content">
                    <button className={`drawer-btn ${currentTab === 'grid' ? 'active' : ''}`} onClick={() => handleNavClick('grid')}><span className="material-icons">grid_view</span> Product Catalog</button>
                    <button className={`drawer-btn ${currentTab === 'pos' ? 'active' : ''}`} onClick={() => handleNavClick('pos')}><span className="material-icons">point_of_sale</span> POS / Billing</button>
                    
                    {/* Returns & Modifiers Button */}
                    <button className={`drawer-btn ${currentTab === 'modifier' ? 'active' : ''}`} onClick={() => handleNavClick('modifier')}><span className="material-icons">find_replace</span> Returns & Modifiers</button>
                    
                    <button className={`drawer-btn ${currentTab === 'admin' ? 'active' : ''}`} onClick={() => handleNavClick('admin')}><span className="material-icons">settings</span> Manage Inventory</button>
                    
                    {/* Invoice Designer Button */}
                    <button className={`drawer-btn ${currentTab === 'designer' ? 'active' : ''}`} onClick={() => handleNavClick('designer')}><span className="material-icons">receipt_long</span> Invoice Designer</button>
                    
                    <button className={`drawer-btn ${currentTab === 'referrers' ? 'active' : ''}`} onClick={() => handleNavClick('referrers')}><span className="material-icons">people</span> Referrers</button>
                    <button className={`drawer-btn ${currentTab === 'customers' ? 'active' : ''}`} onClick={() => handleNavClick('customers')}><span className="material-icons">contacts</span> Customers</button>
                    <button className={`drawer-btn ${currentTab === 'invoices' ? 'active' : ''}`} onClick={() => handleNavClick('invoices')}><span className="material-icons">receipt</span> Invoices</button>
                    <button className={`drawer-btn ${currentTab === 'salesanalytics' ? 'active' : ''}`} onClick={() => handleNavClick('salesanalytics')}><span className="material-icons">trending_up</span> Sales Analytics</button>
                    <button className={`drawer-btn ${currentTab === 'ledger' ? 'active' : ''}`} onClick={() => handleNavClick('ledger')}><span className="material-icons">analytics</span> Sales Ledger</button>
                </div>
            </div>
        </>
    );
}