const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument({
  size: 'A4',
  margin: 45,
  info: {
    Title: 'NEXORA - Project Submission Documentation',
    Author: 'Chaithanya Sakamuri',
    Subject: 'FundsRoom Full Stack Case Study Submission',
  },
});

const outputPath = path.join(__dirname, '..', 'NEXORA_Submission_Documentation.pdf');
const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Styles & Helpers
const primaryColor = '#6366f1';
const darkColor = '#0f172a';
const textSecondary = '#475569';
const bgLight = '#f8fafc';
const borderColor = '#e2e8f0';

function addHeader(title) {
  doc.addPage();
  doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold').text('NEXORA — Intelligent Business Operations', 45, 40);
  doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text('Full Stack ERP+CRM Submission Documentation', 45, 58);
  doc.moveTo(45, 72).lineTo(550, 72).strokeColor(borderColor).lineWidth(1).stroke();
  doc.y = 85;
}

function addSectionHeading(text) {
  doc.moveDown(0.8);
  doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text(text);
  doc.moveDown(0.3);
  doc.moveTo(45, doc.y).lineTo(550, doc.y).strokeColor('#c7d2fe').lineWidth(1).stroke();
  doc.moveDown(0.5);
}

function addSubHeading(text) {
  doc.moveDown(0.4);
  doc.fillColor(darkColor).fontSize(11).font('Helvetica-Bold').text(text);
  doc.moveDown(0.2);
}

function addBodyText(text) {
  doc.fillColor(textSecondary).fontSize(9.5).font('Helvetica').text(text, { lineHeight: 1.4 });
  doc.moveDown(0.3);
}

function addBullet(label, val) {
  doc.fillColor(darkColor).fontSize(9.5).font('Helvetica-Bold').text(`• ${label}: `, { continued: true });
  doc.fillColor(textSecondary).font('Helvetica').text(val);
  doc.moveDown(0.2);
}

// -----------------------------------------------------------------------------
// COVER / HEADER PAGE 1
// -----------------------------------------------------------------------------
doc.fillColor(primaryColor).fontSize(26).font('Helvetica-Bold').text('NEXORA', 45, 50);
doc.fillColor(darkColor).fontSize(14).font('Helvetica-Bold').text('Intelligent Business Operations Portal', 45, 80);
doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('Full Stack Mini ERP + CRM Case Study Submission for FundsRoom', 45, 98);
doc.moveTo(45, 115).lineTo(550, 115).strokeColor(primaryColor).lineWidth(2).stroke();

doc.y = 130;

// SECTION 1: SUBMISSION LINKS & QUICK DETAILS
addSectionHeading('1. Executive Summary & Live Project Links');

doc.rect(45, doc.y, 505, 125).fill(bgLight).stroke(borderColor);
let boxY = doc.y + 10;

doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text('GitHub Repository:', 55, boxY);
doc.fillColor(primaryColor).fontSize(9.5).font('Helvetica').text('https://github.com/ChaithanyaSakamuri/FundsRoom-Assignment', 180, boxY);

boxY += 22;
doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text('Live Frontend URL:', 55, boxY);
doc.fillColor(primaryColor).fontSize(9.5).font('Helvetica').text('https://nexora-frontend-papj.onrender.com/', 180, boxY);

boxY += 22;
doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text('Live Backend API URL:', 55, boxY);
doc.fillColor(primaryColor).fontSize(9.5).font('Helvetica').text('https://nexora-backend-zzs8.onrender.com/', 180, boxY);

boxY += 22;
doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text('Author / Candidate:', 55, boxY);
doc.fillColor(textSecondary).fontSize(9.5).font('Helvetica').text('Chaithanya Sakamuri', 180, boxY);

boxY += 22;
doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text('Deployment Platform:', 55, boxY);
doc.fillColor(textSecondary).fontSize(9.5).font('Helvetica').text('Render Cloud PaaS (Web Services & Global Static CDN)', 180, boxY);

doc.y = boxY + 25;

// SECTION 2: TEST CREDENTIALS
addSectionHeading('2. Test Login Credentials for All Roles');
addBodyText('NEXORA features a granular Role-Based Access Control (RBAC) system. Use the following credentials on the login screen or click the corresponding pre-filled role buttons:');

