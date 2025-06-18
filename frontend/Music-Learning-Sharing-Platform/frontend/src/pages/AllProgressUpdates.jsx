"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getProgressUpdates } from "../api"
import toast from "react-hot-toast"
import ProgressUpdateCard from "../components/ProgressUpdateCard"
import SearchBar from "../components/SearchBar"
import FilterDropdown from "../components/FilterDropdown"

const AllProgressUpdates = () => {
  const [progressUpdates, setProgressUpdates] = useState([])
  const [filteredUpdates, setFilteredUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState({ value: "newest", label: "Newest" })

  const filterOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "mostLiked", label: "Most Liked" },
    { value: "mostCommented", label: "Most Commented" },
  ]

  useEffect(() => {
    fetchProgressUpdates()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [progressUpdates, searchTerm, selectedFilter])

  const fetchProgressUpdates = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProgressUpdates()
      setProgressUpdates(data || [])
    } catch (err) {
      console.error("Error fetching progress updates:", err)
      setError("Failed to load progress updates. Please try again later.")
      toast.error("Failed to load progress updates")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...progressUpdates]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (update) =>
          (update.caption && update.caption.toLowerCase().includes(term)) ||
          (update.content && update.content.toLowerCase().includes(term)) ||
          (update.user && update.user.name && update.user.name.toLowerCase().includes(term)) ||
          (update.learningPlan && update.learningPlan.title && update.learningPlan.title.toLowerCase().includes(term)),
      )
    }

    // Apply sorting filter
    switch (selectedFilter.value) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
      case "mostLiked":
        filtered.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
        break
      case "mostCommented":
        filtered.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0))
        break
      default:
        break
    }

    setFilteredUpdates(filtered)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleFilterChange = (option) => {
    setSelectedFilter(option)
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
              Community Progress Updates
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
              onClick={fetchProgressUpdates}
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
            Community Progress Updates
          </h1>
          <Link
            to="/my-progress-updates"
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-full text-white font-medium hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-green-500/20"
          >
            My Progress
          </Link>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <SearchBar onSearch={handleSearch} placeholder="Search progress updates..." className="flex-grow" />
          
        </div>

        {filteredUpdates.length === 0 ? (
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
            {searchTerm ? (
              <>
                <h3 className="text-xl font-medium text-green-200">No matching progress updates found</h3>
                <p className="text-green-200/70 mt-2">Try adjusting your search or filters</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-medium text-green-200">No progress updates available</h3>
                <p className="text-green-200/70 mt-2">Be the first to share your musical journey!</p>
              </>
            )}
            <Link
              to="/create-progress-update"
              className="mt-6 inline-block px-6 py-2.5 bg-gradient-to-r from-green-500 to-teal-600 rounded-full text-white font-medium hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-green-500/20"
            >
              Share Your Progress
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredUpdates.map((update) => (
              <ProgressUpdateCard
                key={update.id}
                progressUpdate={update}
                showEditOptions={false} // Don't show edit options for other users' updates
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AllProgressUpdates
