"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { api } from "../api"
import toast from "react-hot-toast"

const LearningPlanDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [learningPlan, setLearningPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState(null)
  const [enrolling, setEnrolling] = useState(false)
  const [unenrolling, setUnenrolling] = useState(false)

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    const storedUserId = localStorage.getItem("userId")
    setIsAdmin(userRole === "admin")
    setUserId(storedUserId)

    fetchLearningPlan()
  }, [id])

  const fetchLearningPlan = async () => {
    try {
      setLoading(true)
      setError(null)

      const storedUserId = localStorage.getItem("userId")
      const url = storedUserId ? `/learning-plans/${id}?userId=${storedUserId}` : `/learning-plans/${id}`

      const response = await api.get(url)
      setLearningPlan(response.data)
    } catch (error) {
      console.error("Error fetching learning plan:", error)
      setError("Failed to load learning plan. Please try again later.")
      toast.error("Failed to load learning plan")
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    try {
      setEnrolling(true)
      await api.post(`/enrollments/${id}?userId=${userId}`)
      toast.success("Successfully enrolled in learning plan")
      fetchLearningPlan() // Refresh to update enrollment status
    } catch (error) {
      console.error("Error enrolling in learning plan:", error)
      toast.error(error.response?.data?.message || "Failed to enroll in learning plan")
    } finally {
      setEnrolling(false)
    }
  }

  const handleUnenroll = async () => {
    if (!window.confirm("Are you sure you want to unenroll from this learning plan?")) {
      return
    }

    try {
      setUnenrolling(true)
      await api.delete(`/enrollments/${id}?userId=${userId}`)
      toast.success("Successfully unenrolled from learning plan")
      fetchLearningPlan() // Refresh to update enrollment status
    } catch (error) {
      console.error("Error unenrolling from learning plan:", error)
      toast.error("Failed to unenroll from learning plan")
    } finally {
      setUnenrolling(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this learning plan? This action cannot be undone.")) {
      return
    }

    try {
      await api.delete(`/learning-plans/${id}?adminId=${userId}`)
      toast.success("Learning plan deleted successfully")
      navigate("/learning-plans")
    } catch (error) {
      console.error("Error deleting learning plan:", error)
      toast.error("Failed to delete learning plan")
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
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
              onClick={fetchLearningPlan}
              className="mt-4 px-4 py-2 bg-purple-600 rounded-full text-white font-medium hover:bg-purple-700 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!learningPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <div className="text-center py-12 bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-purple-500/10 shadow-xl">
            <h3 className="text-xl font-medium text-purple-200">Learning plan not found</h3>
            <Link
              to="/learning-plans"
              className="mt-4 inline-block px-4 py-2 bg-purple-600 rounded-full text-white font-medium hover:bg-purple-700 transition-all duration-300"
            >
              Back to Learning Plans
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              to="/learning-plans"
              className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Learning Plans
            </Link>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mt-2">
              {learningPlan.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {isAdmin ? (
              <>
                <Link
                  to={`/edit-learning-plan/${learningPlan.id}`}
                  className="px-4 py-2 bg-purple-600 rounded-full text-white font-medium hover:bg-purple-700 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 rounded-full text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                {learningPlan.userEnrolled ? (
                  <button
                    onClick={handleUnenroll}
                    disabled={unenrolling}
                    className={`px-4 py-2 bg-red-600 rounded-full text-white font-medium hover:bg-red-700 transition-colors ${
                      unenrolling ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {unenrolling ? "Unenrolling..." : "Unenroll"}
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling || isAdmin}
                    className={`px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white font-medium hover:from-purple-600 hover:to-purple-700 transition-colors ${
                      enrolling || isAdmin ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {enrolling ? "Enrolling..." : "Enroll Now"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-purple-500/10 shadow-xl overflow-hidden mb-8">
          <div className="aspect-video bg-black relative">
            {learningPlan.videoFilePath ? (
              <video
                src={learningPlan.videoFilePath}
                className="w-full h-full object-contain"
                controls
                poster="/placeholder.svg?height=400&width=800"
              ></video>
            ) : learningPlan.videoUrl ? (
              <iframe
                src={learningPlan.videoUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 text-purple-500/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-purple-500/10 shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4">Learning Instructions</h2>
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-line">{learningPlan.description}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-purple-500/10 shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4">Details</h2>

              <div className="space-y-4">
              
                <div>
                  <p className="text-gray-400 text-sm">Enrollments</p>
                  <p className="font-medium">{learningPlan.enrollmentCount} students</p>
                </div>

                {!isAdmin && !learningPlan.userEnrolled && (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className={`w-full mt-4 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white font-medium hover:from-purple-600 hover:to-purple-700 transition-colors ${
                      enrolling ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {enrolling ? "Enrolling..." : "Enroll Now"}
                  </button>
                )}

                {!isAdmin && learningPlan.userEnrolled && (
                  <div className="mt-4 p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-purple-400 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-purple-300 font-medium">You're enrolled</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearningPlanDetail
