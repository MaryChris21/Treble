"use client"

import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import UserPosts from "../components/UserPosts"

const UserProfile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const email = localStorage.getItem("userEmail")
    if (!email) {
      setLoading(false)
      return
    }

    fetch(`http://localhost:9090/api/v1/users/email/${email}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data)
        if (data && data.id) {
          localStorage.setItem("userId", data.id)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch user", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-purple-100">
          <h2 className="text-2xl font-bold text-purple-700">User Not Found</h2>
          <p className="mt-2 text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-purple-500/10 shadow-xl overflow-hidden transition-all duration-300 mb-10">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-48 flex items-center justify-center relative">
            <div className="absolute -bottom-16 w-32 h-32 sm:w-40 sm:h-40">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-70"></div>
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl || "/placeholder.svg"}
                  alt={`${user.firstName}'s profile`}
                  className="relative w-full h-full object-cover rounded-full border-4 border-gray-900 z-10"
                />
              ) : (
                <div className="relative w-full h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center border-4 border-gray-900 z-10">
                  <span className="text-4xl font-bold text-white">{user.firstName?.charAt(0) || "U"}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-20 px-6 pb-8 text-white">
            <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-1">
              {user.firstName} {user.lastName || ""}
            </h2>
            <p className="text-purple-400 text-center mb-6">{user.userRole}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="group bg-gray-700/30 rounded-xl p-4 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-sm font-semibold text-purple-300">Email</span>
                </div>
                <p className="text-white pl-7 group-hover:text-purple-300 transition-colors">{user.email}</p>
              </div>

              <div className="group bg-gray-700/30 rounded-xl p-4 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="text-sm font-semibold text-purple-300">Contact</span>
                </div>
                <p className="text-white pl-7 group-hover:text-purple-300 transition-colors">
                  {user.contactNo || "Not provided"}
                </p>
              </div>

              <div className="group bg-gray-700/30 rounded-xl p-4 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-purple-300">Gender</span>
                </div>
                <p className="text-white pl-7 group-hover:text-purple-300 transition-colors">
                  {user.gender || "Not specified"}
                </p>
              </div>

              <div className="group bg-gray-700/30 rounded-xl p-4 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-purple-300">Date of Birth</span>
                </div>
                <p className="text-white pl-7 group-hover:text-purple-300 transition-colors">
                  {user.dob || "Not provided"}
                </p>
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <button
                onClick={() => navigate(`/edit/${user.id}`)}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 shadow-lg shadow-purple-500/20"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* User Posts Section */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-purple-500/10 shadow-xl p-6 text-white">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
            My Posts
          </h3>

          <div className="flex justify-between items-center mb-6">
            <p className="text-purple-400">Share your music journey</p>
            <Link
              to="/create-post"
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/20"
            >
              Create Post
            </Link>
          </div>

          <UserPosts userId={user.id} />
        </div>
      </div>
    </div>
  )
}

export default UserProfile
