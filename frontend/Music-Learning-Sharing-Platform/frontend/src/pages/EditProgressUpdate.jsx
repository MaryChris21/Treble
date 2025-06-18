"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getProgressUpdateById, updateProgressUpdate, getAllLearningPlans } from "../api"
import toast from "react-hot-toast"

const EditProgressUpdate = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [content, setContent] = useState("")
  const [media, setMedia] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [existingMediaUrl, setExistingMediaUrl] = useState(null)
  const [learningPlanId, setLearningPlanId] = useState("")
  const [learningPlans, setLearningPlans] = useState([])
  const [learningPlanTitle, setLearningPlanTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch learning plans
        const plans = await getAllLearningPlans()
        setLearningPlans(plans)

        // Fetch progress update
        const progressUpdate = await getProgressUpdateById(id)
        console.log("Fetched progress update:", progressUpdate)

        // Set content from either content or caption field
        setContent(progressUpdate.content || progressUpdate.caption || "")

        // Handle learning plan
        if (progressUpdate.learningPlan && progressUpdate.learningPlan.id) {
          setLearningPlanId(progressUpdate.learningPlan.id)
          setLearningPlanTitle(progressUpdate.learningPlan.title)
        } else if (progressUpdate.learningPlanId) {
          setLearningPlanId(progressUpdate.learningPlanId)

          // Find learning plan title from the fetched plans
          const plan = plans.find((p) => p.id === progressUpdate.learningPlanId)
          if (plan) {
            setLearningPlanTitle(plan.title)
          }
        }

        // Handle media
        if (progressUpdate.mediaUrls && progressUpdate.mediaUrls.length > 0) {
          setExistingMediaUrl(progressUpdate.mediaUrls[0])
        } else if (progressUpdate.mediaUrl) {
          setExistingMediaUrl(progressUpdate.mediaUrl)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load progress update")
        setIsLoading(false)
        navigate("/my-progress-updates")
      }
    }

    fetchData()
  }, [id, navigate])

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

    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("content", content)

      // Only append learningPlanId if it exists
      if (learningPlanId) {
        formData.append("learningPlanId", learningPlanId.toString())
      }

      // If new media is selected, add it to formData
      if (media) {
        formData.append("media", media)
        // If replacing media, don't keep existing
        formData.append("keepExistingMedia", "false")
      } else {
        // Keep existing media if no new media is uploaded
        formData.append("keepExistingMedia", "true")
      }

      console.log("Submitting form data:", {
        content,
        learningPlanId,
        hasNewMedia: !!media,
        keepExistingMedia: !media,
      })

      await updateProgressUpdate(id, formData)
      toast.success("Progress update updated successfully!")
      navigate("/my-progress-updates")
    } catch (error) {
      console.error("Error updating progress update:", error)
      toast.error("Failed to update progress update. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-600 mb-8">
          Edit Progress Update
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
            <select
              id="learningPlanId"
              value={learningPlanId || ""}
              onChange={(e) => setLearningPlanId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
              disabled={true} // Disable changing learning plan
            >
              <option value="">None</option>
              {learningPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Learning plan cannot be changed after creation</p>
          </div>

          <div>
            <label htmlFor="media" className="block text-sm font-medium text-gray-300 mb-2">
              Media (Optional)
            </label>
            <input
              type="file"
              id="media"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
            />

            {/* Show new media preview if available */}
            {mediaPreview && (
              <div className="mt-4 relative">
                {media.type.startsWith("image/") ? (
                  <img
                    src={mediaPreview || "/placeholder.svg"}
                    alt="Preview"
                    className="max-h-64 rounded-lg mx-auto"
                    onError={(e) => {
                      console.error("Error loading preview image")
                      e.target.src = "/placeholder.svg?height=200&width=300"
                    }}
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    controls
                    className="max-h-64 w-full rounded-lg"
                    onError={(e) => {
                      console.error("Error loading preview video")
                      e.target.style.display = "none"
                    }}
                  />
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

            {/* Show existing media if no new media is selected */}
            {!mediaPreview && existingMediaUrl && (
              <div className="mt-4 relative">
                {existingMediaUrl.includes(".mp4") || existingMediaUrl.includes(".webm") ? (
                  <video
                    src={existingMediaUrl}
                    controls
                    className="max-h-64 w-full rounded-lg"
                    onError={(e) => {
                      console.error("Error loading existing video:", existingMediaUrl)
                      e.target.style.display = "none"
                    }}
                  />
                ) : (
                  <img
                    src={existingMediaUrl || "/placeholder.svg"}
                    alt="Current media"
                    className="max-h-64 rounded-lg mx-auto"
                    onError={(e) => {
                      console.error("Error loading existing image:", existingMediaUrl)
                      e.target.src = "/placeholder.svg?height=200&width=300"
                    }}
                  />
                )}
                <p className="text-xs text-gray-400 mt-1">Current media (upload a new file to replace)</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/my-progress")}
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
              {isSubmitting ? "Updating..." : "Update Progress"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProgressUpdate
