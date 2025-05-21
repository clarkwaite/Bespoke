export interface Salesperson {
    id: number;
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    startDate: string;
    terminationDate: string | null;
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
    startDate: string;
}

export interface Sale {
    id: number;
    productId: number;
    salesPersonId: number;
    customerId: number;
    date: string;
    product: Product;
    salesPerson: Salesperson;
    customer: Customer;
}

export interface CommissionReportType {
    salespersonId: number;
    totalSales: number;
    numberOfSales: number;
    totalCommission: number;
    salesDetails: Sale[];
    salespersonName: string;
}

export interface Discount {
    id: number;
    productId: number;
    beginDate: string;
    endDate: string;
    percentage: number;
    product: Product;
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface DateRangeFilter {
    startDate: string;
    endDate: string;
}

export interface SaleFormData {
    productId: number;
    salesPersonId: number;
    customerId: number;
    date: string;
}

export interface ProductFormData extends Omit<Product, 'id'> {}
export interface SalespersonFormData extends Omit<Salesperson, 'id'> {}
export interface CustomerFormData extends Omit<Customer, 'id'> {}