// Credentials Table Header
const tableY = doc.y + 5;
doc.rect(45, tableY, 505, 20).fill('#e0e7ff');
doc.fillColor('#3730a3').fontSize(9).font('Helvetica-Bold')
   .text('Role', 55, tableY + 5)
   .text('Email Address', 140, tableY + 5)
   .text('Password', 310, tableY + 5)
   .text('Access Scope & Permissions', 400, tableY + 5);

const creds = [
  { role: 'Admin', email: 'admin@nexora.demo', pass: 'nexora@2024', scope: 'Full Unrestricted Access' },
  { role: 'Sales', email: 'sales@nexora.demo', pass: 'nexora@2024', scope: 'CRM, Challans, Sales Reports' },
  { role: 'Warehouse', email: 'warehouse@nexora.demo', pass: 'nexora@2024', scope: 'Inventory, Stock Ledger' },
  { role: 'Accounts', email: 'accounts@nexora.demo', pass: 'nexora@2024', scope: 'Challan Invoices, Reports' },
];

let rowY = tableY + 20;
creds.forEach((c, idx) => {
  const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
  doc.rect(45, rowY, 505, 22).fill(bg).stroke(borderColor);
  doc.fillColor(darkColor).fontSize(9).font('Helvetica-Bold').text(c.role, 55, rowY + 6);
  doc.fillColor(textSecondary).font('Helvetica').text(c.email, 140, rowY + 6);
  doc.text(c.pass, 310, rowY + 6);
  doc.text(c.scope, 400, rowY + 6);
  rowY += 22;
});

doc.y = rowY + 15;

// SECTION 3: SYSTEM ARCHITECTURE
addSectionHeading('3. System Architecture & Core Design Principles');
addBodyText('NEXORA is engineered as a modern, decoupled full-stack enterprise B2B SaaS application. It combines real-time operational state management with transactional stock ledger integrity.');

addSubHeading('Tech Stack Overview:');
addBullet('Backend API', 'Node.js 20, Express.js framework, TypeScript, Prisma ORM, JWT authentication');
addBullet('Frontend SPA', 'React 18, Vite, TypeScript, TanStack Query (React Query), Zustand, Recharts, Lucide Icons');
addBullet('Design System', 'Vanilla CSS with curated design tokens, glassmorphism, 3-layer dark mode, responsive drawer');
addBullet('Document Engine', 'PDFKit for dynamic server-side official delivery challan PDF generation');
addBullet('Data Storage', 'Prisma ORM with cross-database support (PostgreSQL & SQLite file database)');

addSubHeading('Key Architectural Highlights:');
addBullet('Atomic Stock Fulfillment', 'When confirming a delivery challan, Prisma executes a multi-table transaction that checks stock levels, decrements inventory, creates stock movement logs, and confirms the order atomically.');
addBullet('Historical Snapshot Preservation', 'Challan line items store immutable JSON snapshots of product price, unit, and specs at order time, protecting audit history from future price modifications.');
addBullet('Global Command Palette', 'Ctrl+K / ⌘K command overlay with live multi-entity search across customers, catalog items, and sales orders.');

// PAGE 2: API DOCUMENTATION & SETUP
addHeader();

addSectionHeading('4. Complete API Endpoint Documentation');
addBodyText('The NEXORA REST API exposes clean, versioned endpoints requiring Bearer JWT authentication for protected routes:');

const endpoints = [
  { method: 'POST', path: '/api/auth/login', desc: 'Authenticate user & issue JWT token' },
  { method: 'GET', path: '/api/auth/me', desc: 'Fetch authenticated user profile' },
  { method: 'GET', path: '/api/customers', desc: 'List CRM customers with search, status & pagination' },
  { method: 'POST', path: '/api/customers', desc: 'Create new customer account [Sales/Admin]' },
  { method: 'GET', path: '/api/customers/:id', desc: 'Customer 360° profile with timeline & challans' },
  { method: 'GET', path: '/api/products', desc: 'List inventory catalog with stock health indicators' },
  { method: 'POST', path: '/api/products', desc: 'Add new product SKU [Warehouse/Admin]' },
  { method: 'GET', path: '/api/stock-movements', desc: 'Stock audit ledger (filter by IN/OUT type & date)' },
  { method: 'POST', path: '/api/stock-movements', desc: 'Record manual stock adjustment [Warehouse/Admin]' },
  { method: 'GET', path: '/api/challans', desc: 'List sales delivery challans with filter & pagination' },
  { method: 'POST', path: '/api/challans', desc: 'Create 5-step draft sales delivery challan' },
  { method: 'POST', path: '/api/challans/:id/confirm', desc: 'Confirm order & execute atomic stock deduction' },
  { method: 'GET', path: '/api/challans/:id/pdf', desc: 'Generate & stream official PDF invoice document' },
  { method: 'GET', path: '/api/dashboard/summary', desc: 'Command center KPIs, trend charts & alerts' },
  { method: 'GET', path: '/api/reports/sales-overview', desc: 'Analytics report for sales revenue velocity' },
  { method: 'GET', path: '/api/activity', desc: 'System-wide audit trail activity log' },
];

