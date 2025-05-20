import React, { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CommissionReport, Salesperson, Sale } from '../../types'
import {
    ContentContainer,
    ReportHeader,
    ReportFilters,
    FormField,
    FormLabel,
    Select,
    ApplyFilterButton
} from '../shared/styles'
import { CommissionDetailsModal } from './CommissionDetailsModal'
import { LoadingState } from '../shared/LoadingState'
import { ErrorState } from '../shared/ErrorState'
import { EmptyCommissionReportState } from './EmptyCommissionReportState'
import { CommissionReportTable } from './CommissionReportTable'

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

    const generateCommissionReports = useCallback((): CommissionReport[] => {
        const filteredSales = sales.filter(sale => isDateInSelectedQuarter(sale.date))
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
                salespersonName: `${sp.firstName} ${sp.lastName}`,
                totalSales,
                totalCommission,
                salesDetails: salesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            }
        })
            .filter(report => report.salesDetails.length > 0)
            .sort((a, b) => b.totalCommission - a.totalCommission)
    }, [isDateInSelectedQuarter, sales, salespersons])

    return (
        <ContentContainer>
            <ReportHeader>
                <h2>Commission Reports</h2>
            </ReportHeader>

            <ReportFilters>
                <FormField>
                    <FormLabel>Year</FormLabel>
                    <Select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                        {Array.from(
                            { length: 5 },
                            (_, i) => currentYear - i
                        ).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </Select>
                </FormField>

                <FormField>
                    <FormLabel>Quarter</FormLabel>
                    <Select
                        value={selectedQuarter}
                        onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                    >
                        {[1, 2, 3, 4].map(quarter => (
                            <option
                                key={quarter}
                                value={quarter}
                                disabled={selectedYear === currentYear && quarter > currentQuarter}
                            >
                                Q{quarter}
                            </option>
                        ))}
                    </Select>
                </FormField>

                <ApplyFilterButton
                    onClick={() => {
                        setAppliedYear(selectedYear)
                        setAppliedQuarter(selectedQuarter)
                    }}
                    action='edit'
                >
                    Apply Filter
                </ApplyFilterButton>
            </ReportFilters>

            {/* Render appropriate state based on conditions */}
            {isSalespersonsLoading || isSalesLoading ? (
                <LoadingState message="commission report" />
            ) : salespersonsError ? (
                <ErrorState message={`Error loading salespersons: ${salespersonsError.message}`} />
            ) : salesError ? (
                <ErrorState message={`Error loading sales: ${salesError.message}`} />
            ) : !generateCommissionReports().length ? (
                <EmptyCommissionReportState
                    appliedQuarter={appliedQuarter}
                    appliedYear={appliedYear}
                    currentYear={currentYear}
                    currentQuarter={currentQuarter}
                    handleClearFilter={() => {
                        setAppliedYear(currentYear)
                        setAppliedQuarter(currentQuarter)
                    }}
                />
            ) : (
                <>
                    <CommissionReportTable
                        reports={generateCommissionReports()}
                        salespersons={salespersons}
                        onViewDetails={(report) => {
                            setSelectedReport(report)
                            setIsDetailsModalOpen(true)
                        }} />

                    <CommissionDetailsModal
                        isOpen={isDetailsModalOpen}
                        onClose={() => setIsDetailsModalOpen(false)}
                        report={selectedReport}
                    />
                </>
            )}
        </ContentContainer>
    )
}

export default CommissionReports