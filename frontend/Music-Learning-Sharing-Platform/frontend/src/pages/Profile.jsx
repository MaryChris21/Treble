"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { api } from "../api"
import toast from "react-hot-toast"

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followCount, setFollowCount] = useState(0)
  const loggedInUserId = localStorage.getItem("userId")

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get(`/users/${id}`)
        setUser(res.data)

        // Store the user ID in localStorage if not already there
        if (!localStorage.getItem("userId") && localStorage.getItem("userEmail") === res.data.email) {
          localStorage.setItem("userId", res.data.id)
        }

        // Check if current logged-in user is following this profile
        const currentUserId = localStorage.getItem("userId")
        if (currentUserId) {
          // Check if this user is in the followers list
          const isFollowing = res.data.followerIds.includes(Number.parseInt(currentUserId))
          setIsFollowing(isFollowing)
        }

        setFollowCount(res.data.followerIds.length)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Failed to load profile.")
        setLoading(false)
      }
    }

    fetchUserData()
  }, [id])

  const toggleFollow = async () => {
    try {
      const loggedInUserId = localStorage.getItem("userId")

      if (!loggedInUserId) {
        toast.error("Please log in to follow users")
        return
      }

      if (isFollowing) {
        await api.delete(`/users/${loggedInUserId}/unfollow/${id}`)
        setIsFollowing(false)
        setFollowCount((prev) => prev - 1)
        toast.success("Unfollowed successfully")
      } else {
        await api.post(`/users/${loggedInUserId}/follow/${id}`)
        setIsFollowing(true)
        setFollowCount((prev) => prev + 1)
        toast.success("Followed successfully")
      }
    } catch (error) {
      console.error("Follow/unfollow error:", error)
      toast.error("Failed to update follow status")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-purple-400 animate-spin animate-reverse"></div>
          <div className="absolute inset-4 rounded-full border-b-2 border-purple-300 animate-spin"></div>
        </div>
      </div>
    )
  }

  return user ? (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/90 to-purple-900/30 z-0"></div>
      <div className="absolute inset-0 z-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-purple-500/20 animate-float-random"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-20 w-full max-w-md px-4 sm:px-6 py-10">
        <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-[0_0_30px_rgba(236,72,153,0.2)] p-6 sm:p-8">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 blur opacity-70"></div>
              <div className="relative rounded-full p-1 bg-black">
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl || "/placeholder.svg"}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-purple-200 flex items-center justify-center">
                    <span className="text-4xl font-bold text-purple-600">{user.firstName?.charAt(0) || "U"}</span>
                  </div>
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {user.firstName} {user.lastName || ""}
            </h2>
            <p className="text-purple-400 text-sm mb-2">{user.userRole}</p>

            <p className="text-purple-300 text-sm mb-6">
              {followCount} follower{followCount !== 1 && "s"}
            </p>

            {loggedInUserId != id && (
              <button
                onClick={toggleFollow}
                className={`px-6 py-2 rounded-full ${
                  isFollowing ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"
                } text-white transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>

          <div className="w-full space-y-4 mt-6">
            <div className="bg-white/5 rounded-xl p-4 border border-purple-500/20">
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
                <span className="text-sm font-semibold text-purple-200">Email</span>
              </div>
              <p className="text-white pl-7">{user.email}</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="text-sm font-semibold text-purple-200">Gender</span>
              </div>
              <p className="text-white pl-7">{user.gender || "Not specified"}</p>
            </div>
          </div>

          <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-[90%] h-1 bg-purple-500/50 blur-md"></div>
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-[70%] h-1 bg-purple-500/30 blur-md"></div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center p-8 bg-black/60 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-[0_0_30px_rgba(236,72,153,0.2)]">
        <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
        <p className="text-purple-200/80">Please check the profile ID and try again</p>
      </div>
    </div>
  )
}
