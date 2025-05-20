import React, { useState, useCallback } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Product } from '../../types'
import { formStyles } from '../shared/styles'
import { ProductsModal } from './ProductsModal'
import DeleteConfirmationModal from '../shared/DeleteConfirmationModal'
import { NotificationDisplay, useNotification } from '../../hooks/useNotification'
import { PRODUCTS_QUERY_KEY } from '../shared/constants'
import { LoadingState } from '../shared/LoadingState'
import { EmptyState } from '../shared/EmptyState'


type ProductResponse = Product[]

const Products: React.FC = () => {
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
            const data = await response.json()
            return data as ProductResponse
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

    const handleConfirmDelete = useCallback(() => {
        if (productToDelete) {
            deleteProduct(productToDelete.id)
        }
    }, [deleteProduct, productToDelete])

    return (
        <div>
            {notification && (
                <NotificationDisplay notification={notification} />
            )}

            <ProductsModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                product={editingProduct}
                handleSave={handleSaveProduct}
                isEditMode={Boolean(editingProduct)}
                existingProducts={products}
            />

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={productToDelete?.name || 'this product'}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Products</h2>
                <button
                    onClick={() => openProductModal()}
                    style={{ ...formStyles.button, ...formStyles.saveButton }}
                >
                    Add New Product
                </button>
            </div>

            {isLoading ? <LoadingState message='products' /> : !products.length ? <EmptyState message='products' /> :
                (
                    <table style={formStyles.table}>
                        <thead>
                            <tr>
                                <th style={formStyles.th}>Name</th>
                                <th style={formStyles.th}>Manufacturer</th>
                                <th style={formStyles.th}>Style</th>
                                <th style={{ ...formStyles.th, textAlign: 'right' }}>Purchase Price</th>
                                <th style={{ ...formStyles.th, textAlign: 'right' }}>Sale Price</th>
                                <th style={{ ...formStyles.th, textAlign: 'right' }}>Quantity</th>
                                <th style={{ ...formStyles.th, textAlign: 'right' }}>Commission %</th>
                                <th style={{ ...formStyles.th, textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td style={formStyles.td}>{product.name}</td>
                                    <td style={formStyles.td}>{product.manufacturer}</td>
                                    <td style={formStyles.td}>{product.style}</td>
                                    <td style={{ ...formStyles.td, textAlign: 'right' }}>
                                        ${product.purchasePrice.toFixed(2)}
                                    </td>
                                    <td style={{ ...formStyles.td, textAlign: 'right' }}>
                                        ${product.salePrice.toFixed(2)}
                                    </td>
                                    <td style={{ ...formStyles.td, textAlign: 'right' }}>
                                        {product.qtyOnHand}
                                    </td>
                                    <td style={{ ...formStyles.td, textAlign: 'right' }}>
                                        {product.commissionPercentage}%
                                    </td>
                                    <td style={{ ...formStyles.td, textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => openProductModal(product)}
                                                style={{ ...formStyles.button, ...formStyles.saveButton }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(product)}
                                                style={formStyles.deleteButton}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
        </div>
    )
}

export default Products