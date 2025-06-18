"use client"

import { useState } from "react"
import { api } from "../api"
import toast from "react-hot-toast"

const LikeButton = ({ postId, userId, initialLikeCount, initialHasLiked, isOwner }) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount || 0)
  const [hasLiked, setHasLiked] = useState(initialHasLiked || false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLikeToggle = async () => {
    if (!userId) {
      toast.error("Please log in to like posts")
      return
    }

    if (isOwner) {
      toast.error("You cannot like your own post")
      return
    }

    setIsLoading(true)

    try {
      if (hasLiked) {
        // Unlike post
        await api.delete(`/likes/post/${postId}/user/${userId}`)
        setLikeCount((prev) => prev - 1)
        setHasLiked(false)
      } else {
        // Like post
        await api.post(`/likes/post/${postId}/user/${userId}`)
        setLikeCount((prev) => prev + 1)
        setHasLiked(true)
      }
    } catch (error) {
      console.error("Error toggling like:", error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error(hasLiked ? "Failed to unlike post" : "Failed to like post")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLikeToggle}
      disabled={isLoading || isOwner}
      className={`flex items-center text-sm transition-all duration-300 ${
        isOwner
          ? "text-purple-400/50 cursor-not-allowed"
          : hasLiked
            ? "text-pink-500 hover:text-pink-600"
            : "text-purple-400 hover:text-purple-300"
      }`}
    >
      {hasLiked ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 fill-current" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
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
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
      {likeCount} {likeCount === 1 ? "like" : "likes"}
    </button>
  )
}

export default LikeButton
