"use client"

import { useEffect, useState } from "react"
import { api } from "../api"
import { Link } from "react-router-dom"

export default function UsersList() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [filter, setFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        console.log("Making API request to:", api.defaults.baseURL + "/users")
        const res = await api.get("/users")
        console.log("API Response:", res)

        if (Array.isArray(res.data)) {
          setUsers(res.data)
          setFilteredUsers(res.data)
          console.log("Successfully fetched users:", res.data)
        } else {
          console.error("Expected array but got:", res.data)
          setError("Failed to load users data: Unexpected response format")
          setUsers([])
          setFilteredUsers([])
        }
      } catch (err) {
        console.error("Failed to fetch users", err)
        console.error("Error details:", err.response ? err.response.data : "No response data")

        let errorMessage = "Failed to fetch users"
        if (err.code === "ERR_NETWORK") {
          errorMessage =
            "Cannot connect to the server. Please make sure the backend is running at http://localhost:9090"
        } else if (err.response) {
          errorMessage = `Server error: ${err.response.status} ${err.response.statusText}`
          if (err.response.data && err.response.data.error) {
            errorMessage += ` - ${err.response.data.error}`
          }
        }

        setError(errorMessage)
        setUsers([])
        setFilteredUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    if (filter === "All") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter((u) => u.userRole?.toLowerCase() === filter.toLowerCase())
      setFilteredUsers(filtered)
    }
  }, [filter, users])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 bg-purple-200 rounded-full mb-4"></div>
          <div className="h-8 w-64 bg-purple-200 rounded-md mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-80 bg-purple-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-purple-100">
          <h2 className="text-2xl font-bold text-purple-700">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-full"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">👥 Explore All Users</h2>

      {/* User Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
          filteredUsers.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 flex flex-col items-center text-center"
            >
              {u.profilePictureUrl ? (
                <img
                  src={u.profilePictureUrl || "/placeholder.svg?height=80&width=80"}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-purple-500"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "/placeholder.svg?height=80&width=80"
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-purple-200 flex items-center justify-center border-4 border-purple-500">
                  <span className="text-2xl font-bold text-purple-600">{u.firstName?.charAt(0) || "U"}</span>
                </div>
              )}
              <h3 className="mt-4 text-lg font-bold text-gray-700">
                {u.firstName} {u.lastName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{u.email}</p>
              <p className="text-xs text-purple-600 font-medium mt-1">{u.userRole}</p>
              <Link
                to={`/profile/${u.id}`}
                className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-full"
              >
                View Profile
              </Link>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500">No users found.</p>
        )}
      </div>
    </div>
  )
}
