import { styled } from "styled-components"
import { Button, EmptyCommissionReportContainer } from "../shared/styles"

const ReturnButton = styled(Button).attrs({ variant: 'primary' })`
    margin-top: 10px;
`

interface EmptyCommissionReportType {
    appliedQuarter: number
    appliedYear: number
    currentYear: number
    currentQuarter: number
    handleClearFilter: () => void
}

export const EmptyCommissionReportState = ({
    appliedQuarter,
    appliedYear,
    currentYear,
    currentQuarter,
    handleClearFilter
}: EmptyCommissionReportType) => {
    return (
        <EmptyCommissionReportContainer>
            <div>No commission reports found for Q{appliedQuarter} {appliedYear}.</div>
            {(appliedYear !== currentYear || appliedQuarter !== currentQuarter) && (
                <ReturnButton onClick={handleClearFilter} variant='primary'>
                    Return to Current Quarter
                </ReturnButton>
            )}
        </EmptyCommissionReportContainer>
    )
}
