export interface Salesperson {
    id: number;
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    startDate: string; // ISO 8601 date string
    terminationDate: string | null; // ISO 8601 date string
    manager: string
}

export interface Product {
    id: number;
    name: string;
    manufacturer: string;
    style: string;
    purchasePrice: number;
    salePrice: number;
    qtyOnHand: number;
    commissionPercentage: number;
}

export interface Customer {
    id: number;
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    startDate: string; // ISO 8601 date string
}

export interface Sale {
    id: number;
    productId: number;
    salesPersonId: number;
    customerId: number;
    date: string; // ISO 8601 date string
    product: Product;
    salesPerson: Salesperson;
    customer: Customer;
}

export interface CommissionReport {
    salespersonId: number;
    totalSales: number;
    totalCommission: number;
    salesDetails: Sale[];
}

export interface Discount {
    id: number;
    productId: number;
    beginDate: string; // ISO 8601 date string
    endDate: string; // ISO 8601 date string
    percentage: number;
    product: Product;
}

// API Response Types
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface DateRangeFilter {
    startDate: string;
    endDate: string;
}

// Common form state types
export interface SaleFormData {
    productId: number;
    salesPersonId: number;
    customerId: number;
    date: string;
}

export interface ProductFormData extends Omit<Product, 'id'> {}
export interface SalespersonFormData extends Omit<Salesperson, 'id'> {}
export interface CustomerFormData extends Omit<Customer, 'id'> {}