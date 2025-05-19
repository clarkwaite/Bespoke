import React, { useState, useEffect, useCallback } from 'react';
import { Salesperson, ApiResponse } from '../../types';
import { formStyles } from '../shared/formStyles';
import { SalespersonsModal } from './SalespersonsModal';

const Salespersons: React.FC = () => {
    const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
    const [editingSalesperson, setEditingSalesperson] = useState<Salesperson | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const showNotification = useCallback((message: string, type: 'error' | 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    }, []);

    const fetchSalespersons = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/salespersons');
            if (!response.ok) {
                throw new Error('Failed to fetch salespersons');
            }
            const data: Salesperson[] = await response.json();
            setSalespersons(data);
        } catch (error) {
            showNotification('Failed to load salespersons. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchSalespersons();
    }, [fetchSalespersons]);

    const openSalespersonModal = (salesperson?: Salesperson) => {
        setEditingSalesperson(salesperson || null);
        setIsModalOpen(true);
    };

    const isDuplicateSalesperson = (salesperson: Omit<Salesperson, 'id'> & { id?: number }) => {
        return salespersons.some(sp => 
            sp.id !== salesperson.id && // Skip current salesperson when editing
            sp.firstName.toLowerCase() === salesperson.firstName.toLowerCase() &&
            sp.lastName.toLowerCase() === salesperson.lastName.toLowerCase() &&
            sp.phone === salesperson.phone
        );
    };

    const handleSaveSalesperson = async (salesperson: Omit<Salesperson, 'id'> & { id?: number }) => {
        try {
            // Check for duplicates
            if (isDuplicateSalesperson(salesperson)) {
                showNotification('A salesperson with this name and phone number already exists.', 'error');
                return;
            }

            if (salesperson.id) {
                // Update existing salesperson
                const response = await fetch(`/api/salespersons/${salesperson.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(salesperson),
                });
                
                if (!response.ok) {
                    throw new Error('Failed to update salesperson');
                }

                const data: ApiResponse<Salesperson> = await response.json();
                if (data.success) {
                    setSalespersons(prevSalespersons =>
                        prevSalespersons.map(sp => (sp.id === salesperson.id ? data.data : sp))
                    );
                    showNotification('Salesperson updated successfully', 'success');
                } else {
                    throw new Error(data.message || 'Failed to update salesperson');
                }
            } else {
                // Add new salesperson
                const response = await fetch('/api/salespersons', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(salesperson),
                });

                if (!response.ok) {
                    throw new Error('Failed to create salesperson');
                }

                const data: ApiResponse<Salesperson> = await response.json();
                if (data.success) {
                    setSalespersons(prevSalespersons => [...prevSalespersons, data.data]);
                    showNotification('Salesperson added successfully', 'success');
                } else {
                    throw new Error(data.message || 'Failed to create salesperson');
                }
            }
            setIsModalOpen(false);
        } catch (error) {
            showNotification(
                error instanceof Error ? error.message : 'Failed to save salesperson. Please try again.',
                'error'
            );
        }
    };

    const handleDeleteSalesperson = async (salespersonId: number) => {
        if (!window.confirm('Are you sure you want to delete this salesperson?')) {
            return;
        }

        try {
            const response = await fetch(`/api/salespersons/${salespersonId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete salesperson');
            }

            setSalespersons(prevSalespersons => 
                prevSalespersons.filter(sp => sp.id !== salespersonId)
            );
            showNotification('Salesperson deleted successfully', 'success');
        } catch (error) {
            showNotification(
                error instanceof Error ? error.message : 'Failed to delete salesperson. Please try again.',
                'error'
            );
        }
    };

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

            <SalespersonsModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                salesperson={editingSalesperson}
                handleSave={handleSaveSalesperson}
                isEditMode={Boolean(editingSalesperson)}
                existingSalespersons={salespersons}
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

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading salespersons...</div>
            ) : salespersons.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>No salespersons found.</div>
            ) : (
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
                                            onClick={() => handleDeleteSalesperson(salesperson.id)}
                                            style={{ 
                                                ...formStyles.button,
                                                backgroundColor: '#dc2626',
                                                borderColor: '#dc2626'
                                            }}
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

export default Salespersons;