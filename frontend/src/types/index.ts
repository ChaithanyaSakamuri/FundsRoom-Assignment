export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
  avatarColor: string;
}

export interface Customer {
  id: string;
  name: string;
  business: string;
  type: 'WHOLESALE' | 'RETAIL' | 'DISTRIBUTOR' | 'DIRECT';
  phone: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT';
  address?: string;
  city?: string;
  state?: string;
  gstin?: string;
  notes?: string;
  createdById: string;
  createdBy?: { name: string; role: string };
  createdAt: string;
  updatedAt: string;
  followups?: CustomerFollowup[];
  challans?: Challan[];
  _count?: { challans: number };
}

export interface CustomerFollowup {
  id: string;
  customerId: string;
  dueDate: string;
  completedAt?: string;
  note?: string;
  outcome?: string;
  createdById: string;
  createdBy?: { name: string };
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  currentStock: number;
  minStock: number;
  warehouse: string;
  imageUrl?: string;
  description?: string;
  unit: string;
  isActive: boolean;
  stockStatus?: 'HEALTHY' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';
  createdAt: string;
  updatedAt: string;
  stockMovements?: StockMovement[];
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: { name: string; sku: string };
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  reference?: string;
  notes?: string;
  createdById: string;
  createdBy?: { name: string; role: string };
  createdAt: string;
}

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  product?: { name: string; sku: string; unit: string };
  productSnapshot: {
    name: string;
    sku: string;
    category: string;
    unit: string;
    priceAtTime: number;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: { name: string; business: string; phone?: string; email?: string; address?: string; gstin?: string };
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  notes?: string;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  createdById: string;
  createdBy?: { name: string; role: string; email: string };
  confirmedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  items?: ChallanItem[];
  _count?: { items: number };
}

export interface ActivityLog {
  id: string;
  userId: string;
  user?: { name: string; role: string; avatarColor: string };
  action: string;
  entityType: string;
  entityId?: string;
  entityLabel?: string;
  createdAt: string;
}

export interface DashboardSummary {
  stats: {
    totalCustomers: number;
    totalProducts: number;
    totalChallans: number;
    pendingFollowups: number;
    lowStockProducts: number;
    pendingChallans: number;
    todaySalesTotal: number;
    todaySalesCount: number;
  };
  alerts: {
    criticalProducts: Array<{ id: string; name: string; sku: string; currentStock: number; minStock: number }>;
    overdueFollowups: Array<{ id: string; dueDate: string; note?: string; customer: { name: string; id: string } }>;
    draftChallans: Array<{ id: string; challanNumber: string; createdAt: string; customer: { name: string } }>;
  };
  recentActivity: ActivityLog[];
  salesTrend: Array<{ date: string; revenue: number; count: number }>;
  userName: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  pagination: Pagination;
}