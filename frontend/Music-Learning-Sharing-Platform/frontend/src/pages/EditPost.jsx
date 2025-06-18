"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { api } from "../api"
import toast from "react-hot-toast"
import CommentSection from "../components/CommentSection"
import LikeButton from "../components/LikeButton"
import ImageCarousel from "../components/ImageCarousel"

const EditPost = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [caption, setCaption] = useState("")
  const [mediaFiles, setMediaFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [keepExistingMedia, setKeepExistingMedia] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    setCurrentUserId(userId)

    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}/user/${userId}`)
        setPost(response.data)
        setCaption(response.data.caption || "")

        // Set previews from existing media
        if (response.data.mediaItems && response.data.mediaItems.length > 0) {
          setPreviews(response.data.mediaItems.map((item) => item.mediaUrl))
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching post:", error)
        toast.error("Failed to load post")
        navigate("/profile")
      }
    }

    fetchPost()
  }, [id, navigate])

  // Generate previews when new files are selected
  useEffect(() => {
    if (!mediaFiles.length) {
      if (!keepExistingMedia) {
        setPreviews([])
      }
      return
    }

    // If we're replacing media, clear existing previews
    if (!keepExistingMedia) {
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
    }
  }, [mediaFiles, keepExistingMedia])

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
    setKeepExistingMedia(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!keepExistingMedia && !mediaFiles.length) {
      toast.error("Please select at least one image")
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("caption", caption)

      if (!keepExistingMedia) {
        mediaFiles.forEach((file) => {
          formData.append("media", file)
        })
      }

      await api.put(`/posts/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast.success("Post updated successfully!")
      navigate("/profile")
    } catch (error) {
      console.error("Error updating post:", error)
      toast.error("Failed to update post. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return
    }

    try {
      await api.delete(`/posts/${id}`)
      toast.success("Post deleted successfully")
      navigate("/profile")
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete post")
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
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-glow">Edit Post</h2>
            <p className="text-purple-200/80 text-lg">Update your music journey</p>
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

            {/* Current Images */}
            {keepExistingMedia && post.mediaItems && post.mediaItems.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-purple-200 ml-1">Current Images</label>
                  <button
                    type="button"
                    onClick={() => setKeepExistingMedia(false)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Replace Images
                  </button>
                </div>
                <div className="max-w-md mx-auto">
                  <ImageCarousel mediaItems={post.mediaItems} />
                </div>
              </div>
            )}

            {/* Image Upload (shown when replacing images) */}
            {!keepExistingMedia && (
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1 ml-1">Upload New Images (Max 3)</label>
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

                {/* New Image Previews */}
                {!keepExistingMedia && mediaFiles.length > 0 && (
                  <div className="mt-4 max-w-md mx-auto">
                    <div className="aspect-square bg-black">
                      {mediaFiles.map((file, index) => (
                        <div key={index} className={index === 0 ? "block" : "hidden"}>
                          <img
                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                            alt={`New preview ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                    {mediaFiles.length > 1 && (
                      <div className="flex justify-center mt-2 space-x-2">
                        {mediaFiles.map((_, index) => (
                          <div key={index} className="w-2 h-2 rounded-full bg-white/50" />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Option to keep existing images */}
                {post.mediaItems && post.mediaItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setKeepExistingMedia(true)}
                    className="mt-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Keep existing images instead
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${
                  submitting
                    ? "bg-purple-500/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                }`}
              >
                {submitting ? "Updating..." : "Update Post"}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="py-3 px-4 border border-red-500/30 rounded-xl shadow-sm text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 transition-all duration-300"
              >
                Delete Post
              </button>
            </div>
          </form>

          {/* Post Stats */}
          {post && (
            <div className="mt-8 pt-6 border-t border-purple-500/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Post Stats</h3>
              </div>

              <div className="flex space-x-6 mb-6">
                <div className="flex items-center">
                  <LikeButton
                    postId={post.id}
                    userId={currentUserId}
                    initialLikeCount={post.likeCount}
                    initialHasLiked={post.hasLiked}
                    isOwner={true} // Always true since this is the edit page
                  />
                </div>

                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
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
                  {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
                </button>
              </div>

              {showComments && post && <CommentSection postId={post.id} />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditPost
