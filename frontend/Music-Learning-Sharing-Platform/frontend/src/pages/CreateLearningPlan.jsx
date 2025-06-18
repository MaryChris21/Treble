"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"
import toast from "react-hot-toast"

const CreateLearningPlan = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setVideoFile(file)
      setVideoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (!description.trim()) {
      setError("Description is required")
      return
    }

    if (!videoUrl && !videoFile) {
      setError("Either a video URL or a video file is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      const adminId = localStorage.getItem("userId")

      const formData = new FormData()
      formData.append("adminId", adminId)
      formData.append("title", title)
      formData.append("description", description)

      if (videoUrl) {
        formData.append("videoUrl", videoUrl)
      }

      if (videoFile) {
        formData.append("videoFile", videoFile)
      }

      await api.post("/learning-plans", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast.success("Learning plan created successfully")
      navigate("/learning-plans")
    } catch (error) {
      console.error("Error creating learning plan:", error)
      setError(error.response?.data?.message || "Failed to create learning plan")
      toast.error("Failed to create learning plan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Create Learning Plan
          </h1>
          <p className="text-gray-400 mt-2">Create a new learning plan to help users improve their music skills</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter a title for your learning plan"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Provide detailed instructions for this learning plan"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-300">
              Video URL (Optional)
            </label>
            <input
              type="url"
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter a URL for an external video (YouTube, Vimeo, etc.)"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="videoFile" className="block text-sm font-medium text-gray-300">
              Upload Video (Optional)
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="videoFile"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-800/30 border-gray-600 hover:border-purple-500/50"
              >
                {videoPreview ? (
                  <video src={videoPreview} controls className="w-full h-full object-contain"></video>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-10 h-10 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      ></path>
                    </svg>
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">MP4, WebM, or Ogg (MAX. 100MB)</p>
                  </div>
                )}
                <input
                  id="videoFile"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoFileChange}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/learning-plans")}
              className="px-6 py-3 bg-gray-700 rounded-lg text-white font-medium hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                "Create Learning Plan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateLearningPlan
