"use client"

import { useState } from "react"
import { api } from "../api"
import toast from "react-hot-toast"

const CommentForm = ({ postId, userId, onCommentAdded }) => {
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.error("Comment cannot be empty")
      return
    }

    setSubmitting(true)

    try {
      const response = await api.post(`/comments/post/${postId}/user/${userId}`, {
        content: content.trim(),
      })

      onCommentAdded(response.data)
      setContent("")
      toast.success("Comment added successfully")
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-2">
      <div className="flex-grow">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="w-full px-3 py-2 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/70 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm resize-none"
          rows={1}
          maxLength={1000}
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className={`px-4 py-2 rounded-lg text-sm font-medium ${
          submitting || !content.trim()
            ? "bg-purple-500/30 text-purple-200/50 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
        }`}
      >
        {submitting ? "Posting..." : "Post"}
      </button>
    </form>
  )
}

export default CommentForm
