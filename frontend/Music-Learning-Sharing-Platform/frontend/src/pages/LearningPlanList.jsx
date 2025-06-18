"use client"

import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { api } from "../api"
import toast from "react-hot-toast"
import SearchBar from "../components/SearchBar"
import FilterDropdown from "../components/FilterDropdown"

const LearningPlanList = () => {
  const [learningPlans, setLearningPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState(null)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterOption, setFilterOption] = useState({ value: "newest", label: "Newest" })

  const filterOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "mostEnrolled", label: "Most Enrolled" },
    { value: "alphabetical", label: "A-Z" },
  ]

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    const storedUserId = localStorage.getItem("userId")
    setIsAdmin(userRole === "admin")
    setUserId(storedUserId)

    fetchLearningPlans()
  }, [])

  const fetchLearningPlans = async () => {
    try {
      setLoading(true)
      setError(null)

      const storedUserId = localStorage.getItem("userId")
      const url = storedUserId ? `/learning-plans?userId=${storedUserId}` : "/learning-plans"

      console.log("Fetching learning plans from:", url)
      const response = await api.get(url)
      console.log("Learning plans response:", response.data)
      setLearningPlans(response.data)
    } catch (error) {
      console.error("Error fetching learning plans:", error)
      setError("Failed to load learning plans. Please try again later.")
      toast.error("Failed to load learning plans")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this learning plan? This action cannot be undone.")) {
      return
    }

    try {
      await api.delete(`/learning-plans/${id}?adminId=${userId}`)
      toast.success("Learning plan deleted successfully")
      setLearningPlans(learningPlans.filter((plan) => plan.id !== id))
    } catch (error) {
      console.error("Error deleting learning plan:", error)
      toast.error("Failed to delete learning plan")
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleFilterChange = (option) => {
    setFilterOption(option)
  }

  // Filter and sort learning plans based on search term and filter option
  const filteredPlans = useMemo(() => {
    // First filter by search term
    let filtered = learningPlans
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = learningPlans.filter(
        (plan) =>
          plan.title?.toLowerCase().includes(term) ||
          plan.description?.toLowerCase().includes(term) ||
          plan.createdBy?.firstName?.toLowerCase().includes(term),
      )
    }

    // Then sort based on filter option
    switch (filterOption.value) {
      case "newest":
        return [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      case "oldest":
        return [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      case "mostEnrolled":
        return [...filtered].sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      case "alphabetical":
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title))
      default:
        return filtered
    }
  }, [learningPlans, searchTerm, filterOption])

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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Learning Plans
            </h1>
            {isAdmin && (
              <Link
                to="/create-learning-plan"
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/20"
              >
                Create Learning Plan
              </Link>
            )}
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
              onClick={fetchLearningPlans}
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Learning Plans
          </h1>
          {isAdmin && (
            <Link
              to="/create-learning-plan"
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/20"
            >
              Create Learning Plan
            </Link>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by title, description or creator..."
            className="w-full"
          />

          <div className="flex justify-end">
            <FilterDropdown
              options={filterOptions}
              selectedOption={filterOption}
              onSelect={handleFilterChange}
              label="Sort by"
            />
          </div>
        </div>

        {filteredPlans.length === 0 ? (
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
            {searchTerm ? (
              <>
                <h3 className="text-xl font-medium text-purple-200">No matching learning plans found</h3>
                <p className="text-purple-200/70 mt-2">Try a different search term or filter</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-medium text-purple-200">No learning plans yet</h3>
                {isAdmin ? (
                  <p className="text-purple-200/70 mt-2">
                    Create your first learning plan to help users improve their skills!
                  </p>
                ) : (
                  <p className="text-purple-200/70 mt-2">Check back later for learning resources.</p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
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

                  {/* Enrollment count badge */}
                  <div className="absolute top-2 right-2 bg-purple-500/80 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    {plan.enrollmentCount} {plan.enrollmentCount === 1 ? "student" : "students"}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
                  <p className="text-white line-clamp-3 mb-4">{plan.description}</p>

                  <div className="flex justify-between items-center">
                    <Link
                      to={`/learning-plan/${plan.id}`}
                      className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
                    >
                      View Details
                    </Link>

                    {isAdmin && (
                      <div className="flex space-x-2">
                        <Link
                          to={`/edit-learning-plan/${plan.id}`}
                          className="text-purple-400 hover:text-purple-300 transition-colors p-1 rounded-full hover:bg-purple-500/10"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
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
                          onClick={() => handleDelete(plan.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-full hover:bg-red-500/10"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
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
                    )}
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

export default LearningPlanList
