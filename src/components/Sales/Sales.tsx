import React, { useState, useEffect, useCallback } from 'react';
import { Sale, SaleFormData, DateRangeFilter, ApiResponse, Product, Salesperson, Customer } from '../../types';
import { formStyles } from '../shared/styles';
import { SalesModal } from './SalesModal';
import { isBetweenTwoDates } from '../shared/helpers';

type ErrorMessage = {
    message: string;
    type: 'error' | 'success';
};

const Sales: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [dateFilter, setDateFilter] = useState<DateRangeFilter>({
        startDate: '',
        endDate: ''
    });
    const [appliedDateFilter, setAppliedDateFilter] = useState<DateRangeFilter>({
        startDate: '',
        endDate: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<ErrorMessage | null>(null);
    const [newSale, setNewSale] = useState<SaleFormData>({
        productId: 0,
        salesPersonId: 0,
        customerId: 0,
        date: new Date().toISOString().split('T')[0]
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    // TODO: make this a reusable hook
    const showNotification = useCallback((message: string, type: 'error' | 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    }, []);

    // TODO: make all of these fetches a reusable hook
    const fetchDropdownData = useCallback(async () => {
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
            showNotification('Failed to fetch necessary data', 'error');
        }
    }, [showNotification]);

    const fetchSales = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/sales`);
            const data: Sale[] = await response.json();
            setSales(data);
        } catch (error) {
            console.error('Error fetching sales:', error);
            showNotification('Failed to fetch sales', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchSales();
        fetchDropdownData();
    }, [fetchSales, fetchDropdownData]);

    const handleAddSale = async (formData: SaleFormData) => {
        console.log('Adding sale:', formData);
        try {
            const response = await fetch('/api/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
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
                showNotification('Sale created successfully', 'success');
            } else {
                showNotification(data.message || 'Failed to create sale', 'error');
            }
        } catch (error) {
            console.error('Error creating sale:', error);
            showNotification('Failed to create sale', 'error');
        }
    };

    const handleApplyFilter = () => {
        setAppliedDateFilter(dateFilter);
    };

    const handleClearFilter = () => {
        setDateFilter({ startDate: '', endDate: '' });
        setAppliedDateFilter({ startDate: '', endDate: '' });
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
            {notification && (
                <div
                    style={{
                        padding: '10px',
                        marginBottom: '20px',
                        borderRadius: '4px',
                        backgroundColor: notification.type === 'error' ? '#fee2e2' : '#dcfce7',
                        color: notification.type === 'error' ? '#dc2626' : '#16a34a',
                    }}
                >
                    {notification.message}
                </div>
            )}

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
                        style={formStyles.datePicker}
                        type="date"
                        value={dateFilter.startDate}
                        onChange={e => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                    />
                </div>
                <div style={formStyles.field}>
                    <label style={formStyles.label}>End Date</label>
                    <input
                        style={formStyles.datePicker}
                        type="date"
                        value={dateFilter.endDate}
                        onChange={e => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                    <button
                        onClick={handleApplyFilter}
                        style={!dateFilter.startDate || !dateFilter.endDate ? formStyles.disabledButton : formStyles.dateApplyButton}
                        disabled={!dateFilter.startDate || !dateFilter.endDate}
                    >
                        Apply Filter
                    </button>
                    {(appliedDateFilter.startDate || appliedDateFilter.endDate) && (
                        <button
                            onClick={handleClearFilter}
                            style={formStyles.deleteButton}
                        >
                            Clear Filter
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading sales...</div>
            ) : !sales.length ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>No sales found.</div>
            ) : (
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
                        {sales
                            .filter((sale) => appliedDateFilter.startDate && appliedDateFilter.endDate
                                ? isBetweenTwoDates({ date: sale.date, dateFilter: appliedDateFilter })
                                : true)
                            .map(sale => (
                                <tr key={sale.id}>
                                    {salesTableTD(`${sale.customer.firstName} ${sale.customer.lastName}`)}
                                    {salesTableTD(new Date(sale.date).toLocaleDateString())}
                                    {salesTableTD(sale.product.salePrice.toFixed(2))}
                                    {salesTableTD(`${sale.salesPerson.firstName} ${sale.salesPerson.lastName}`)}
                                    {salesTableTD(calculateCommission(sale).toFixed(2))}
                                </tr>
                            ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Sales;