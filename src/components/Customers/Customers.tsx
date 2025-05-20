import React, { useState, useCallback } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Customer } from '../../types'
import { formStyles } from '../shared/styles'
import { CustomersModal } from './CustomersModal'

type ErrorMessage = {
    message: string
    type: 'error' | 'success'
}

const CUSTOMERS_QUERY_KEY = ['customers'] as const

type CustomerResponse = Customer[]

const Customers = () => {
    const queryClient = useQueryClient()
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [notification, setNotification] = useState<ErrorMessage | null>(null)

    const showNotification = useCallback((message: string, type: 'error' | 'success') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }, [])

    const { data: customers = [], isLoading } = useQuery({
        queryKey: CUSTOMERS_QUERY_KEY,
        queryFn: async () => {
            const response = await fetch('/api/customers')
            if (!response.ok) {
                throw new Error('Failed to fetch customers')
            }
            const data = await response.json()
            return data as CustomerResponse
        }
    })

    const { mutate: saveCustomer } = useMutation({
        mutationFn: async (customer: Omit<Customer, 'id'> & { id?: number }) => {
            const isUpdate = typeof customer.id === 'number'
            const response = await fetch(
                isUpdate ? `/api/customers/${customer.id}` : '/api/customers',
                {
                    method: isUpdate ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(customer),
                }
            )

            if (response.ok && response.status === 204) {
                return customer as Customer
            }

            return response.ok ? (await response.json() as Customer) : customer as Customer
        },
        onSuccess: (_, variables) => {
            const isUpdate = typeof variables.id === 'number'
            queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY })
            showNotification(`Customer ${isUpdate ? 'updated' : 'added'} successfully`, 'success')
            setIsModalOpen(false)
        },
        onError: () => {
            showNotification('Failed to save customer', 'error')
        }
    })

    const { mutate: deleteCustomer } = useMutation({
        mutationFn: async (customerId: number) => {
            const response = await fetch(`/api/customers/${customerId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!response.ok) {
                throw new Error('Failed to delete customer')
            }

            return customerId
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY })
            showNotification('Customer deleted successfully', 'success')
        }
    })

    const openCustomerModal = useCallback((customer?: Customer) => {
        setEditingCustomer(customer || null)
        setIsModalOpen(true)
    }, [])

    const handleSaveCustomer = useCallback(async (customer: Omit<Customer, 'id'> & { id?: number }) => {
        saveCustomer(customer)
    }, [saveCustomer])

    const handleDeleteCustomer = useCallback(async (customerId: number) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) {
            return
        }
        deleteCustomer(customerId)
    }, [deleteCustomer])

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
                        {customers.map((customer: Customer) => (
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
    )
}

export default Customers