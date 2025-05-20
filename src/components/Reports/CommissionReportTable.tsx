import React from 'react'
import { CommissionReport, Salesperson } from '../../types'
import {
    TableContainer,
    Table,
    TableHeader,
    TableCell,
    ActionButton
} from '../shared/styles'

interface CommissionReportTableProps {
    reports: CommissionReport[]
    salespersons: Salesperson[]
    onViewDetails: (report: CommissionReport) => void
}

export const CommissionReportTable: React.FC<CommissionReportTableProps> = ({
    reports,
    salespersons,
    onViewDetails
}) => (
    <TableContainer>
        <Table>
            <thead>
                <tr>
                    <TableHeader>Salesperson</TableHeader>
                    <TableHeader>Total Sales</TableHeader>
                    <TableHeader>Total Commission</TableHeader>
                    <TableHeader>Actions</TableHeader>
                </tr>
            </thead>
            <tbody>
                {reports.map(report => {
                    const salesperson = salespersons.find(sp => sp.id === report.salespersonId)
                    if (!salesperson) return null
                    return (
                        <tr key={report.salespersonId}>
                            <TableCell>
                                {`${salesperson.firstName} ${salesperson.lastName}`}
                            </TableCell>
                            <TableCell>${report.totalSales.toFixed(2)}</TableCell>
                            <TableCell>${report.totalCommission.toFixed(2)}</TableCell>
                            <TableCell>
                                <ActionButton
                                    action="edit"
                                    onClick={() => onViewDetails(report)}
                                >
                                    View Details
                                </ActionButton>
                            </TableCell>
                        </tr>
                    )
                })}
            </tbody>
        </Table>
    </TableContainer>
)
