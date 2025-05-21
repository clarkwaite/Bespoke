import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Salespersons } from './Salespersons'
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

const renderWithProvider = () => {
    return render(
        <QueryClientProvider client={queryClient}>
            <Salespersons />
        </QueryClientProvider>
    )
}

describe('Salespersons tests', () => {
    const mockSalespersons = [
        {
            id: 1,
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '123-456-7890',
            address: '123 Sales St',
            startDate: '2024-01-15',
            terminationDate: null,
            manager: 'Bob Wilson'
        },
        {
            id: 2,
            firstName: 'Mike',
            lastName: 'Johnson',
            phone: '987-654-3210',
            address: '456 Commerce Ave',
            startDate: '2024-02-15',
            terminationDate: null,
            manager: 'Bob Wilson'
        }
    ]

    beforeEach(() => {
        mockFetch.mockReset()
    })

    it('renders loading state initially', () => {
        mockFetch.mockImplementationOnce(() => new Promise(() => { }))
        renderWithProvider()
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument()
    })

    it('renders empty state when no salespersons exist', async () => {
        mockFetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            })
        )
        renderWithProvider()
        expect(await screen.findByText(/No salespersons found/i)).toBeInTheDocument()
    })

    it('renders salespersons when data is fetched', async () => {
        mockFetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockSalespersons)
            })
        )
        renderWithProvider()
        expect(await screen.findByText(/Jane Smith/i)).toBeInTheDocument()
        expect(screen.getByText(/123-456-7890/i)).toBeInTheDocument()
        expect(screen.getByText(/123 Sales St/i)).toBeInTheDocument()
        expect(screen.getByText(/Mike Johnson/i)).toBeInTheDocument()
        expect(screen.getByText(/987-654-3210/i)).toBeInTheDocument()
        expect(screen.getByText(/456 Commerce Ave/i)).toBeInTheDocument()
    })
})
