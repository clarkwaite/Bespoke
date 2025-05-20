import { useState, useCallback } from 'react'

export type NotificationType = 'error' | 'success'

export interface Notification {
    message: string
    type: NotificationType
}

interface NotificationDisplayProps {
    notification: Notification | null
}

export const useNotification = () => {
    const [notification, setNotification] = useState<Notification | null>(null)

    const showNotification = useCallback((message: string, type: NotificationType) => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }, [])

    const clearNotification = useCallback(() => {
        setNotification(null)
    }, [])

    return { notification, showNotification, clearNotification }
}

const notificationStyles = {
    wrapper: {
        padding: '10px',
        marginBottom: '20px',
        borderRadius: '4px',
        transition: 'all 0.3s ease',
    },
    error: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
    },
    success: {
        backgroundColor: '#dcfce7',
        color: '#16a34a',
    },
}

export const NotificationDisplay = ({ notification }: NotificationDisplayProps) => {
    if (!notification) return null

    return (
        <div
            style={{
                ...notificationStyles.wrapper,
                ...(notification.type === 'error' ? notificationStyles.error : notificationStyles.success),
            }}
        >
            {notification.message}
        </div>
    )
}