let epY = doc.y + 5;
doc.rect(45, epY, 505, 18).fill('#f1f5f9');
doc.fillColor(darkColor).fontSize(8.5).font('Helvetica-Bold')
   .text('Method', 55, epY + 4)
   .text('Endpoint Route Path', 115, epY + 4)
   .text('Description & Business Function', 310, epY + 4);

epY += 18;
endpoints.forEach((ep, idx) => {
  const methodColor = ep.method === 'GET' ? '#0284c7' : ep.method === 'POST' ? '#16a34a' : '#d97706';
  doc.rect(45, epY, 505, 17).fill(idx % 2 === 0 ? '#ffffff' : '#f8fafc').stroke(borderColor);
  doc.fillColor(methodColor).fontSize(8).font('Helvetica-Bold').text(ep.method, 55, epY + 4);
  doc.fillColor(darkColor).fontSize(8.5).font('Helvetica').text(ep.path, 115, epY + 4);
  doc.fillColor(textSecondary).fontSize(8).font('Helvetica').text(ep.desc, 310, epY + 4);
  epY += 17;
});

doc.y = epY + 15;

// SECTION 5: SETUP & DEPLOYMENT INSTRUCTIONS
addSectionHeading('5. Setup & Deployment Guide');

addSubHeading('Local Environment Setup:');
addBullet('1. Clone Repository', 'git clone https://github.com/ChaithanyaSakamuri/FundsRoom-Assignment.git');
addBullet('2. Backend Setup', 'cd backend && npm install && npx prisma db push && npm run db:seed && npm run dev');
addBullet('3. Frontend Setup', 'cd frontend && npm install && npm run dev (opens http://localhost:5173)');

addSubHeading('Render Cloud Deployment:');
addBullet('Render Blueprint', 'Included render.yaml configures 1-click deployment for both backend & frontend static site.');
addBullet('Backend Web Service', 'Build: npm install && npx prisma generate && npm run build | Start: npx prisma db push && npm start');
addBullet('Frontend Static Site', 'Build: npm install && npm run build | Environment Variable: VITE_API_URL pointing to live backend.');

// PAGE 3: LIMITATIONS & SIGN-OFF
addHeader();

addSectionHeading('6. Known Scope Decisions & Trade-offs');
addBullet('Single JWT Session', 'Uses 24-hour JWT access tokens. Production refresh token rotation pattern can be attached for multi-device session revocation.');
addBullet('Image Storage', 'Product catalog stores image URLs. Production S3/Cloudinary direct upload widget can be added for binary asset hosting.');
addBullet('Real-Time WebSockets', 'UI updates on React Query polling/revalidation. WebSocket layer can be added for multi-user live stock updates.');

addSectionHeading('7. Project Sign-Off');
addBodyText('NEXORA has been thoroughly built, tested, and deployed according to all requirements outlined in the Full Stack Developer Case Study. The application demonstrates production-level engineering quality, clean code architecture, and extreme visual polish.');

doc.moveDown(2);
doc.rect(45, doc.y, 505, 60).fill('#f0fdf4').stroke('#bbf7d0');
let signY = doc.y + 15;
doc.fillColor('#15803d').fontSize(12).font('Helvetica-Bold').text('Project Submission Verification — COMPLETE', 60, signY);
doc.fillColor('#166534').fontSize(9.5).font('Helvetica').text('GitHub: https://github.com/ChaithanyaSakamuri/FundsRoom-Assignment', 60, signY + 18);
doc.text('Live App: https://nexora-frontend-papj.onrender.com/', 60, signY + 32);

doc.end();

writeStream.on('finish', () => {
  console.log(`✅ Documentation PDF generated successfully at: ${outputPath}`);
});
