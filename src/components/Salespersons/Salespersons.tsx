import React, { useState, useCallback } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Salesperson } from '../../types'
import {
    ContentContainer,
    PageHeader,
    TableContainer,
    Table,
    TableHeader,
    TableCell,
    TableActions,
    ActionButton,
    Button,
} from '../shared/styles'
import { SalespersonsModal } from './SalespersonsModal'
import DeleteConfirmationModal from '../shared/DeleteConfirmationModal'
import { NotificationDisplay, useNotification } from '../../hooks/useNotification'
import { SALESPERSONS_QUERY_KEY } from '../shared/constants'
import { LoadingState } from '../shared/LoadingState'
import { EmptyState } from '../shared/EmptyState'

const Salespersons: React.FC = () => {
    const queryClient = useQueryClient()
    const [editingSalesperson, setEditingSalesperson] = useState<Salesperson | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [salespersonToDelete, setSalespersonToDelete] = useState<Salesperson | null>(null)
    const { notification, showNotification } = useNotification()

    const { data: salespersons = [], isLoading } = useQuery({
        queryKey: SALESPERSONS_QUERY_KEY,
        queryFn: async () => {
            const response = await fetch('/api/salespersons')
            if (!response.ok) {
                throw new Error('Failed to fetch salespersons')
            }
            return response.json() as Promise<Salesperson[]>
        }
    })

    const isDuplicateSalesperson = (salesperson: Omit<Salesperson, 'id'> & { id?: number }) => {
        return salespersons.some(sp =>
            sp.id !== salesperson.id &&
            sp.firstName.toLowerCase() === salesperson.firstName.toLowerCase() &&
            sp.lastName.toLowerCase() === salesperson.lastName.toLowerCase() &&
            sp.phone === salesperson.phone
        )
    }

    const { mutate: saveSalesperson } = useMutation({
        mutationFn: async (salesperson: Omit<Salesperson, 'id'> & { id?: number }) => {
            if (isDuplicateSalesperson(salesperson)) {
                throw new Error('A salesperson with this name and phone number already exists.')
            }

            const isUpdate = typeof salesperson.id === 'number'
            const response = await fetch(
                isUpdate ? `/api/salespersons/${salesperson.id}` : '/api/salespersons',
                {
                    method: isUpdate ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(salesperson),
                }
            )

            if (!response.ok) {
                throw new Error(`Failed to ${isUpdate ? 'update' : 'create'} salesperson`)
            }

            if (response.ok && response.status === 204) {
                return salesperson as Salesperson
            }

            return response.ok ? (await response.json() as Salesperson) : salesperson as Salesperson
        },
        onSuccess: (_, variables) => {
            const isUpdate = typeof variables.id === 'number'
            queryClient.invalidateQueries({ queryKey: SALESPERSONS_QUERY_KEY })
            showNotification(`Salesperson ${isUpdate ? 'updated' : 'added'} successfully`, 'success')
            setIsModalOpen(false)
        },
        onError: (error) => {
            showNotification(error instanceof Error ? error.message : 'Failed to save salesperson', 'error')
        }
    })

    const { mutate: deleteSalesperson } = useMutation({
        mutationFn: async (salespersonId: number) => {
            const response = await fetch(`/api/salespersons/${salespersonId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!response.ok) {
                throw new Error('Failed to delete salesperson')
            }

            return salespersonId
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SALESPERSONS_QUERY_KEY })
            showNotification('Salesperson deleted successfully', 'success')
        },
        onError: (error) => {
            showNotification(error instanceof Error ? error.message : 'Failed to delete salesperson', 'error')
        }
    })

    const openSalespersonModal = useCallback((salesperson?: Salesperson) => {
        setEditingSalesperson(salesperson || null)
        setIsModalOpen(true)
    }, [])

    const handleSaveSalesperson = useCallback(async (salesperson: Omit<Salesperson, 'id'> & { id?: number }) => {
        saveSalesperson(salesperson)
    }, [saveSalesperson])

    const handleDeleteClick = useCallback((salesperson: Salesperson) => {
        setSalespersonToDelete(salesperson)
        setDeleteModalOpen(true)
    }, [])

    const handleConfirmDelete = useCallback(() => {
        if (salespersonToDelete) {
            deleteSalesperson(salespersonToDelete.id)
        }
    }, [deleteSalesperson, salespersonToDelete])

    return (
        <ContentContainer>
            <NotificationDisplay notification={notification} />            <SalespersonsModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                salesperson={editingSalesperson}
                handleSave={handleSaveSalesperson}
                isEditMode={!!editingSalesperson}
                existingSalespersons={salespersons}
            />

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => {
                    if (salespersonToDelete) {
                        deleteSalesperson(salespersonToDelete.id)
                        setDeleteModalOpen(false)
                        setSalespersonToDelete(null)
                    }
                }}
                title="Delete Salesperson"
                itemName="salesperson"
            />

            <PageHeader>
                <h2>Salespersons</h2>
                <Button variant='primary' onClick={() => openSalespersonModal()}>
                    Add New Salesperson
                </Button>
            </PageHeader>

            {isLoading ? <LoadingState message='salespersons' /> : !salespersons.length ? <EmptyState message='salespersons' /> : (
                <TableContainer>
                    <Table>
                        <thead>
                            <tr>
                                <TableHeader>Name</TableHeader>
                                <TableHeader>Phone</TableHeader>
                                <TableHeader>Address</TableHeader>
                                <TableHeader>Start Date</TableHeader>
                                <TableHeader>Termination Date</TableHeader>
                                <TableHeader>Manager</TableHeader>
                                <TableHeader>Actions</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {salespersons.map(salesperson => (
                                <tr key={salesperson.id}>
                                    <TableCell>{`${salesperson.firstName} ${salesperson.lastName}`}</TableCell>
                                    <TableCell>{salesperson.phone}</TableCell>
                                    <TableCell>{salesperson.address}</TableCell>
                                    <TableCell>{new Date(salesperson.startDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {salesperson.terminationDate
                                            ? new Date(salesperson.terminationDate).toLocaleDateString()
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell>{salesperson.manager ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>
                                        <TableActions>
                                            <ActionButton
                                                action="edit"
                                                onClick={() => openSalespersonModal(salesperson)}
                                            >
                                                Edit
                                            </ActionButton>
                                            <ActionButton
                                                action="delete"
                                                onClick={() => handleDeleteClick(salesperson)}
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

export default Salespersons