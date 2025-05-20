import { styled } from "styled-components"

const ErrorContainer = styled.div`
    text-align: center;
    padding: 20px;
    color: #dc3545;
`

export const ErrorState = ({ message }: { message: string }) => {
    return <ErrorContainer>
        <p>Error: {message}</p>
    </ErrorContainer>
}
