"use client"

import { useState, useEffect } from "react"
import { api } from "../api"

const NotificationBadge = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!userId) return

    const fetchUnreadCount = async () => {
      try {
        const response = await api.get(`/notifications/unread/count/user/${userId}`)
        setUnreadCount(response.data.count)
      } catch (error) {
        console.error("Error fetching unread notification count:", error)
      }
    }

    fetchUnreadCount()

    // Set up polling to check for new notifications every 30 seconds
    const intervalId = setInterval(fetchUnreadCount, 30000)

    return () => clearInterval(intervalId)
  }, [userId])

  if (unreadCount === 0) return null

  return (
    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {unreadCount > 9 ? "9+" : unreadCount}
    </div>
  )
}

export default NotificationBadge
