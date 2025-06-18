"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { deleteProgressUpdate } from "../api"
import toast from "react-hot-toast"
import LikeButton from "./LikeButton"
import CommentSection from "./CommentSection"

const ProgressUpdateCard = ({ progressUpdate, onDelete, showEditOptions = true }) => {
  const [showComments, setShowComments] = useState(false)
  const currentUserId = localStorage.getItem("userId")
  const navigate = useNavigate()

  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return "Date not available"
    try {
      const date = new Date(dateString)
      /*if (isNaN(date.getTime())) return "Date not available"
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })*/
    } catch (e) {
      return "Date not available"
    }
  }

  // Get proper media URL with base path
  const getMediaUrl = (url) => {
    if (!url) return null
    if (url.startsWith("http")) return url
    return `http://localhost:9090/api/v1/files/${url}`
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this progress update?")) {
      return
    }

    try {
      await deleteProgressUpdate(progressUpdate.id)
      toast.success("Progress update deleted successfully")
      if (onDelete) {
        onDelete(progressUpdate.id)
      }
    } catch (error) {
      console.error("Error deleting progress update:", error)
      toast.error("Failed to delete progress update")
    }
  }

  const handleEdit = () => {
    navigate(`/edit-progress-update/${progressUpdate.id}`)
  }

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  // Get the correct media URL
  const mediaUrl = getMediaUrl(progressUpdate.mediaUrl)
  const mediaUrls = progressUpdate.mediaUrls ? progressUpdate.mediaUrls.map(getMediaUrl) : []

  // Determine if edit options should be shown
  const shouldShowEditOptions =
    showEditOptions &&
    currentUserId &&
    progressUpdate.userId &&
    progressUpdate.userId.toString() === currentUserId.toString()

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-green-500/10 shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-green-500/10 hover:border-green-500/20 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-green-500/10">
        <Link to={`/profile/${progressUpdate.userId}`} className="flex items-center group">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-teal-500 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
            {progressUpdate.user?.profilePictureUrl ? (
              <img
                src={getMediaUrl(progressUpdate.user.profilePictureUrl) || "/placeholder.svg"}
                alt={`${progressUpdate.user?.firstName || "User"}'s profile`}
                className="relative w-10 h-10 rounded-full object-cover border-2 border-transparent z-10"
              />
            ) : (
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-teal-400 flex items-center justify-center z-10">
                <span className="text-lg font-bold text-white">{progressUpdate.user?.firstName?.charAt(0) || "U"}</span>
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="font-medium text-white group-hover:text-green-300 transition-colors">
              {progressUpdate.user?.firstName || "User"} {progressUpdate.user?.lastName || ""}
            </p>
            <p className="text-xs text-green-300/70">{formatDate(progressUpdate.createdAt)}</p>
          </div>
        </Link>

        {/* Learning Plan Badge */}
        {progressUpdate.learningPlan && (
          <div className="ml-auto mr-2">
            <Link
              to={`/learning-plan/${progressUpdate.learningPlan.id}`}
              className="px-3 py-1 bg-green-500/20 rounded-full text-green-300 text-xs font-medium hover:bg-green-500/30 transition-all duration-300"
            >
              {progressUpdate.learningPlan.title || "Learning Plan"}
            </Link>
          </div>
        )}

        {/* Show edit options if current user is the owner and showEditOptions is true */}
        {shouldShowEditOptions && (
          <div className="flex space-x-1">
            <button
              onClick={handleEdit}
              className="text-green-400 hover:text-green-300 transition-colors p-2 rounded-full hover:bg-green-500/10"
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
            </button>
            <button
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-red-500/10"
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

      {/* Media */}
      {(mediaUrl || (mediaUrls && mediaUrls.length > 0)) && (
        <div className="aspect-video bg-black relative">
          {mediaUrl && (mediaUrl.endsWith(".mp4") || mediaUrl.endsWith(".mov")) ? (
            <video
              src={mediaUrl}
              className="w-full h-full object-contain"
              controls
              poster="/placeholder.svg?height=200&width=400"
              onError={(e) => {
                console.error("Video failed to load:", e)
                e.target.src = "/placeholder.svg?height=200&width=400"
              }}
            />
          ) : mediaUrl ? (
            <img
              src={mediaUrl || "/placeholder.svg"}
              alt="Progress update media"
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error("Image failed to load:", e)
                e.target.src = "/placeholder.svg?height=200&width=400"
              }}
            />
          ) : mediaUrls && mediaUrls.length > 0 ? (
            <img
              src={mediaUrls[0] || "/placeholder.svg"}
              alt="Progress update media"
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error("Image failed to load:", e)
                e.target.src = "/placeholder.svg?height=200&width=400"
              }}
            />
          ) : null}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <p className="text-white mb-4">{progressUpdate.caption || progressUpdate.content || "No content available"}</p>

        {/* Like and Comment Actions */}
        {/* <div className="flex items-center space-x-6">
          <LikeButton
            postId={progressUpdate.id}
            userId={currentUserId}
            initialLikeCount={progressUpdate.likeCount || 0}
            initialHasLiked={progressUpdate.hasLiked || false}
            isProgressUpdate={true}
          />

          <button
            onClick={toggleComments}
            className="flex items-center text-sm text-green-400 hover:text-green-300 transition-colors"
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
            {progressUpdate.commentCount || 0} {progressUpdate.commentCount === 1 ? "comment" : "comments"}
          </button>
        </div> */}

        {/* Comments Section (expanded when clicked) */}
        {showComments && <CommentSection postId={progressUpdate.id} isProgressUpdate={true} />}
      </div>
    </div>
  )
}

export default ProgressUpdateCard
