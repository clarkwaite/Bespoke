import React, { useState, useCallback } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Salesperson } from '../../types'
import { formStyles } from '../shared/styles'
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
        <div>
            {notification && (
                <NotificationDisplay notification={notification} />
            )}

            <SalespersonsModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                salesperson={editingSalesperson}
                handleSave={handleSaveSalesperson}
                isEditMode={Boolean(editingSalesperson)}
                existingSalespersons={salespersons}
            />

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={salespersonToDelete ? `${salespersonToDelete.firstName} ${salespersonToDelete.lastName}` : 'this salesperson'}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Salespersons</h2>
                <button
                    onClick={() => openSalespersonModal()}
                    style={{ ...formStyles.button, ...formStyles.saveButton }}
                >
                    Add New Salesperson
                </button>
            </div>

            {isLoading ? <LoadingState message='salespersons' /> : !salespersons.length ? <EmptyState message='salespersons' /> : (
                <table style={formStyles.table}>
                    <thead>
                        <tr>
                            <th style={formStyles.th}>Name</th>
                            <th style={formStyles.th}>Phone</th>
                            <th style={formStyles.th}>Start Date</th>
                            <th style={formStyles.th}>Termination Date</th>
                            <th style={formStyles.th}>Manager</th>
                            <th style={formStyles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salespersons.map(salesperson => (
                            <tr key={salesperson.id}>
                                <td style={formStyles.td}>
                                    {salesperson.firstName} {salesperson.lastName}
                                </td>
                                <td style={formStyles.td}>{salesperson.phone}</td>
                                <td style={formStyles.td}>
                                    {new Date(salesperson.startDate).toLocaleDateString()}
                                </td>
                                <td style={formStyles.td}>
                                    {salesperson.terminationDate
                                        ? new Date(salesperson.terminationDate).toLocaleDateString()
                                        : 'Active'
                                    }
                                </td>
                                <td style={formStyles.td}>{salesperson.manager}</td>
                                <td style={formStyles.td}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => openSalespersonModal(salesperson)}
                                            style={{ ...formStyles.button, ...formStyles.saveButton }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(salesperson)}
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

export default Salespersons