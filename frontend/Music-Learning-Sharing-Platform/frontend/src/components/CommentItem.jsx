"use client"

import { useState } from "react"
import { api } from "../api"
import toast from "react-hot-toast"

const CommentItem = ({ comment, currentUserId, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [submitting, setSubmitting] = useState(false)

  const isOwner = currentUserId && comment.userId.toString() === currentUserId.toString()

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return (
      date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
      " at " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  }

  const handleUpdate = async () => {
    if (!editContent.trim()) {
      toast.error("Comment cannot be empty")
      return
    }

    setSubmitting(true)

    try {
      const response = await api.put(`/comments/${comment.id}/user/${currentUserId}`, {
        content: editContent.trim(),
      })

      onUpdate(response.data)
      setIsEditing(false)
      toast.success("Comment updated successfully")
    } catch (error) {
      console.error("Error updating comment:", error)
      toast.error("Failed to update comment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      onDelete(comment.id)
    }
  }

  // Update the styling of the comment item to match the new design:
  return (
    <div className="bg-gray-700/30 rounded-lg p-3 transition-all duration-300 hover:bg-gray-700/50">
      <div className="flex items-start space-x-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {comment.user?.profilePictureUrl ? (
            <img
              src={comment.user.profilePictureUrl || "/placeholder.svg"}
              alt={`${comment.user.firstName}'s profile`}
              className="w-8 h-8 rounded-full object-cover border border-purple-500/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center border border-purple-500/30">
              <span className="text-sm font-bold text-white">{comment.user?.firstName?.charAt(0) || "U"}</span>
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-white">
              {comment.user?.firstName} {comment.user?.lastName}
            </h5>
            <span className="text-xs text-purple-300/50">{formatDate(comment.createdAt)}</span>
          </div>

          {isEditing ? (
            <div className="mt-1">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-200/50 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm resize-none"
                rows={2}
                maxLength={1000}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs rounded-md border border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={submitting || !editContent.trim()}
                  className={`px-3 py-1 text-xs rounded-md ${
                    submitting || !editContent.trim()
                      ? "bg-purple-500/30 text-purple-200/50 cursor-not-allowed"
                      : "bg-purple-500 text-white hover:bg-purple-600"
                  }`}
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-purple-100 mt-1">{comment.content}</p>
          )}
        </div>
      </div>

      {/* Comment Actions */}
      {isOwner && !isEditing && (
        <div className="flex justify-end space-x-2 mt-1">
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Edit
          </button>
          <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300 transition-colors">
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default CommentItem
