import React, { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CommissionReport, Salesperson, Sale } from '../../types'
import Modal from '../shared/Modal'
import { formStyles } from '../shared/styles'

const SALES_QUERY_KEY = ['sales']
const SALESPERSONS_QUERY_KEY = ['salespersons']

const CommissionReports: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
    const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.floor(new Date().getMonth() / 3) + 1)
    const [appliedYear, setAppliedYear] = useState<number>(new Date().getFullYear())
    const [appliedQuarter, setAppliedQuarter] = useState<number>(Math.floor(new Date().getMonth() / 3) + 1)
    const [selectedReport, setSelectedReport] = useState<CommissionReport | null>(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

    const currentYear = new Date().getFullYear()
    const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1

    const { data: salespersons = [], isLoading: isSalespersonsLoading, error: salespersonsError } = useQuery({
        queryKey: SALESPERSONS_QUERY_KEY,
        queryFn: async () => {
            const response = await fetch('/api/salespersons')
            if (!response.ok) {
                throw new Error('Failed to fetch salespersons')
            }
            return response.json() as Promise<Salesperson[]>
        },
    })

    const { data: sales = [], isLoading: isSalesLoading, error: salesError } = useQuery({
        queryKey: SALES_QUERY_KEY,
        queryFn: async () => {
            const response = await fetch('/api/sales')
            if (!response.ok) {
                throw new Error('Failed to fetch sales')
            }
            return response.json() as Promise<Sale[]>
        },
    })

    const isDateInSelectedQuarter = useCallback((date: string) => {
        const saleDate = new Date(date)
        const saleYear = saleDate.getFullYear()
        const saleQuarter = Math.floor(saleDate.getMonth() / 3) + 1
        return saleYear === appliedYear && saleQuarter === appliedQuarter
    }, [appliedYear, appliedQuarter])

    const calculateCommissionReports = useCallback((salespersons: Salesperson[], sales: Sale[]): CommissionReport[] => {
        // Filter sales by selected quarter
        const filteredSales = sales.filter(sale => isDateInSelectedQuarter(sale.date))

        // For each salesperson, collect their sales and calculate totals
        return salespersons.map(sp => {
            const salesList = filteredSales.filter(sale => sale.salesPersonId === sp.id)
            let totalSales = 0
            let totalCommission = 0

            salesList.forEach(sale => {
                const saleAmount = sale.product.salePrice
                const commissionPercentage = sale.product.commissionPercentage
                totalSales += saleAmount
                totalCommission += (saleAmount * (commissionPercentage / 100))
            })

            return {
                salespersonId: sp.id,
                totalSales,
                totalCommission,
                salesDetails: salesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            }
        })
            .filter(report => report.salesDetails.length > 0)
            .sort((a, b) => b.totalCommission - a.totalCommission)
    }, [isDateInSelectedQuarter])

    const getSalespersonName = (id: number): string => {
        const salesperson = salespersons.find(sp => sp.id === id)
        return salesperson ? `${salesperson.firstName} ${salesperson.lastName}` : 'Unknown'
    }

    const handleApplyFilter = () => {
        setAppliedYear(selectedYear)
        setAppliedQuarter(selectedQuarter)
    }

    const handleClearFilter = () => {
        setSelectedYear(currentYear)
        setSelectedQuarter(currentQuarter)
        setAppliedYear(currentYear)
        setAppliedQuarter(currentQuarter)
    }

    const getYearsToShow = () => {
        return [currentYear - 2, currentYear - 1, currentYear]
    }

    const reports = calculateCommissionReports(salespersons, sales)
    const isLoading = isSalespersonsLoading || isSalesLoading
    const error = salespersonsError || salesError

    if (error) {
        return (
            <div style={{
                padding: '10px',
                margin: '20px',
                borderRadius: '4px',
                backgroundColor: '#fee2e2',
                color: '#dc2626'
            }}>
                {error instanceof Error ? error.message : 'An error occurred while loading the data'}
            </div>
        )
    }

    return (
        <div>
            <Modal
                isOpen={isDetailsModalOpen}
                onRequestClose={() => setIsDetailsModalOpen(false)}
                title={`Sales Details - ${selectedReport ? getSalespersonName(selectedReport.salespersonId) : ''}`}
                showConfirmButton={false}
            >
                {selectedReport && (
                    <div>
                        <table style={formStyles.table}>
                            <thead>
                                <tr>
                                    <th style={formStyles.th}>Date</th>
                                    <th style={formStyles.th}>Product</th>
                                    <th style={formStyles.th}>Customer</th>
                                    <th style={formStyles.th}>Sale Price</th>
                                    <th style={formStyles.th}>Commission</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedReport.salesDetails.map(sale => (
                                    <tr key={sale.id}>
                                        <td style={formStyles.td}>
                                            {new Date(sale.date).toLocaleDateString()}
                                        </td>
                                        <td style={formStyles.td}>{sale.product.name}</td>
                                        <td style={formStyles.td}>
                                            {`${sale.customer.firstName} ${sale.customer.lastName}`}
                                        </td>
                                        <td style={{ ...formStyles.td, textAlign: 'right' }}>
                                            ${sale.product.salePrice.toFixed(2)}
                                        </td>
                                        <td style={{ ...formStyles.td, textAlign: 'right' }}>
                                            ${(sale.product.salePrice * (sale.product.commissionPercentage / 100)).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={3} style={{ ...formStyles.td, textAlign: 'right', fontWeight: 'bold' }}>
                                        Total:
                                    </td>
                                    <td style={{ ...formStyles.td, textAlign: 'right', fontWeight: 'bold' }}>
                                        ${selectedReport.totalSales.toFixed(2)}
                                    </td>
                                    <td style={{ ...formStyles.td, textAlign: 'right', fontWeight: 'bold' }}>
                                        ${selectedReport.totalCommission.toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                        <div style={{ marginTop: '20px', textAlign: 'right' }}>
                            <button
                                style={formStyles.button}
                                onClick={() => setIsDetailsModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <h2>Quarterly Commission Reports</h2>

            <div style={formStyles.filterContainer}>
                <div style={formStyles.field}>
                    <label style={formStyles.label}>Year</label>
                    <select
                        style={formStyles.select}
                        value={selectedYear}
                        onChange={e => setSelectedYear(parseInt(e.target.value))}
                    >
                        {getYearsToShow().map(year => {
                            return (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            )
                        })}
                    </select>
                </div>

                <div style={formStyles.field}>
                    <label style={formStyles.label}>Quarter</label>
                    <select
                        style={formStyles.select}
                        value={selectedQuarter}
                        onChange={e => setSelectedQuarter(parseInt(e.target.value))}
                    >
                        {[1, 2, 3, 4].map(quarter => (
                            <option key={quarter} value={quarter}>
                                Q{quarter}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                    <button
                        onClick={handleApplyFilter}
                        style={selectedYear === appliedYear && selectedQuarter === appliedQuarter ? formStyles.disabledButton : formStyles.dateApplyButton}
                        disabled={selectedYear === appliedYear && selectedQuarter === appliedQuarter}
                    >
                        Apply Filter
                    </button>
                    {(appliedYear !== currentYear || appliedQuarter !== currentQuarter) && (
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
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading commission reports...</div>
            ) : !reports.length ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div>No commission reports found for Q{appliedQuarter} {appliedYear}.</div>
                    {(appliedYear !== currentYear || appliedQuarter !== currentQuarter) && (
                        <button
                            onClick={handleClearFilter}
                            style={{ ...formStyles.button, marginTop: '10px' }}
                        >
                            Return to Current Quarter
                        </button>
                    )}
                </div>
            ) : (
                <table style={formStyles.table}>
                    <thead>
                        <tr>
                            <th style={formStyles.th}>Salesperson</th>
                            <th style={{ ...formStyles.th, textAlign: 'right' }}>Total Sales</th>
                            <th style={{ ...formStyles.th, textAlign: 'right' }}>Total Commission</th>
                            <th style={{ ...formStyles.th, textAlign: 'center' }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.salespersonId}>
                                <td style={formStyles.td}>
                                    {getSalespersonName(report.salespersonId)}
                                </td>
                                <td style={{ ...formStyles.td, textAlign: 'right' }}>
                                    ${report.totalSales.toFixed(2)}
                                </td>
                                <td style={{ ...formStyles.td, textAlign: 'right' }}>
                                    ${report.totalCommission.toFixed(2)}
                                </td>
                                <td style={{ ...formStyles.td, textAlign: 'center' }}>
                                    <button
                                        onClick={() => {
                                            setSelectedReport(report)
                                            setIsDetailsModalOpen(true)
                                        }}
                                        style={formStyles.button}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default CommissionReports