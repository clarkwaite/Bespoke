import React, { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Sale } from '../../types'
import {
    Container,
    Header,
    FilterContainer,
    Field,
    Label,
    DatePicker,
    ButtonGroup,
    Table,
    TableHeader,
    TableCell,
    Button,
    DateApplyButton,
} from '../shared/styles'
import { SalesModal } from './SalesModal'
import { DateRange, SaleFormData } from './types'
import { isBetweenTwoDates } from '../shared/helpers'
import { NotificationDisplay, useNotification } from '../../hooks/useNotification'
import { SALES_QUERY_KEY } from '../shared/constants'
import { LoadingState } from '../shared/LoadingState'
import { EmptyState } from '../shared/EmptyState'

const Sales: React.FC = () => {
    const queryClient = useQueryClient()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [dateFilter, setDateFilter] = useState<DateRange>({ startDate: '', endDate: '' })
    const [appliedDateFilter, setAppliedDateFilter] = useState<DateRange>({ startDate: '', endDate: '' })
    const { notification, showNotification } = useNotification()

    const { data: sales = [], isLoading } = useQuery({
        queryKey: SALES_QUERY_KEY,
        queryFn: async () => {
            const response = await fetch('/api/sales')
            if (!response.ok) {
                throw new Error('Failed to fetch sales')
            }
            return response.json() as Promise<Sale[]>
        }
    })

    const { mutate: createSale } = useMutation({
        mutationFn: async (formData: SaleFormData) => {
            const response = await fetch('/api/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            if (!response.ok) {
                throw new Error('Failed to create sale')
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEY })
            setIsAddModalOpen(false)
            showNotification('Sale created successfully', 'success')
        },
        onError: (error) => {
            showNotification(error instanceof Error ? error.message : 'Failed to create sale', 'error')
        }
    })

    const handleApplyFilter = () => {
        console.log('Applying filter:', dateFilter)
        setAppliedDateFilter(dateFilter)
    }

    const handleClearFilter = () => {
        setDateFilter({ startDate: '', endDate: '' })
        setAppliedDateFilter({ startDate: '', endDate: '' })
    }

    const calculateCommission = (sale: Sale): number => {
        return sale.product.salePrice * (sale.product.commissionPercentage / 100)
    }

    const salesTableTD = (value: string) => {
        return <TableCell>{value}</TableCell>
    }

    const salesTableHeaders = [
        'Customer',
        'Date',
        'Price',
        'Salesperson',
        'Commission'
    ]

    return (
        <Container>
            <NotificationDisplay notification={notification} />

            <SalesModal
                isModalOpen={isAddModalOpen}
                setIsModalOpen={setIsAddModalOpen}
                handleSave={createSale}
                isEditMode={false}
            />

            <Header>
                <h2>Sales</h2>
                <Button variant='primary' onClick={() => setIsAddModalOpen(true)}>
                    Create New Sale
                </Button>
            </Header>

            <FilterContainer>
                <Field>
                    <Label>Start Date</Label>
                    <DatePicker
                        type="date"
                        value={dateFilter.startDate}
                        onChange={e => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                    />
                </Field>
                <Field>
                    <Label>End Date</Label>
                    <DatePicker
                        type="date"
                        value={dateFilter.endDate}
                        onChange={e => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                    />
                </Field>

                <ButtonGroup>
                    <DateApplyButton onClick={handleApplyFilter} variant='primary' disabled={!dateFilter.startDate || !dateFilter.endDate}>
                        Apply Filter
                    </DateApplyButton>
                    {(appliedDateFilter.startDate || appliedDateFilter.endDate) && (
                        <Button onClick={handleClearFilter} variant='danger'>
                            Clear Filter
                        </Button>
                    )}
                </ButtonGroup>
            </FilterContainer>

            {isLoading ? <LoadingState message='sales' /> : !sales.length ? <EmptyState message='sales' /> : (
                <Table>
                    <thead>
                        <tr>
                            {salesTableHeaders.map((header, index) => (
                                <TableHeader key={index}>
                                    {header}
                                </TableHeader>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sales
                            .filter((sale) => appliedDateFilter.startDate && appliedDateFilter.endDate
                                ? isBetweenTwoDates({ date: sale.date, dateFilter: appliedDateFilter })
                                : true)
                            .map(sale => (
                                <tr key={sale.id}>
                                    {salesTableTD(`${sale.customer.firstName} ${sale.customer.lastName}`)}
                                    {salesTableTD(new Date(sale.date).toLocaleDateString())}
                                    {salesTableTD(sale.product.salePrice.toFixed(2))}
                                    {salesTableTD(`${sale.salesPerson.firstName} ${sale.salesPerson.lastName}`)}
                                    {salesTableTD(calculateCommission(sale).toFixed(2))}
                                </tr>
                            ))}
                    </tbody>
                </Table>
            )}
        </Container>
    )
}

export default Sales