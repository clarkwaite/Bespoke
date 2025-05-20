import React, { useState, useCallback } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Sale, SaleFormData, DateRangeFilter, Product, Salesperson, Customer } from '../../types'
import { formStyles } from '../shared/styles'
import { SalesModal } from './SalesModal'
import { isBetweenTwoDates } from '../shared/helpers'

type ErrorMessage = {
    message: string
    type: 'error' | 'success'
}

const SALES_QUERY_KEY = ['sales']
const PRODUCTS_QUERY_KEY = ['products']
const SALESPERSONS_QUERY_KEY = ['salespersons']
const CUSTOMERS_QUERY_KEY = ['customers']

const Sales: React.FC = () => {
    const queryClient = useQueryClient()
    const [dateFilter, setDateFilter] = useState<DateRangeFilter>({
        startDate: '',
        endDate: ''
    })
    const [appliedDateFilter, setAppliedDateFilter] = useState<DateRangeFilter>({
        startDate: '',
        endDate: ''
    })
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [notification, setNotification] = useState<ErrorMessage | null>(null)

    const showNotification = useCallback((message: string, type: 'error' | 'success') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }, [])

    const { data: sales = [], isLoading: isSalesLoading } = useQuery({
        queryKey: SALES_QUERY_KEY,
        queryFn: async () => {
            const response = await fetch('/api/sales')
            if (!response.ok) {
                throw new Error('Failed to fetch sales')
            }
            return response.json() as Promise<Sale[]>
        }
    })

    const { data: products = [] } = useQuery({
        queryKey: PRODUCTS_QUERY_KEY,
        queryFn: async () => {
            const response = await fetch('/api/products')
            if (!response.ok) {
                throw new Error('Failed to fetch products')
            }
            return response.json() as Promise<Product[]>
        }
    })

    const { data: salespersons = [] } = useQuery({
        queryKey: SALESPERSONS_QUERY_KEY,
        queryFn: async () => {
            const response = await fetch('/api/salespersons')
            if (!response.ok) {
                throw new Error('Failed to fetch salespersons')
            }
            return response.json() as Promise<Salesperson[]>
        }
    })

    const { data: customers = [] } = useQuery({
        queryKey: CUSTOMERS_QUERY_KEY,
        queryFn: async () => {
            const response = await fetch('/api/customers')
            if (!response.ok) {
                throw new Error('Failed to fetch customers')
            }
            return response.json() as Promise<Customer[]>
        }
    })

    const { mutate: createSale } = useMutation({
        mutationFn: async (formData: SaleFormData) => {
            const response = await fetch('/api/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            if (!response.ok) {
                throw new Error('Failed to create sale')
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEY })
            setIsAddModalOpen(false)
            showNotification('Sale created successfully', 'success')
        },
        onError: (error) => {
            showNotification(error instanceof Error ? error.message : 'Failed to create sale', 'error')
        }
    })

    const handleApplyFilter = () => {
        setAppliedDateFilter(dateFilter)
    }

    const handleClearFilter = () => {
        setDateFilter({ startDate: '', endDate: '' })
        setAppliedDateFilter({ startDate: '', endDate: '' })
    }

    const calculateCommission = (sale: Sale): number => {
        return sale.product.salePrice * (sale.product.commissionPercentage / 100)
    }

    const salesTableTD = (value: string) => {
        return <td style={formStyles.td}>{value}</td>
    }

    const salesTableHeaders = [
        'Customer',
        'Date',
        'Price',
        'Salesperson',
        'Commission'
    ]

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
                products={products}
                salespersons={salespersons}
                customers={customers}
                handleSave={createSale}
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

            {isSalesLoading ? (
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
    )
}

export default Sales