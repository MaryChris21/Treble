"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { api } from "../api"
import toast from "react-hot-toast"

const NotificationList = ({ userId, onClose }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const fetchNotifications = async () => {
      try {
        const response = await api.get(`/notifications/user/${userId}`)
        setNotifications(response.data)
      } catch (error) {
        console.error("Error fetching notifications:", error)
        toast.error("Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [userId])

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification,
        ),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.put(`/notifications/user/${userId}/read-all`)
      setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
      toast.success("All notifications marked as read")
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast.error("Failed to mark all as read")
    }
  }

  const formatTime = (createdAtArray) => {
    if (!Array.isArray(createdAtArray) || createdAtArray.length < 3) return "unknown time"

    const date = new Date(
      createdAtArray[0],
      createdAtArray[1] - 1,
      createdAtArray[2],
      createdAtArray[3] || 0,
      createdAtArray[4] || 0,
      createdAtArray[5] || 0
    )

    if (isNaN(date.getTime())) return "invalid date"

    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? "day" : "days"} ago`
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-black/90 backdrop-blur-lg rounded-lg shadow-xl w-80 max-h-96 overflow-y-auto">
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-purple-100/10 rounded"></div>
          <div className="h-10 bg-purple-100/10 rounded"></div>
          <div className="h-10 bg-purple-100/10 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-black/90 backdrop-blur-lg rounded-lg shadow-xl w-80 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Notifications</h3>
        {notifications.some((notification) => !notification.read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-center text-purple-200/70 py-4">No notifications yet</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg transition-colors ${
                notification.read ? "bg-white/5" : "bg-purple-500/10"
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {notification.sender?.profilePictureUrl ? (
                    <img
                      src={notification.sender.profilePictureUrl || "/placeholder.svg"}
                      alt={`${notification.sender.firstName}'s profile`}
                      className="w-8 h-8 rounded-full object-cover border border-purple-500/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center border border-purple-500/30">
                      <span className="text-sm font-bold text-purple-600">
                        {notification.sender?.firstName?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Notification Content */}
                <div className="flex-grow">
                  <Link
                    to={
                      notification.type === "LIKE"
                        ? `/post/${notification.referenceId}`
                        : `/profile/${notification.senderId}`
                    }
                    onClick={() => {
                      handleMarkAsRead(notification.id)
                      onClose()
                    }}
                    className="block"
                  >
                    <p className="text-sm text-white">{notification.message}</p>
                    <span className="text-xs text-purple-300/70">
                      {formatTime(notification.createdAt)}
                    </span>
                  </Link>
                </div>

                {/* Unread Indicator */}
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationList
