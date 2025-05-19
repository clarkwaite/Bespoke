import React, { useState, useEffect } from 'react';
import { Sale, SaleFormData, DateRangeFilter, ApiResponse, Product, Salesperson, Customer } from '../../types';
import Modal from '../shared/Modal';
import { formStyles } from '../shared/formStyles';
import { SalesModal } from './SalesModal';

const Sales: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [dateFilter, setDateFilter] = useState<DateRangeFilter>({
        startDate: '',
        endDate: ''
    });
    const [newSale, setNewSale] = useState<SaleFormData>({
        productId: 0,
        salesPersonId: 0,
        customerId: 0,
        date: new Date().toISOString().split('T')[0]
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [alertModalConfig, setAlertModalConfig] = useState({
        isOpen: false,
        message: ''
    });

    // Additional state for dropdown options
    const [products, setProducts] = useState<Product[]>([]);
    const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        fetchSales();
        fetchDropdownData();
    }, [dateFilter]);

    const showAlert = (message: string) => {
        setAlertModalConfig({ isOpen: true, message });
    };

    const fetchDropdownData = async () => {
        try {
            // Fetch products
            const productsResponse = await fetch('/api/products');
            const productsData: Product[] = await productsResponse.json();
            if (productsData.length) {
                setProducts(productsData);
            }

            // Fetch salespersons
            const salespersonsResponse = await fetch('/api/salespersons');
            const salespersonsData: Salesperson[] = await salespersonsResponse.json();
            if (salespersonsData.length) {
                setSalespersons(salespersonsData);
            }

            // Fetch customers
            const customersResponse = await fetch('/api/customers');
            const customersData: Customer[] = await customersResponse.json();
            if (customersData.length) {
                setCustomers(customersData);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showAlert('Failed to fetch necessary data');
        }
    };

    const fetchSales = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (dateFilter.startDate) queryParams.append('startDate', dateFilter.startDate);
            if (dateFilter.endDate) queryParams.append('endDate', dateFilter.endDate);
            
            const response = await fetch(`/api/sales?${queryParams}`);
            const data: Sale[] = await response.json();
            if (data.length) {
                setSales(data);
            } else {
                showAlert('Failed to fetch sales');
            }
        } catch (error) {
            console.error('Error fetching sales:', error);
            showAlert('Failed to fetch sales');
        }
    };

    const handleAddSale = async () => {
        try {
            const response = await fetch('/api/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSale)
            });
            const data: ApiResponse<Sale> = await response.json();
            if (data.success) {
                setSales([...sales, data.data]);
                setNewSale({
                    productId: 0,
                    salesPersonId: 0,
                    customerId: 0,
                    date: new Date().toISOString().split('T')[0]
                });
                setIsAddModalOpen(false);
            } else {
                showAlert(data.message || 'Failed to create sale');
            }
        } catch (error) {
            console.error('Error creating sale:', error);
            showAlert('Failed to create sale');
        }
    };

    const calculateCommission = (sale: Sale): number => {
        return sale.product.salePrice * (sale.product.commissionPercentage / 100);
    };

   const salesTableTD = (value: string) => {
        return <td style={formStyles.td}>{value}</td>
    }

    const salesTableHeaders = [
        'Customer',
        'Date',
        'Price',
        'Salesperson',
        'Commission'
    ];

    return (
        <div>
        <SalesModal
            isModalOpen={isAddModalOpen}
            setIsModalOpen={setIsAddModalOpen}
            sale={newSale}
            products={products}
            salespersons={salespersons}
            customers={customers}
            handleSave={handleAddSale}
            isEditMode={false}
        />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Sales</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    style={{ ...formStyles.button, ...formStyles.saveButton }}
                >
                    Create New Sale
                </button>
            </div>

            <div style={formStyles.filterContainer}>
                <div style={formStyles.field}>
                    <label style={formStyles.label}>Start Date</label>
                    <input
                        style={formStyles.input}
                        type="date"
                        value={dateFilter.startDate}
                        onChange={e => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                    />
                </div>
                <div style={formStyles.field}>
                    <label style={formStyles.label}>End Date</label>
                    <input
                        style={formStyles.input}
                        type="date"
                        value={dateFilter.endDate}
                        onChange={e => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                    />
                </div>
            </div>

            <table style={formStyles.table}>
                <thead>
                    <tr>
                        {salesTableHeaders.map((header, index) => (
                            <th key={index} style={formStyles.th}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sales.map(sale => (
                        <tr key={sale.id}>
                            {salesTableTD(`${sale.customer.firstName} ${sale.customer.lastName}`)}
                            {salesTableTD(new Date(sale.date).toLocaleDateString())}
                            {salesTableTD(sale.product.salePrice.toFixed(2))}
                            {salesTableTD(`${sale.customer.firstName} ${sale.customer.lastName}`)}
                            {salesTableTD(calculateCommission(sale).toFixed(2))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Sales;