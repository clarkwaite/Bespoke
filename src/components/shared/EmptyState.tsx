import { styled } from "styled-components"
import { formStyles } from "./styles"

const EmptyStateContainer = styled.div`
    text-align: center;
    padding: 20px;
`

export const EmptyState = ({ message }: { message: string }) => {
    return <EmptyStateContainer>
        <p>No {message} found.</p>
    </EmptyStateContainer>
}

interface EmptyCommissionReportType {
    appliedQuarter: number
    appliedYear: number
    currentYear: number
    currentQuarter: number
    handleClearFilter: () => void
}

export const EmptyCommissionReportState = ({ appliedQuarter, appliedYear, currentYear, currentQuarter, handleClearFilter }: EmptyCommissionReportType) => {
    return (
        <EmptyStateContainer>
            <div>No commission reports found for Q{appliedQuarter} {appliedYear}.</div>
            {(appliedYear !== currentYear || appliedQuarter !== currentQuarter) && (
                <button
                    onClick={handleClearFilter}
                    style={{ ...formStyles.button, marginTop: '10px' }}
                >
                    Return to Current Quarter
                </button>
            )}
        </EmptyStateContainer>
    )
}