"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getMyProgressUpdates, deleteProgressUpdate } from "../api"
import toast from "react-hot-toast"

const MyProgressUpdates = () => {
  const [progressUpdates, setProgressUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProgressUpdates = async () => {
    setLoading(true)
    try {
      // Log the current user ID from localStorage
      const currentUserId = localStorage.getItem("userId")
      console.log("MyProgressUpdates - Current user ID:", currentUserId)

      const data = await getMyProgressUpdates()
      console.log("MyProgressUpdates - Received data:", data)
      setProgressUpdates(data)
    } catch (error) {
      console.error("Error fetching progress updates:", error)
      toast.error("Failed to load progress updates")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId")
    if (!userId) {
      setError("You must be logged in to view your progress updates")
      setLoading(false)
      return
    }

    fetchProgressUpdates()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this progress update?")) {
      return
    }

    try {
      await deleteProgressUpdate(id)
      toast.success("Progress update deleted successfully")
      setProgressUpdates(progressUpdates.filter((update) => update.id !== id))
    } catch (error) {
      console.error("Error deleting progress update:", error)
      toast.error("Failed to delete progress update")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-t-2 border-green-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-green-400 animate-spin animate-reverse"></div>
          <div className="absolute inset-4 rounded-full border-b-2 border-green-300 animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-600">
              My Progress Updates
            </h1>
          </div>

          <div className="text-center py-12 bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-red-500/20 shadow-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-red-500/50 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-xl font-medium text-red-200">{error}</h3>
            <button
              onClick={() => {
                setError(null)
                fetchProgressUpdates()
              }}
              className="mt-4 px-4 py-2 bg-green-600 rounded-full text-white font-medium hover:bg-green-700 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-600">
            My Progress Updates
          </h1>
          <Link
            to="/create-progress-update"
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-full text-white font-medium hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-green-500/20"
          >
            Share New Progress
          </Link>
        </div>

        {progressUpdates.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-green-500/10 shadow-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-green-500/50 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-medium text-green-200">You haven't shared any progress updates yet</h3>
            <p className="text-green-200/70 mt-2">Share your musical journey and track your progress over time!</p>
            <Link
              to="/create-progress-update"
              className="mt-6 inline-block px-6 py-2.5 bg-gradient-to-r from-green-500 to-teal-600 rounded-full text-white font-medium hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-green-500/20"
            >
              Share Your Progress
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {progressUpdates.map((update) => (
              <div
                key={update.id}
                className="bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-green-500/10 shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-green-500/10 hover:border-green-500/20 hover:-translate-y-1"
              >
                {(update.mediaUrl || (update.mediaUrls && update.mediaUrls.length > 0)) && (
                  <div className="aspect-video bg-black relative">
                    {update.mediaUrl && (update.mediaUrl.endsWith(".mp4") || update.mediaUrl.endsWith(".mov")) ? (
                      <video
                        src={update.mediaUrl}
                        className="w-full h-full object-cover"
                        controls
                        poster="/placeholder.svg?height=200&width=400"
                      />
                    ) : update.mediaUrl ? (
                      <img
                        src={update.mediaUrl || "/placeholder.svg"}
                        alt="Progress update"
                        className="w-full h-full object-cover"
                      />
                    ) : update.mediaUrls && update.mediaUrls.length > 0 ? (
                      <img
                        src={update.mediaUrls[0] || "/placeholder.svg"}
                        alt="Progress update"
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                )}

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-green-300/70">
                        {update.createdAt
                          ? new Date(update.createdAt).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Date not available"}
                      </p>
                      {update.learningPlan && (
                        <Link
                          to={`/learning-plan/${update.learningPlan.id}`}
                          className="inline-block mt-1 px-2 py-0.5 bg-green-500/20 rounded-full text-green-300 text-xs font-medium hover:bg-green-500/30 transition-all duration-300"
                        >
                          {update.learningPlan.title}
                        </Link>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Link
                        to={`/edit-progress-update/${update.id}`}
                        className="text-green-400 hover:text-green-300 transition-colors p-1 rounded-full hover:bg-green-500/10"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(update.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-full hover:bg-red-500/10"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className="text-white mb-4 line-clamp-3">
                    {update.content || update.caption || "No content available"}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-sm text-green-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        {update.likeCount || 0}
                      </div>
                      <div className="flex items-center text-sm text-green-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        {update.commentCount || 0}
                      </div>
                    </div>
                    <Link
                      to={`/progress-update/${update.id}`}
                      className="text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyProgressUpdates
