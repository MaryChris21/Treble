"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"
import toast from "react-hot-toast"

const CreatePost = () => {
  const [caption, setCaption] = useState("")
  const [mediaFiles, setMediaFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Get user ID from localStorage
    const storedUserId = localStorage.getItem("userId")
    if (!storedUserId) {
      toast.error("Please log in to create a post")
      navigate("/login")
      return
    }
    setUserId(storedUserId)
  }, [navigate])

  // Generate previews when files are selected
  useEffect(() => {
    if (!mediaFiles.length) {
      setPreviews([])
      return
    }

    const newPreviews = []
    mediaFiles.forEach((file) => {
      const objectUrl = URL.createObjectURL(file)
      newPreviews.push(objectUrl)
    })

    setPreviews(newPreviews)

    // Free memory when component unmounts
    return () => {
      newPreviews.forEach((preview) => URL.revokeObjectURL(preview))
    }
  }, [mediaFiles])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)

    if (files.length > 3) {
      toast.error("You can only upload up to 3 images")
      return
    }

    // Validate file types
    const validFiles = files.filter((file) => file.type.startsWith("image/"))
    if (validFiles.length !== files.length) {
      toast.error("Only image files are allowed")
      return
    }

    setMediaFiles(validFiles)
  }

  const removeFile = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!mediaFiles.length) {
      toast.error("Please select at least one image")
      return
    }

    if (mediaFiles.length > 3) {
      toast.error("You can only upload up to 3 images")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("userId", userId)
      formData.append("caption", caption)

      mediaFiles.forEach((file) => {
        formData.append("media", file)
      })

      await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast.success("Post created successfully!")
      navigate("/profile")
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error("Failed to create post. Please try again.")
    } finally {
      setLoading(false)
    }
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-glow">Create New Post</h2>
            <p className="text-purple-200/80 text-lg">Share your music journey with the world</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Caption Input */}
            <div>
              <label htmlFor="caption" className="block text-sm font-medium text-purple-200 mb-1 ml-1">
                Caption
              </label>
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-xl text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                rows={4}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1 ml-1">Upload Images (Max 3)</label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-purple-500/30 border-dashed rounded-xl">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-purple-500"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-purple-200">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-black rounded-md font-medium text-purple-400 hover:text-purple-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                    >
                      <span>Upload images</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-purple-200/70">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Image Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="h-40 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !mediaFiles.length}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${
                loading || !mediaFiles.length
                  ? "bg-purple-500/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]"
              }`}
            >
              {loading ? "Creating Post..." : "Create Post"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
