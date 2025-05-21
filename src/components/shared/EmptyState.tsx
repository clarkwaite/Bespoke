import { EmptyStateContainer } from "./styles"

export const EmptyState = ({ message }: { message: string }) => {
    return <EmptyStateContainer>
        <p>No {message} found.</p>
    </EmptyStateContainer>
}