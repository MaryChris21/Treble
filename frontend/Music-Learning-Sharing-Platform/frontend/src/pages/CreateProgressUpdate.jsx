"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { createProgressUpdate, getAllLearningPlans } from "../api"
import toast from "react-hot-toast"

const CreateProgressUpdate = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [content, setContent] = useState("")
  const [media, setMedia] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [learningPlanId, setLearningPlanId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [learningPlans, setLearningPlans] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch learning plans and check for user login
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId")
    if (!storedUserId) {
      toast.error("Please log in to create a progress update")
      navigate("/login")
      return
    }

    // Set learning plan ID from navigation state if available
    if (location.state && location.state.learningPlanId) {
      setLearningPlanId(location.state.learningPlanId)
    }

    // Fetch available learning plans
    const fetchLearningPlans = async () => {
      try {
        setLoading(true)
        const plans = await getAllLearningPlans()
        setLearningPlans(plans)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching learning plans:", error)
        toast.error("Failed to load learning plans")
        setLoading(false)
      }
    }

    fetchLearningPlans()
  }, [location, navigate])

  const handleMediaChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setMedia(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setMediaPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.error("Please enter some content for your progress update")
      return
    }

    if (!learningPlanId) {
      toast.error("Please select a learning plan")
      return
    }

    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("content", content)
      formData.append("learningPlanId", learningPlanId)

      if (media) {
        formData.append("media", media)
      }

      await createProgressUpdate(formData)
      toast.success("Progress update created successfully!")
      navigate("/my-progress-updates")
    } catch (error) {
      console.error("Error creating progress update:", error)
      toast.error("Failed to create progress update. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-600 mb-8">
          Share Your Progress
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
              What progress have you made?
            </label>
            <textarea
              id="content"
              rows={5}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Share details about your progress..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="learningPlanId" className="block text-sm font-medium text-gray-300 mb-2">
              Learning Plan
            </label>
            {loading ? (
              <div className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400">
                Loading learning plans...
              </div>
            ) : learningPlans.length > 0 ? (
              <select
                id="learningPlanId"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                value={learningPlanId}
                onChange={(e) => setLearningPlanId(e.target.value)}
                required
              >
                <option value="">Select a learning plan</option>
                {learningPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.title}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  id="learningPlanId"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter learning plan ID"
                  value={learningPlanId}
                  onChange={(e) => setLearningPlanId(e.target.value)}
                  required
                />
                <p className="text-yellow-400 text-sm">
                  No learning plans found. Please enter a learning plan ID manually.
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="media" className="block text-sm font-medium text-gray-300 mb-2">
              Add Media (Optional)
            </label>
            <input
              type="file"
              id="media"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
            />
            {mediaPreview && (
              <div className="mt-4 relative">
                {media.type.startsWith("image/") ? (
                  <img src={mediaPreview || "/placeholder.svg"} alt="Preview" className="max-h-64 rounded-lg mx-auto" />
                ) : (
                  <video src={mediaPreview} controls className="max-h-64 w-full rounded-lg" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMedia(null)
                    setMediaPreview(null)
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-gray-700 rounded-full text-white font-medium hover:bg-gray-600 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 bg-gradient-to-r from-green-500 to-teal-600 rounded-full text-white font-medium hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-green-500/20 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Sharing..." : "Share Progress"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProgressUpdate
