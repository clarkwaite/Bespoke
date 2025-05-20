import React, { useState, useCallback } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Customer } from '../../types'
import { formStyles } from '../shared/styles'
import { CustomersModal } from './CustomersModal'
import DeleteConfirmationModal from '../shared/DeleteConfirmationModal'
import { NotificationDisplay, useNotification } from '../../hooks/useNotification'
import { CUSTOMERS_QUERY_KEY } from '../shared/constants'
import { LoadingState } from '../shared/LoadingState'
import { EmptyState } from '../shared/EmptyState'


type CustomerResponse = Customer[]

const Customers: React.FC = () => {
    const queryClient = useQueryClient()
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
    const { notification, showNotification } = useNotification()

    const { data: customers = [], isLoading } = useQuery({
        queryKey: CUSTOMERS_QUERY_KEY,
        queryFn: async () => {
            const response = await fetch('/api/customers')
            if (!response.ok) {
                throw new Error('Failed to fetch customers')
            }
            return response.json() as Promise<CustomerResponse>
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
                    body: JSON.stringify(customer)
                }
            )

            // For successful updates without response body, return original customer
            if (response.ok && response.status === 204) {
                return customer as Customer
            }

            // For other cases, try to parse response or return original
            return response.ok ? (await response.json() as Customer) : customer as Customer
        },
        onSuccess: (_, variables) => {
            const isUpdate = typeof variables.id === 'number'
            queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY })
            showNotification(`Customer ${isUpdate ? 'updated' : 'added'} successfully`, 'success')
            setIsModalOpen(false)
        },
        onError: (error) => {
            showNotification(error instanceof Error ? error.message : 'Failed to save customer', 'error')
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
        },
        onError: (error) => {
            showNotification(error instanceof Error ? error.message : 'Failed to delete customer', 'error')
        }
    })

    const openCustomerModal = useCallback((customer?: Customer) => {
        setEditingCustomer(customer || null)
        setIsModalOpen(true)
    }, [])

    const handleSaveCustomer = useCallback(async (customer: Omit<Customer, 'id'> & { id?: number }) => {
        saveCustomer(customer)
    }, [saveCustomer])

    const handleDeleteClick = useCallback((customer: Customer) => {
        setCustomerToDelete(customer)
        setDeleteModalOpen(true)
    }, [])

    const handleConfirmDelete = useCallback(() => {
        if (customerToDelete) {
            deleteCustomer(customerToDelete.id)
        }
    }, [deleteCustomer, customerToDelete])

    return (
        <div>
            <NotificationDisplay notification={notification} />

            <CustomersModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                customer={editingCustomer}
                isEditMode={Boolean(editingCustomer)}
                handleSave={handleSaveCustomer}
            />

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={customerToDelete ? `${customerToDelete.firstName} ${customerToDelete.lastName}` : 'this customer'}
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

            {isLoading ? <LoadingState message='customers' /> : !customers.length ? <EmptyState message='customers' /> : (
                <table style={formStyles.table}>
                    <thead>
                        <tr>
                            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Name</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Address</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Phone</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Start Date</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Actions</th>
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
                                            onClick={() => handleDeleteClick(customer)}
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