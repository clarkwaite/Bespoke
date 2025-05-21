import React from 'react'
import { CommissionReportType, Salesperson } from '../../types'
import {
    TableContainer,
    Table,
    TableHeader,
    TableCell,
    ActionButton
} from '../shared/styles'

interface CommissionReportTableProps {
    reports: CommissionReportType[]
    salespersons: Salesperson[]
    onViewDetails: (report: CommissionReportType) => void
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
                    <TableHeader>Number of Sales</TableHeader>
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
                            <TableCell>{report.numberOfSales}</TableCell>
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
