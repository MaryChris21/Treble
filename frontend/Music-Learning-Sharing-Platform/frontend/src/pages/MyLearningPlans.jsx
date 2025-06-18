"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getMyEnrollments, markEnrollmentAsCompleted, unenrollFromLearningPlan } from "../api"
import toast from "react-hot-toast"

const MyLearningPlans = () => {
  const [enrolledPlans, setEnrolledPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId")
    if (!userId) {
      navigate("/login")
      return
    }

    fetchEnrolledPlans()
  }, [navigate])

  const fetchEnrolledPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getMyEnrollments()
      console.log("Enrolled plans:", data)
      setEnrolledPlans(data)
    } catch (error) {
      console.error("Error fetching enrolled learning plans:", error)
      setError("Failed to load your enrolled learning plans. Please try again later.")
      toast.error("Failed to load your learning plans")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsCompleted = async (learningPlanId, learningPlanTitle) => {
    try {
      await markEnrollmentAsCompleted(learningPlanId)
      toast.success("Learning plan marked as completed!")

      // Navigate to create progress update with learning plan info
      navigate("/create-progress-update", {
        state: {
          learningPlanId: learningPlanId,
          learningPlanTitle: learningPlanTitle,
        },
      })
    } catch (error) {
      console.error("Error marking learning plan as completed:", error)
      toast.error("Failed to mark learning plan as completed")
    }
  }

  const handleUnenroll = async (learningPlanId) => {
    if (!window.confirm("Are you sure you want to unenroll from this learning plan?")) {
      return
    }

    try {
      await unenrollFromLearningPlan(learningPlanId)
      toast.success("Successfully unenrolled from learning plan")
      fetchEnrolledPlans() // Refresh the list
    } catch (error) {
      console.error("Error unenrolling from learning plan:", error)
      toast.error("Failed to unenroll from learning plan")
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
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              My Learning Plans
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
              onClick={fetchEnrolledPlans}
              className="mt-4 px-4 py-2 bg-purple-600 rounded-full text-white font-medium hover:bg-purple-700 transition-all duration-300"
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            My Learning Plans
          </h1>
          <p className="text-purple-300/70 mt-2">Track your progress and continue learning</p>
        </div>

        {enrolledPlans.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-purple-500/10 shadow-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-purple-500/50 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="text-xl font-medium text-purple-200">You haven't enrolled in any learning plans yet</h3>
            <p className="text-purple-200/70 mt-2">
              Explore our learning plans and enroll to start improving your skills!
            </p>
            <Link
              to="/learning-plans"
              className="mt-6 inline-block px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-purple-500/20"
            >
              Browse Learning Plans
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledPlans.map((enrollment) => {
              const plan = enrollment.learningPlan
              return (
                <div
                  key={enrollment.id}
                  className="bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-purple-500/10 shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-purple-500/10 hover:border-purple-500/20 hover:-translate-y-1"
                >
                  <div className="aspect-video bg-black relative">
                    {plan.videoFilePath ? (
                      <video
                        src={plan.videoFilePath}
                        className="w-full h-full object-cover"
                        controls
                        poster="/placeholder.svg?height=200&width=400"
                      />
                    ) : plan.videoUrl ? (
                      <iframe
                        src={plan.videoUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 text-purple-500/30"
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

                    {/* Status badge */}
                    <div
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                        enrollment.completed ? "bg-green-500/80 text-white" : "bg-purple-500/80 text-white"
                      }`}
                    >
                      {enrollment.completed ? "Completed" : "In Progress"}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
                    <p className="text-purple-300/70 text-sm mb-2">
                      By {plan.createdBy?.firstName || "Unknown"} • Enrolled on{" "}
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </p>
                    <p className="text-white line-clamp-3 mb-4">{plan.description}</p>

                    <div className="flex flex-col space-y-3">
                      <Link
                        to={`/learning-plan/${plan.id}`}
                        className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
                      >
                        View Details
                      </Link>

                      <div className="flex space-x-2">
                        {!enrollment.completed && (
                          <button
                            onClick={() => handleMarkAsCompleted(plan.id, plan.title)}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full text-white text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300"
                          >
                            Mark as Completed
                          </button>
                        )}
                        <button
                          onClick={() => handleUnenroll(plan.id)}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-white text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300"
                        >
                          Unenroll
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyLearningPlans
