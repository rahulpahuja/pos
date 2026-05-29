// --- COMPREHENSIVE DUMMY DATA SEEDING UTILITY ---

export const getRahulDummyData = () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    const todayMorning = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    const todayNow = new Date().toISOString();

    // 1. User Profile Setup
    const profile = {
        userId: 'rahul',
        password: 'rahul',
        name: 'Rahul Pahuja',
        email: 'rahul@m1xpos.com',
        phone: '+91-9988776655',
        address: 'M1x Corporate Tower, Vijay Nagar, Indore, M.P. - 452010',
        gstNumber: '23AAAAA1111A1Z1',
        logo: null,
        logoHeight: 50,
        logoAlign: 'center'
    };

    // Define 50 authentic products with categorized photos from Unsplash
    const productTemplates = [
        // Category: Apparel (15 items)
        { name: 'Slim Fit Cotton Chinos', category: 'Apparel', costPrice: 700, sellPrice: 1200, img: 'photo-1624378439575-d8705ad7ae80', gender: 'Male' },
        { name: 'Oversized Vintage Hoodie', category: 'Apparel', costPrice: 1000, sellPrice: 1800, img: 'photo-1556821840-3a63f95609a7', gender: 'Unisex' },
        { name: 'Classic Denim Jacket', category: 'Apparel', costPrice: 1500, sellPrice: 2800, img: 'photo-1576995853123-5a10305d93c0', gender: 'Unisex' },
        { name: 'Premium Crewneck T-Shirt', category: 'Apparel', costPrice: 400, sellPrice: 800, img: 'photo-1521572267360-ee0c2909d518', gender: 'Unisex' },
        { name: "Women's High-Rise Leggings", category: 'Apparel', costPrice: 600, sellPrice: 1300, img: 'photo-1506152983158-b4a74a01c721', gender: 'Female' },
        { name: "Men's Sleek Bomber Jacket", category: 'Apparel', costPrice: 2000, sellPrice: 3800, img: 'photo-1551028719-00167b16eac5', gender: 'Male' },
        { name: 'Linen Summer Shirt', category: 'Apparel', costPrice: 500, sellPrice: 1100, img: 'photo-1596755094514-f87e34085b2c', gender: 'Male' },
        { name: 'Knit Turtleneck Sweater', category: 'Apparel', costPrice: 800, sellPrice: 1600, img: 'photo-1614975058789-41316d0e2e9c', gender: 'Female' },
        { name: 'Cargo Utility Shorts', category: 'Apparel', costPrice: 450, sellPrice: 950, img: 'photo-1591195853828-11db59a44f6b', gender: 'Male' },
        { name: 'Pleated Midi Skirt', category: 'Apparel', costPrice: 600, sellPrice: 1400, img: 'photo-1583496661160-fb48862c6a72', gender: 'Female' },
        { name: 'Athletic Gym Joggers', category: 'Apparel', costPrice: 700, sellPrice: 1500, img: 'photo-1515886657613-9f3515b0c78f', gender: 'Unisex' },
        { name: 'Formal Oxford Dress Shirt', category: 'Apparel', costPrice: 900, sellPrice: 1950, img: 'photo-1603252109303-2751441dd157', gender: 'Male' },
        { name: 'Sherpa Lined Corduroy Jacket', category: 'Apparel', costPrice: 1800, sellPrice: 3500, img: 'photo-1507679799987-c73779587ccf', gender: 'Unisex' },
        { name: 'Graphic Streetwear Tee', category: 'Apparel', costPrice: 350, sellPrice: 850, img: 'photo-1503342217505-b0a15ec3261c', gender: 'Unisex' },
        { name: 'Waterproof Active Windbreaker', category: 'Apparel', costPrice: 1100, sellPrice: 2200, img: 'photo-1548883354-7622d03aca27', gender: 'Unisex' },
        
        // Category: Footwear (10 items)
        { name: 'Runner Pro Sneakers', category: 'Footwear', costPrice: 1400, sellPrice: 2400, img: 'photo-1542291026-7eec264c27ff', gender: 'Unisex' },
        { name: 'Classic Leather Loafers', category: 'Footwear', costPrice: 1800, sellPrice: 3500, img: 'photo-1533867617858-e7b97e060509', gender: 'Male' },
        { name: 'Canvas Low-Top Sneakers', category: 'Footwear', costPrice: 600, sellPrice: 1200, img: 'photo-1525966222134-fcfa99dd8ec7', gender: 'Unisex' },
        { name: 'Suede Chelsea Boots', category: 'Footwear', costPrice: 2200, sellPrice: 4500, img: 'photo-1608256246200-53e635b5b65f', gender: 'Male' },
        { name: 'Athletic Trainer Shoes', category: 'Footwear', costPrice: 1300, sellPrice: 2600, img: 'photo-1460353581641-37baddab0fa2', gender: 'Unisex' },
        { name: 'Cozy Slide Sandals', category: 'Footwear', costPrice: 300, sellPrice: 750, img: 'photo-1603487742131-4160ec999306', gender: 'Unisex' },
        { name: 'Vintage Wingtip Brogues', category: 'Footwear', costPrice: 2500, sellPrice: 4800, img: 'photo-1531310197839-ccf54634509e', gender: 'Male' },
        { name: 'Hiking Trail Waterproof Boots', category: 'Footwear', costPrice: 2100, sellPrice: 4200, img: 'photo-1520639888713-7851133b1ed0', gender: 'Unisex' },
        { name: 'Minimalist Court Sneakers', category: 'Footwear', costPrice: 1200, sellPrice: 2300, img: 'photo-1595950653106-6c9ebd614d3a', gender: 'Unisex' },
        { name: 'Platform High-Top Canvas', category: 'Footwear', costPrice: 850, sellPrice: 1750, img: 'photo-1549298916-b41d501d3772', gender: 'Female' },

        // Category: Accessories (10 items)
        { name: 'Minimalist Leather Wallet', category: 'Accessories', costPrice: 400, sellPrice: 950, img: 'photo-1627124118304-4f273b3c373c', gender: 'Unisex' },
        { name: 'Chronograph Steel Watch', category: 'Accessories', costPrice: 3000, sellPrice: 6500, img: 'photo-1523275335684-37898b6baf30', gender: 'Unisex' },
        { name: 'Polarized Aviator Sunglasses', category: 'Accessories', costPrice: 600, sellPrice: 1500, img: 'photo-1511499767150-a48a237f0083', gender: 'Unisex' },
        { name: 'Canvas Travel Duffle Bag', category: 'Accessories', costPrice: 1200, sellPrice: 2400, img: 'photo-1553062407-98eeb64c6a62', gender: 'Unisex' },
        { name: 'Brass Buckle Leather Belt', category: 'Accessories', costPrice: 350, sellPrice: 850, img: 'photo-1624222247344-550fb8ec8bd6', gender: 'Unisex' },
        { name: 'Commuter Laptop Backpack', category: 'Accessories', costPrice: 1400, sellPrice: 2900, img: 'photo-1553062407-98eeb64c6a62', gender: 'Unisex' },
        { name: 'Knit Beanie Hat', category: 'Accessories', costPrice: 250, sellPrice: 600, img: 'photo-1576871337622-98d48d4aa53e', gender: 'Unisex' },
        { name: 'Silk Patterned Necktie', category: 'Accessories', costPrice: 300, sellPrice: 800, img: 'photo-1598033129183-c4f50c736f10', gender: 'Male' },
        { name: 'Warm Wool Scarf', category: 'Accessories', costPrice: 400, sellPrice: 950, img: 'photo-1520903781411-0e20eebd71d5', gender: 'Unisex' },
        { name: 'Stainless Steel Key Organizer', category: 'Accessories', costPrice: 250, sellPrice: 600, img: 'photo-1582139329536-e7284fece509', gender: 'Unisex' },

        // Category: Electronics (8 items)
        { name: 'Wireless ANC Earbuds', category: 'Electronics', costPrice: 2000, sellPrice: 3500, img: 'photo-1590658268037-6bf12165a8df', gender: 'Unisex' },
        { name: 'Bluetooth Portable Speaker', category: 'Electronics', costPrice: 1500, sellPrice: 2990, img: 'photo-1608043152269-423dbba4e7e1', gender: 'Unisex' },
        { name: 'Fast Charging Power Bank', category: 'Electronics', costPrice: 800, sellPrice: 1750, img: 'photo-1609592424109-dd825b68233f', gender: 'Unisex' },
        { name: 'USB-C Braided Cable (1m)', category: 'Electronics', costPrice: 120, sellPrice: 390, img: 'photo-1563770660941-20978e870e26', gender: 'Unisex' },
        { name: 'Wireless Desktop Mouse', category: 'Electronics', costPrice: 600, sellPrice: 1290, img: 'photo-1615663245857-ac93bb7c39e7', gender: 'Unisex' },
        { name: 'Mechanical Gaming Keyboard', category: 'Electronics', costPrice: 2200, sellPrice: 4500, img: 'photo-1618384887929-16ec33fab9ef', gender: 'Unisex' },
        { name: 'Smart Fitness Tracker', category: 'Electronics', costPrice: 1800, sellPrice: 3200, img: 'photo-1575311373937-040b8e1fd5b6', gender: 'Unisex' },
        { name: 'Dual-Device Wireless Charger', category: 'Electronics', costPrice: 900, sellPrice: 1990, img: 'photo-1622445262465-2481c4574875', gender: 'Unisex' },

        // Category: Home & Living (7 items)
        { name: 'Vacuum Insulated Water Bottle', category: 'Home & Living', costPrice: 500, sellPrice: 1200, img: 'photo-1602143407151-7111542de6e8', gender: 'Unisex' },
        { name: 'Ceramic Coffee Mug', category: 'Home & Living', costPrice: 200, sellPrice: 500, img: 'photo-1514432324607-a09d9b4aefdd', gender: 'Unisex' },
        { name: 'Scented Soy Wax Candle', category: 'Home & Living', costPrice: 300, sellPrice: 790, img: 'photo-1603006905003-be475563bc59', gender: 'Unisex' },
        { name: 'Bamboo Fiber Lunch Box', category: 'Home & Living', costPrice: 350, sellPrice: 850, img: 'photo-1534723328310-e82dad3ee43f', gender: 'Unisex' },
        { name: 'Memory Foam Travel Pillow', category: 'Home & Living', costPrice: 400, sellPrice: 990, img: 'photo-1520262494112-9fe481d36ec3', gender: 'Unisex' },
        { name: 'Double-Wall Espresso Glasses', category: 'Home & Living', costPrice: 300, sellPrice: 690, img: 'photo-1578314675249-a6910f80cc4e', gender: 'Unisex' },
        { name: 'Felt Desk Organizer Mat', category: 'Home & Living', costPrice: 450, sellPrice: 990, img: 'photo-1585776245991-cf89dd7fc73a', gender: 'Unisex' }
    ];

    // Generate rich variants programmatically
    const catalogData = productTemplates.map((tmpl, idx) => {
        const prodIndex = idx + 1; // 1-indexed for barcodes
        const isApparel = tmpl.category === 'Apparel';
        const isFootwear = tmpl.category === 'Footwear';
        const isHome = tmpl.category === 'Home & Living';

        const sizes = isApparel ? ['S', 'M', 'L', 'XL'] : isFootwear ? ['8', '9', '10'] : isHome ? ['Medium', 'Large'] : ['Standard'];
        const productColors = isApparel 
            ? ['Navy Blue', 'Olive Green', 'Charcoal'] 
            : isFootwear 
            ? ['Carbon Black', 'Neon Blue'] 
            : isHome
            ? ['Slate Grey', 'Stone White']
            : ['Matte Black', 'Arctic White'];

        const variants = [];
        let variantId = 1;
        
        productColors.forEach(color => {
            sizes.forEach(size => {
                // Determine a realistic stock count. Make some variant stock 0 or low (<=2) to test filtering
                let stockQty = Math.floor(Math.random() * 12) + 3; // default: 3 to 14
                if (prodIndex === 1 && size === '34') stockQty = 2; // low stock example
                if (prodIndex === 1 && size === '36') stockQty = 0; // out of stock example
                if (prodIndex === 16 && size === '8') stockQty = 5;
                if (prodIndex === 16 && size === '9') stockQty = 7;
                if (prodIndex === 3 && size === 'XL') stockQty = 3;

                variants.push({
                    size,
                    colorName: color,
                    barcode: `${1000 + prodIndex}${variantId++}`, // sequential code structure: "10011", "10012", etc.
                    stockQty
                });
            });
        });

        return {
            id: `M1X-${tmpl.category.slice(0,3).toUpperCase()}-${100 + prodIndex}`,
            name: tmpl.name,
            category: tmpl.category,
            gender: tmpl.gender || 'Unisex',
            costPrice: tmpl.costPrice,
            sellPrice: tmpl.sellPrice,
            images: [`https://images.unsplash.com/${tmpl.img}?auto=format&fit=crop&w=300&q=80`],
            variants
        };
    });

    // 3. Customers Database
    const customersData = [
        { id: 16210001, name: 'Priya Sharma', phone: '9876543210', joinDate: threeDaysAgo },
        { id: 16210002, name: 'Amit Verma', phone: '9826012345', joinDate: twoDaysAgo },
        { id: 16210003, name: 'Rohan Gupta', phone: '7000112233', joinDate: todayMorning }
    ];

    // 4. Sales Referrers / Staff DB
    const referrersData = [
        { id: 'ref-1', name: 'Vicky', details: 'Floor Associate' },
        { id: 'ref-2', name: 'Sunny', details: 'Counter Executive' }
    ];

    // 5. Invoices / Sales Ledger (using generated barcodes matching above)
    // - Invoice 1: Hoodie (Prod Index 2, Heather Grey M -> 10021)
    // - Invoice 2: Sneakers (Prod Index 16, Carbon Black 9 -> 10162) + Chinos (Prod Index 1, Olive Green 32 -> 10012)
    // - Invoice 3: Earbuds (Prod Index 36, Matte Black Standard -> 10361)
    // - Invoice 4: Hoodie (Prod Index 2, Charcoal XL -> 10023) + Chinos (Prod Index 1, Olive Green 30 -> 10011)
    // - Invoice 5: Chinos (Prod Index 1, Olive Green 30 -> 10011) (partially returned)
    const salesData = [
        {
            invoiceNo: 'INV-500101',
            date: threeDaysAgo,
            items: [
                { id: 'M1X-APP-102', name: 'Oversized Vintage Hoodie', barcode: '10021', size: 'M', colorName: 'Navy Blue', qty: 1, sellPrice: 1800 }
            ],
            subtotal: 1800,
            discountPercentage: 10,
            discountAmount: 180,
            grandTotal: 1620,
            referrer: 'Vicky',
            customerName: 'Priya Sharma',
            customerPhone: '9876543210',
            paymentType: 'full',
            amountPaid: 1620,
            balanceDue: 0
        },
        {
            invoiceNo: 'INV-500102',
            date: twoDaysAgo,
            items: [
                { id: 'M1X-FOO-116', name: 'Runner Pro Sneakers', barcode: '10162', size: '9', colorName: 'Carbon Black', qty: 1, sellPrice: 2400 },
                { id: 'M1X-APP-101', name: 'Slim Fit Cotton Chinos', barcode: '10012', size: '32', colorName: 'Olive Green', qty: 1, sellPrice: 1200 }
            ],
            subtotal: 3600,
            discountPercentage: 0,
            discountAmount: 0,
            grandTotal: 3600,
            referrer: 'Sunny',
            customerName: 'Amit Verma',
            customerPhone: '9826012345',
            paymentType: 'partial',
            amountPaid: 2000,
            balanceDue: 1600
        },
        {
            invoiceNo: 'INV-500103',
            date: yesterday,
            items: [
                { id: 'M1X-ELE-136', name: 'Wireless ANC Earbuds', barcode: '10361', size: 'Standard', colorName: 'Matte Black', qty: 1, sellPrice: 3500 }
            ],
            subtotal: 3500,
            discountPercentage: 0,
            discountAmount: 0,
            grandTotal: 3500,
            referrer: '',
            customerName: '',
            customerPhone: '',
            paymentType: 'full',
            amountPaid: 3500,
            balanceDue: 0
        },
        {
            invoiceNo: 'INV-500104',
            date: todayMorning,
            items: [
                { id: 'M1X-APP-102', name: 'Oversized Vintage Hoodie', barcode: '10023', size: 'XL', colorName: 'Navy Blue', qty: 1, sellPrice: 1800 },
                { id: 'M1X-APP-101', name: 'Slim Fit Cotton Chinos', barcode: '10011', size: '30', colorName: 'Olive Green', qty: 1, sellPrice: 1200 }
            ],
            subtotal: 3000,
            discountPercentage: 5,
            discountAmount: 150,
            grandTotal: 2850,
            referrer: 'Vicky',
            customerName: 'Rohan Gupta',
            customerPhone: '7000112233',
            paymentType: 'partial',
            amountPaid: 1500,
            balanceDue: 1350
        },
        {
            invoiceNo: 'INV-500105',
            date: todayNow,
            items: [
                { id: 'M1X-APP-101', name: 'Slim Fit Cotton Chinos', barcode: '10011', size: '30', colorName: 'Olive Green', qty: 2, sellPrice: 1200 }
            ],
            subtotal: 2400,
            discountPercentage: 0,
            discountAmount: 0,
            grandTotal: 1200,
            referrer: '',
            customerName: 'Priya Sharma',
            customerPhone: '9876543210',
            paymentType: 'full',
            amountPaid: 1200,
            balanceDue: 0,
            status: 'RETURNED',
            refundAmount: 1200,
            returnedItems: [
                { barcode: '10011', name: 'Slim Fit Cotton Chinos', sellPrice: 1200, colorName: 'Olive Green', size: '30', qty: 1 }
            ]
        }
    ];

    // 6. Parties Credit Accounts
    const partiesData = [
        {
            id: 'PRT-12345',
            name: 'Amit Verma',
            phone: '9826012345',
            email: 'amit.verma@example.com',
            address: 'Vijay Nagar, Indore, MP',
            gstin: '',
            notes: 'Credit client. Restocking fee waived.',
            balance: 1600,
            createdDate: twoDaysAgo,
            history: [
                {
                    id: 'TXN-SALE-500102',
                    date: twoDaysAgo,
                    type: 'sale',
                    invoiceNo: 'INV-500102',
                    amount: 3600,
                    paid: 2000,
                    balanceDue: 1600,
                    description: 'Purchased items on credit (Invoice: INV-500102)'
                }
            ]
        },
        {
            id: 'PRT-67890',
            name: 'Rohan Gupta',
            phone: '7000112233',
            email: 'rohan.gupta@example.com',
            address: 'Rajendra Nagar, Indore, MP',
            gstin: '',
            notes: 'Dues paid within 15 days.',
            balance: 1350,
            createdDate: todayMorning,
            history: [
                {
                    id: 'TXN-SALE-500104',
                    date: todayMorning,
                    type: 'sale',
                    invoiceNo: 'INV-500104',
                    amount: 2850,
                    paid: 1500,
                    balanceDue: 1350,
                    description: 'Purchased items on credit (Invoice: INV-500104)'
                }
            ]
        }
    ];

    // 7. Manual Expenses Outflows
    const expensesData = [
        { id: 'EXP-101', amount: 8000, category: 'Rent', particulars: 'Store Monthly Rent (Vijay Nagar Hub)', type: 'outflow', paymentMode: 'Cash', date: threeDaysAgo },
        { id: 'EXP-102', amount: 1500, category: 'Utilities', particulars: 'Electricity Bill', type: 'outflow', paymentMode: 'UPI', date: yesterday },
        { id: 'EXP-103', amount: 350, category: 'Other', particulars: 'Snacks & tea for showroom staff', type: 'outflow', paymentMode: 'Cash', date: todayMorning }
    ];

    // 8. Invoice Layout Setup
    const settingsData = {
        paperSize: '80mm',
        fontFamily: "'Outfit', sans-serif",
        fontColor: '#1e3a8a',
        headerMessage: 'Composition Scheme - Tax Invoice',
        footerMessage: 'Thank you for shopping at M1x!\nExchanges allowed within 7 days with tags.',
        columns: { sno: true, item: true, variants: true, rate: true, qty: true, amount: true },
        tableStyle: { borderWidth: 1, fontSize: 11, padding: 5 },
        customFields: [
            { id: 1, label: 'Payment Mode', value: 'Counter Pay' },
            { id: 2, label: 'Operator', value: 'Rahul P.' }
        ]
    };

    return {
        profile,
        catalogData,
        salesData,
        customersData,
        referrersData,
        partiesData,
        expensesData,
        settingsData
    };
};
