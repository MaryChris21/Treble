"use client"

import { Link, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import NotificationBadge from "./NotificationBadge"
import NotificationList from "./NotificationList"

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationsRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check if OAuth or normal login was successful
    const email = localStorage.getItem("userEmail")
    const storedUserId = localStorage.getItem("userId")
    const userRole = localStorage.getItem("userRole")

    if (email) setIsLoggedIn(true)
    if (storedUserId) setUserId(storedUserId)
    if (userRole === "admin") setIsAdmin(true)

    // Add click event listener to close notifications when clicking outside
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:9090/api/users/logout", {
        method: "GET",
        credentials: "include",
      })
      localStorage.clear()
      setIsLoggedIn(false)
      setUserId(null)
      setIsAdmin(false)
      navigate("/login")
    } catch (err) {
      console.error("Logout failed", err)
    }
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-black border-b border-purple-500/10 text-white p-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-sm">
      <h1 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Treble
      </h1>
      <div className="space-x-4 flex items-center">
        <Link to="/" className="hover:text-purple-400 transition-colors">
          Users
        </Link>
        <Link to="/feed" className="hover:text-purple-400 transition-colors">
          Feed
        </Link>
        <Link to="/learning-plans" className="hover:text-purple-400 transition-colors">
          Learning Plans
        </Link>

        {isLoggedIn ? (
          <>
            {isLoggedIn && !isAdmin && (
              <>
                <Link to="/my-learning-plans" className="hover:text-purple-400 transition-colors">
                  My Learning Plans
                </Link>
                <Link to="/my-progress-updates" className="hover:text-purple-400 transition-colors">
                  My Progress
                </Link>
              </>
            )}
            <Link to="/all-progress-updates" className="hover:text-purple-400 transition-colors">
              All Progress
            </Link>
            <Link to="/profile" className="hover:text-purple-400 transition-colors">
              Profile
            </Link>
            {!isAdmin && (
              <Link to="/create-post" className="hover:text-purple-400 transition-colors">
                Create Post
              </Link>
            )}
            {isAdmin && (
              <Link to="/create-learning-plan" className="hover:text-purple-400 transition-colors">
                Create Learning Plan
              </Link>
            )}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={toggleNotifications}
                className="relative p-1 rounded-full hover:bg-purple-500/20 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {userId && <NotificationBadge userId={userId} />}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 z-50">
                  <NotificationList userId={userId} onClose={() => setShowNotifications(false)} />
                </div>
              )}
            </div>
            <button onClick={handleLogout} className="text-purple-400 hover:text-purple-300 transition-colors">
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-purple-500/20"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
