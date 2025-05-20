import React, { useEffect, useState, useCallback } from 'react';
import { Customer } from '../../types';
import { formStyles } from '../shared/styles';
import { CustomersModal } from './CustomersModal';

type ErrorMessage = {
    message: string;
    type: 'error' | 'success';
};

const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState<ErrorMessage | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const showNotification = useCallback((message: string, type: 'error' | 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    }, []);

    const fetchCustomers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/customers');
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const customersData: Customer[] = await response.json();
            setCustomers(customersData);
        } catch (error) {
            showNotification('Failed to load customers. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const openCustomerModal = useCallback((customer?: Customer) => {
        setEditingCustomer(customer || null);
        setIsModalOpen(true);
    }, []);

    const handleSaveCustomer = useCallback(async (customer: Omit<Customer, 'id'> & { id?: number }) => {
        try {
            if (customer.id) {
                // Update existing customer
                const response = await fetch(`/api/customers/${customer.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(customer),
                });

                if (!response.ok) {
                    throw new Error('Failed to update customer');
                }

                const updatedCustomer = await response.json();
                setCustomers(prevCustomers =>
                    prevCustomers.map(c => (c.id === customer.id ? updatedCustomer : c))
                );
                showNotification('Customer updated successfully', 'success');
            } else {
                // Add new customer
                const response = await fetch('/api/customers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(customer),
                });

                if (!response.ok) {
                    throw new Error('Failed to create customer');
                }

                const newCustomer: Customer = await response.json();
                setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
                showNotification('Customer added successfully', 'success');
            }
            setIsModalOpen(false);
        } catch (error) {
            showNotification(
                error instanceof Error ? error.message : 'Failed to save customer. Please try again.',
                'error'
            );
        }
    }, [showNotification]);

    const handleDeleteCustomer = useCallback(async (customerId: number) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) {
            return;
        }

        try {
            const response = await fetch(`/api/customers/${customerId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete customer');
            }

            setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== customerId));
            showNotification('Customer deleted successfully', 'success');
        } catch (error) {
            showNotification(
                error instanceof Error ? error.message : 'Failed to delete customer. Please try again.',
                'error'
            );
        }
    }, [showNotification]);

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

            <CustomersModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                customer={editingCustomer}
                isEditMode={Boolean(editingCustomer)}
                handleSave={handleSaveCustomer}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Customers</h2>
                <button
                    onClick={() => openCustomerModal()}
                    style={{ ...formStyles.button, ...formStyles.saveButton }}
                >
                    Add New Customer
                </button>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading customers...</div>
            ) : customers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>No customers found.</div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd' }}>Name</th>
                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd' }}>Address</th>
                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd' }}>Phone</th>
                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd' }}>Start Date</th>
                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => (
                            <tr key={customer.id}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                                    {customer.firstName} {customer.lastName}
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{customer.address}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{customer.phone}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                                    {new Date(customer.startDate).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => openCustomerModal(customer)}
                                            style={{ ...formStyles.button, ...formStyles.saveButton }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCustomer(customer.id)}
                                            style={formStyles.deleteButton}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Customers;