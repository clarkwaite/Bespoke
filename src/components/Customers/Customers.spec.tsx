import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Customers } from './Customers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

let queryClient: QueryClient

const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
    queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })
})

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        <QueryClientProvider client={queryClient}>
            {ui}
        </QueryClientProvider>
    )
}

describe('Customers tests', () => {
    const mockCustomers = [
        { id: 1, firstName: 'John', lastName: 'Doe', phone: '123-456-7890', address: '123 Main St' },
        { id: 2, firstName: 'Jane', lastName: 'Doe', phone: '987-654-3210', address: '456 Elm St' },
        { id: 3, firstName: 'Alice', lastName: 'Smith', phone: '555-555-5555', address: '789 Oak St' },
    ]

    beforeEach(() => {
        queryClient.clear()
    })

    it('renders loading state initially', () => {
        mockFetch.mockImplementationOnce(() => new Promise(() => { }))
        renderWithProvider(<Customers />)
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument()
    })

    it('renders empty state when no customers exist', async () => {
        mockFetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            })
        )
        renderWithProvider(<Customers />)
        expect(await screen.findByText(/No customers found/i)).toBeInTheDocument()
    })

    it('renders customers when data is fetched', async () => {
        mockFetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockCustomers)
            })
        )
        renderWithProvider(<Customers />)
        expect(await screen.findByText(/John Doe/i)).toBeInTheDocument()
        expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument()
        expect(screen.getByText(/Alice Smith/i)).toBeInTheDocument()
    })
})
