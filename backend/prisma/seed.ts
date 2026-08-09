import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding NEXORA SQLite database...');

  // Clear existing data
  await prisma.activityLog.deleteMany();
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.customerFollowup.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('nexora@2024', 12);

  // Users
  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Arjun Mehta', email: 'admin@nexora.demo', passwordHash: password, role: 'ADMIN', avatarColor: '#6366f1' } }),
    prisma.user.create({ data: { name: 'Priya Sharma', email: 'sales@nexora.demo', passwordHash: password, role: 'SALES', avatarColor: '#0ea5e9' } }),
    prisma.user.create({ data: { name: 'Rajesh Kumar', email: 'warehouse@nexora.demo', passwordHash: password, role: 'WAREHOUSE', avatarColor: '#10b981' } }),
    prisma.user.create({ data: { name: 'Kavitha Nair', email: 'accounts@nexora.demo', passwordHash: password, role: 'ACCOUNTS', avatarColor: '#f59e0b' } }),
  ]);
  const [admin, sales, warehouse, accounts] = users;
  console.log('✅ Users created');

  // Products
  const productData = [
    { name: 'Premium Basmati Rice 25kg', sku: 'SKU-BAS-001', category: 'Rice & Grains', price: 1850, currentStock: 245, minStock: 50, warehouse: 'Warehouse A', unit: 'bags', description: 'Long-grain premium aged basmati' },
    { name: 'Sunflower Oil 5L', sku: 'SKU-OIL-002', category: 'Edible Oils', price: 720, currentStock: 8, minStock: 30, warehouse: 'Warehouse A', unit: 'cans', description: 'Refined sunflower cooking oil' },
    { name: 'Wheat Flour 10kg', sku: 'SKU-FLR-003', category: 'Flour & Grains', price: 380, currentStock: 180, minStock: 40, warehouse: 'Warehouse B', unit: 'bags', description: 'Chakki fresh atta' },
    { name: 'Sugar 25kg', sku: 'SKU-SUG-004', category: 'Sugar & Sweeteners', price: 950, currentStock: 3, minStock: 25, warehouse: 'Warehouse A', unit: 'bags', description: 'M-grade refined sugar' },
    { name: 'Toor Dal 5kg', sku: 'SKU-DAL-005', category: 'Pulses', price: 420, currentStock: 95, minStock: 20, warehouse: 'Warehouse B', unit: 'bags', description: 'Premium toor dal' },
    { name: 'Chana Dal 5kg', sku: 'SKU-DAL-006', category: 'Pulses', price: 390, currentStock: 78, minStock: 20, warehouse: 'Warehouse B', unit: 'bags', description: 'Split Bengal gram' },
    { name: 'Mustard Oil 5L', sku: 'SKU-OIL-007', category: 'Edible Oils', price: 780, currentStock: 0, minStock: 25, warehouse: 'Warehouse A', unit: 'cans', description: 'Kachi ghani mustard oil' },
    { name: 'Sona Masoori Rice 25kg', sku: 'SKU-RIC-008', category: 'Rice & Grains', price: 1350, currentStock: 165, minStock: 40, warehouse: 'Warehouse A', unit: 'bags', description: 'Lightweight everyday rice' },
    { name: 'Refined Groundnut Oil 5L', sku: 'SKU-OIL-009', category: 'Edible Oils', price: 840, currentStock: 42, minStock: 20, warehouse: 'Warehouse A', unit: 'cans', description: 'Refined peanut oil' },
    { name: 'Moong Dal 5kg', sku: 'SKU-DAL-010', category: 'Pulses', price: 510, currentStock: 12, minStock: 20, warehouse: 'Warehouse B', unit: 'bags', description: 'Split green gram' },
  ];

  const products = await Promise.all(
    productData.map(p => prisma.product.create({ data: p }))
  );
  console.log('✅ Products created');

  // Customers
  const customerData = [
    { name: 'Ramesh Traders', business: 'Ramesh General Store', type: 'WHOLESALE', phone: '+91 98765 43210', email: 'ramesh@traders.com', status: 'ACTIVE', address: '12 Market Yard, APMC Market', city: 'Mumbai', state: 'Maharashtra', gstin: '27AAAAA0000A1Z5', createdById: sales.id },
    { name: 'Sri Lakshmi Distributors', business: 'Sri Lakshmi Enterprises', type: 'DISTRIBUTOR', phone: '+91 98123 45678', email: 'info@srilakshmi.com', status: 'ACTIVE', address: '45 Industrial Area, Phase II', city: 'Bengaluru', state: 'Karnataka', gstin: '29BBBBB1111B1Z2', createdById: sales.id },
    { name: 'Metro Wholesale Mart', business: 'Metro Retail Pvt Ltd', type: 'WHOLESALE', phone: '+91 97654 32109', email: 'orders@metromart.in', status: 'ACTIVE', address: '88 Ring Road, Near Flyover', city: 'Hyderabad', state: 'Telangana', gstin: '36CCCCC2222C1Z9', createdById: admin.id },
    { name: 'Vijaya Enterprises', business: 'Vijaya Stores', type: 'RETAIL', phone: '+91 99887 76655', email: 'contact@vijayaent.com', status: 'ACTIVE', address: '23 Main Bazaar Road', city: 'Chennai', state: 'Tamil Nadu', gstin: '33DDDDD3333D1Z6', createdById: sales.id },
  ];

  const customers = await Promise.all(
    customerData.map(c => prisma.customer.create({ data: c }))
  );
  console.log('✅ Customers created');

  // Stock movements
  for (const p of products) {
    await prisma.stockMovement.create({
      data: {
        productId: p.id,
        type: 'IN',
        quantity: p.currentStock + 50,
        reason: 'INITIAL_IMPORT',
        reference: 'IMPORT-001',
        createdById: warehouse.id,
      },
    });
  }
  console.log('✅ Stock movements created');

  // Sample Challan
  const sampleChallan = await prisma.challan.create({
    data: {
      challanNumber: 'CH-00001',
      customerId: customers[0].id,
      status: 'CONFIRMED',
      notes: 'Initial demo delivery challan',
      subtotal: 3700,
      grandTotal: 3700,
      createdById: sales.id,
      confirmedAt: new Date(),
      items: {
        create: [
          {
            productId: products[0].id,
            productSnapshot: JSON.stringify({ name: products[0].name, sku: products[0].sku, unit: products[0].unit, priceAtTime: products[0].price }),
            quantity: 2,
            unitPrice: products[0].price,
            totalPrice: products[0].price * 2,
          },
        ],
      },
    },
  });

  console.log('✅ Sample Challan created');
  console.log('\n🎉 SQLite database seeded successfully!');
  console.log('Demo Credentials:');
  console.log('  admin@nexora.demo     / nexora@2024');
  console.log('  sales@nexora.demo     / nexora@2024');
  console.log('  warehouse@nexora.demo / nexora@2024');
  console.log('  accounts@nexora.demo  / nexora@2024');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
