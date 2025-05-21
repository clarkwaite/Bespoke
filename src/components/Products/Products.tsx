import React, { useState, useCallback } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Product } from '../../types'
import {
    ContentContainer,
    PageHeader,
    TableContainer,
    Table,
    TableHeader,
    TableCell,
    TableActions,
    ActionButton,
    Button,
} from '../shared/styles'
import { ProductsModal } from './ProductsModal'
import { DeleteConfirmationModal } from '../shared/DeleteConfirmationModal'
import { NotificationDisplay, useNotification } from '../../hooks/useNotification'
import { PRODUCTS_QUERY_KEY } from '../shared/constants'
import { LoadingState } from '../shared/LoadingState'
import { EmptyState } from '../shared/EmptyState'

export const Products = () => {
    const queryClient = useQueryClient()
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<Product | null>(null)
    const { notification, showNotification } = useNotification()

    const { data: products = [], isLoading } = useQuery({
        queryKey: PRODUCTS_QUERY_KEY,
        queryFn: async () => {
            const response = await fetch('/api/products')
            if (!response.ok) {
                throw new Error('Failed to fetch products')
            }
            return response.json() as Promise<Product[]>
        }
    })

    const { mutate: saveProduct } = useMutation({
        mutationFn: async (product: Omit<Product, 'id'> & { id?: number }) => {
            const isUpdate = typeof product.id === 'number'
            const response = await fetch(
                isUpdate ? `/api/products/${product.id}` : '/api/products',
                {
                    method: isUpdate ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(product),
                }
            )

            if (response.ok && response.status === 204) {
                return product as Product
            }

            return response.ok ? (await response.json() as Product) : product as Product
        },
        onSuccess: (_, variables) => {
            const isUpdate = typeof variables.id === 'number'
            queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
            showNotification(`Product ${isUpdate ? 'updated' : 'added'} successfully`, 'success')
            setIsModalOpen(false)
        },
        onError: () => {
            showNotification('Failed to save product', 'error')
        }
    })

    const { mutate: deleteProduct } = useMutation({
        mutationFn: async (productId: number) => {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!response.ok) {
                throw new Error('Failed to delete product')
            }

            return productId
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
            showNotification('Product deleted successfully', 'success')
        }
    })

    const openProductModal = useCallback((product?: Product) => {
        setEditingProduct(product || null)
        setIsModalOpen(true)
    }, [])

    const handleSaveProduct = useCallback(async (product: Omit<Product, 'id'> & { id?: number }) => {
        saveProduct(product)
    }, [saveProduct])

    const handleDeleteClick = useCallback((product: Product) => {
        setProductToDelete(product)
        setDeleteModalOpen(true)
    }, [])

    return (
        <ContentContainer>
            <NotificationDisplay notification={notification} />

            <ProductsModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                product={editingProduct}
                handleSave={handleSaveProduct}
                isEditMode={!!editingProduct}
                existingProducts={products}
            />

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => {
                    if (productToDelete) {
                        deleteProduct(productToDelete.id)
                        setDeleteModalOpen(false)
                        setProductToDelete(null)
                    }
                }}
                title="Delete Product"
                itemName="product"
            />

            <PageHeader>
                <h2>Products</h2>
                <Button variant='primary' onClick={() => openProductModal()}>
                    Add New Product
                </Button>
            </PageHeader>

            {isLoading ? <LoadingState message='products' /> : !products.length ? <EmptyState message='products' /> : (
                <TableContainer>
                    <Table>
                        <thead>
                            <tr>
                                <TableHeader>Name</TableHeader>
                                <TableHeader>Manufacturer</TableHeader>
                                <TableHeader>Style</TableHeader>
                                <TableHeader>Purchase Price</TableHeader>
                                <TableHeader>Sale Price</TableHeader>
                                <TableHeader>Quantity</TableHeader>
                                <TableHeader>Commission %</TableHeader>
                                <TableHeader>Actions</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.manufacturer}</TableCell>
                                    <TableCell>{product.style}</TableCell>
                                    <TableCell>${product.purchasePrice.toFixed(2)}</TableCell>
                                    <TableCell>${product.salePrice.toFixed(2)}</TableCell>
                                    <TableCell>{product.qtyOnHand}</TableCell>
                                    <TableCell>{product.commissionPercentage}%</TableCell>
                                    <TableCell>
                                        <TableActions>
                                            <ActionButton
                                                action="edit"
                                                onClick={() => openProductModal(product)}
                                            >
                                                Edit
                                            </ActionButton>
                                            <ActionButton
                                                action="delete"
                                                onClick={() => handleDeleteClick(product)}
                                            >
                                                Delete
                                            </ActionButton>
                                        </TableActions>
                                    </TableCell>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </TableContainer>
            )}
        </ContentContainer>
    )
}