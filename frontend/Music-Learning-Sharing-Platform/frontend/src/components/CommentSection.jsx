"use client"

import { useState, useEffect } from "react"
import { api } from "../api"
import toast from "react-hot-toast"
import CommentForm from "./CommentForm"
import CommentItem from "./CommentItem"

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [showAllComments, setShowAllComments] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    setCurrentUserId(userId)

    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments/post/${postId}`)
      setComments(response.data)
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = (newComment) => {
    setComments([...comments, newComment])
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}/user/${currentUserId}`)
      setComments(comments.filter((comment) => comment.id !== commentId))
      toast.success("Comment deleted successfully")
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast.error("Failed to delete comment")
    }
  }

  const handleUpdateComment = (updatedComment) => {
    setComments(comments.map((comment) => (comment.id === updatedComment.id ? updatedComment : comment)))
  }

  // Display only the first 3 comments if there are more than 3 and showAllComments is false
  const displayedComments = showAllComments ? comments : comments.length > 3 ? comments.slice(0, 3) : comments

  if (loading) {
    return (
      <div className="py-2">
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-purple-100/10 rounded"></div>
          <div className="h-10 bg-purple-100/10 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 border-t border-purple-500/10 pt-4">
      <h4 className="text-sm font-medium text-purple-300 mb-3">Comments ({comments.length})</h4>

      {/* Comment Form */}
      {currentUserId && <CommentForm postId={postId} userId={currentUserId} onCommentAdded={handleAddComment} />}

      {/* Comments List */}
      <div className="space-y-3 mt-4">
        {displayedComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            onDelete={handleDeleteComment}
            onUpdate={handleUpdateComment}
          />
        ))}
      </div>

      {/* Show more/less comments button */}
      {comments.length > 3 && (
        <button
          onClick={() => setShowAllComments(!showAllComments)}
          className="text-sm text-purple-400 hover:text-purple-300 mt-3 transition-colors"
        >
          {showAllComments ? "Show less comments" : `Show all ${comments.length} comments`}
        </button>
      )}

      {comments.length === 0 && (
        <p className="text-sm text-purple-300/50 italic mt-3">No comments yet. Be the first to comment!</p>
      )}
    </div>
  )
}

export default CommentSection
