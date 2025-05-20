import { styled } from 'styled-components'

const LoadingStateContainer = styled.div`
    text-align: center;
    padding: 20px;
`

export const LoadingState = ({ message }: { message: string }) => {
    return <LoadingStateContainer>
        <p>Loading {message}...</p>
    </LoadingStateContainer>
}