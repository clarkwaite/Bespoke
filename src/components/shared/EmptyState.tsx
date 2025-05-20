import { styled } from "styled-components"

const EmptyStateContainer = styled.div`
    text-align: center;
    padding: 20px;
`

export const EmptyState = ({ message }: { message: string }) => {
    return <EmptyStateContainer>
        <p>No {message} found.</p>
    </EmptyStateContainer>
}