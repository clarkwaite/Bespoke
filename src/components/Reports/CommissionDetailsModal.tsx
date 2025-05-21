import React from 'react'
import { CommissionReportType, Sale } from '../../types'
import Modal from '../shared/Modal'
import {
    DetailsList,
    DetailsItem,
    DetailRow,
    DetailLabel,
    DetailValue,
} from '../shared/styles'

interface CommissionDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    report: CommissionReportType | null
}

export const CommissionDetailsModal: React.FC<CommissionDetailsModalProps> = ({
    isOpen,
    onClose,
    report
}) => {
    const calculateCommission = (sale: Sale) => {
        return sale.product.salePrice * (sale.product.commissionPercentage / 100)
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            title={`Quarterly Commission Details for ${report?.salespersonName}`}
            showConfirmButton={false}
        >
            {report && (
                <DetailsList>
                    {report.salesDetails.map((sale) => (
                        <DetailsItem key={sale.id}>
                            <DetailRow>
                                <DetailLabel>Product:</DetailLabel>
                                <DetailValue>{sale.product.name}</DetailValue>
                            </DetailRow>
                            <DetailRow>
                                <DetailLabel>Customer:</DetailLabel>
                                <DetailValue>
                                    {`${sale.customer.firstName} ${sale.customer.lastName}`}
                                </DetailValue>
                            </DetailRow>
                            <DetailRow>
                                <DetailLabel>Sale Date:</DetailLabel>
                                <DetailValue>
                                    {new Date(sale.date).toLocaleDateString()}
                                </DetailValue>
                            </DetailRow>
                            <DetailRow>
                                <DetailLabel>Sale Amount:</DetailLabel>
                                <DetailValue>
                                    ${sale.product.salePrice.toFixed(2)}
                                </DetailValue>
                            </DetailRow>
                            <DetailRow>
                                <DetailLabel>Commission:</DetailLabel>
                                <DetailValue>
                                    ${calculateCommission(sale).toFixed(2)}
                                </DetailValue>
                            </DetailRow>
                        </DetailsItem>
                    ))}
                </DetailsList>
            )}
        </Modal>
    )
}
