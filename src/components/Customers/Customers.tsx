import React, { useState, useCallback } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Customer } from '../../types'
import {
    Table,
    TableHeader,
    TableCell,
    ContentContainer,
    PageHeader,
    TableContainer,
    TableActions,
    ActionButton,
    Button,
} from '../shared/styles'
import { CustomersModal } from './CustomersModal'
import { DeleteConfirmationModal } from '../shared/DeleteConfirmationModal'
import { NotificationDisplay, useNotification } from '../../hooks/useNotification'
import { CUSTOMERS_QUERY_KEY } from '../shared/constants'
import { LoadingState } from '../shared/LoadingState'
import { EmptyState } from '../shared/EmptyState'

export const Customers = () => {
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
            return response.json() as Promise<Customer[]>
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

            if (response.ok && response.status === 204) {
                return customer
            }

            return response.ok ? (await response.json()) : customer
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
            setDeleteModalOpen(false)
            setCustomerToDelete(null)
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

    return (
        <ContentContainer>
            <NotificationDisplay notification={notification} />

            <CustomersModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                customer={editingCustomer}
                handleSave={handleSaveCustomer}
                isEditMode={!!editingCustomer}
            />

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => {
                    if (customerToDelete) {
                        deleteCustomer(customerToDelete.id)
                    }
                }}
                title="Delete Customer"
                itemName="customer"
            />

            <PageHeader>
                <h2>Customers</h2>
                <Button variant='primary' onClick={() => openCustomerModal()}>
                    Add New Customer
                </Button>
            </PageHeader>

            {isLoading ? <LoadingState message='customers' /> : !customers.length ? <EmptyState message='customers' /> : (
                <TableContainer>
                    <Table>
                        <thead>
                            <tr>
                                <TableHeader>Name</TableHeader>
                                <TableHeader>Phone</TableHeader>
                                <TableHeader>Address</TableHeader>
                                <TableHeader>Start Date</TableHeader>
                                <TableHeader>Actions</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(customer => (
                                <tr key={customer.id}>
                                    <TableCell>{`${customer.firstName} ${customer.lastName}`}</TableCell>
                                    <TableCell>{customer.phone}</TableCell>
                                    <TableCell>{customer.address}</TableCell>
                                    <TableCell>{new Date(customer.startDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <TableActions>
                                            <ActionButton
                                                action="edit"
                                                onClick={() => openCustomerModal(customer)}
                                            >
                                                Edit
                                            </ActionButton>
                                            <ActionButton
                                                action="delete"
                                                onClick={() => handleDeleteClick(customer)}
                                            >
                                                Delete
                                            </ActionButton>
                                        </TableActions>
                                    </TableCell>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </TableContainer>
            )}
        </ContentContainer>
    )
}