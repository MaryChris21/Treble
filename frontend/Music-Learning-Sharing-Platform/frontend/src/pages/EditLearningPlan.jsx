"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { api } from "../api"
import toast from "react-hot-toast"

const EditLearningPlan = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [learningPlan, setLearningPlan] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId")
    const userRole = localStorage.getItem("userRole")

    if (!storedUserId) {
      toast.error("Please log in to edit a learning plan")
      navigate("/login")
      return
    }

    if (userRole !== "admin") {
      toast.error("Only admins can edit learning plans")
      navigate("/learning-plans")
      return
    }

    setUserId(storedUserId)
    setIsAdmin(userRole === "admin")

    const fetchLearningPlan = async () => {
      try {
        const response = await api.get(`/learning-plans/${id}`)
        const plan = response.data
        setLearningPlan(plan)
        setTitle(plan.title || "")
        setDescription(plan.description || "")
        setVideoUrl(plan.videoUrl || "")

        if (plan.videoFilePath) {
          setVideoPreview(plan.videoFilePath)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching learning plan:", error)
        toast.error("Failed to load learning plan")
        navigate("/learning-plans")
      }
    }

    fetchLearningPlan()
  }, [id, navigate])

  // Generate preview when file is selected
  useEffect(() => {
    if (!videoFile) {
      return
    }

    const objectUrl = URL.createObjectURL(videoFile)
    setVideoPreview(objectUrl)

    // Free memory when component unmounts
    return () => URL.revokeObjectURL(objectUrl)
  }, [videoFile])

  const handleFileChange = (e) => {
    const file = e.target.files[0]

    if (!file) {
      return
    }

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Only video files are allowed")
      return
    }

    setVideoFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Title is required")
      return
    }

    if (!description.trim()) {
      toast.error("Description is required")
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("adminId", userId)
      formData.append("title", title)
      formData.append("description", description)

      if (videoUrl) {
        formData.append("videoUrl", videoUrl)
      }

      if (videoFile) {
        formData.append("videoFile", videoFile)
      }

      await api.put(`/learning-plans/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast.success("Learning plan updated successfully!")
      navigate("/learning-plans")
    } catch (error) {
      console.error("Error updating learning plan:", error)
      toast.error(error.response?.data?.message || "Failed to update learning plan. Please try again.")
    } finally {
      setSubmitting(false)
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center p-8 bg-black/60 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-[0_0_30px_rgba(236,72,153,0.2)]">
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-purple-200/80">Only admins can edit learning plans</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-[0_0_30px_rgba(236,72,153,0.2)] p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 blur opacity-70 animate-pulse"></div>
                <div className="relative bg-black rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-purple-500"
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
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-glow">Edit Learning Plan</h2>
            <p className="text-purple-200/80 text-lg">Update your learning materials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-purple-200 mb-1 ml-1">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your learning plan"
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-xl text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>

            {/* Description Input */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-purple-200 mb-1 ml-1">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed instructions for this learning plan"
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-xl text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                rows={6}
                required
              />
            </div>

            {/* Video URL Input */}
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-purple-200 mb-1 ml-1">
                Video URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-500/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 010-7.072m12.728 0l-3.536 3.536m-9.192 0l3.536-3.536"
                    />
                  </svg>
                </div>
                <input
                  id="videoUrl"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-purple-500/30 rounded-xl text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              <p className="text-xs text-purple-200/50 mt-1 ml-1">
                Enter a URL to a video (YouTube, Vimeo, or direct video link)
              </p>
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1 ml-1">Upload New Video File</label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-purple-500/30 border-dashed rounded-xl">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-purple-500"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 4v16M17 4v16M3 8h18M3 16h18"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                  </svg>
                  <div className="flex text-sm text-purple-200">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-black rounded-md font-medium text-purple-400 hover:text-purple-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                    >
                      <span>Upload a video</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="video/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-purple-200/70">MP4, WebM, MOV up to 100MB</p>
                </div>
              </div>
            </div>

            {/* Current Video Preview */}
            {videoPreview && !videoFile && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-purple-200 mb-2">Current Video</label>
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                  <video src={videoPreview} controls className="w-full h-full" />
                </div>
              </div>
            )}

            {/* New Video Preview */}
            {videoFile && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-purple-200 mb-2">New Video Preview</label>
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                  <video src={URL.createObjectURL(videoFile)} controls className="w-full h-full" />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting || !title.trim() || !description.trim()}
                className={`flex-1 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${
                  submitting || !title.trim() || !description.trim()
                    ? "bg-purple-500/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                }`}
              >
                {submitting ? "Updating..." : "Update Learning Plan"}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="py-3 px-4 border border-red-500/30 rounded-xl shadow-sm text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 transition-all duration-300"
              >
                Delete Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditLearningPlan
