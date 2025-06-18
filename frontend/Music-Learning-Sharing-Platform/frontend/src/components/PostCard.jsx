"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../api"
import toast from "react-hot-toast"

const PostCard = ({ post, onDelete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const navigate = useNavigate()
  const loggedInUserId = localStorage.getItem("userId")
  const isOwner = loggedInUserId && post.userId.toString() === loggedInUserId.toString()
  
  const handlePrevImage = (e) => {
    e.stopPropagation()
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }
  
  const handleNextImage = (e) => {
    e.stopPropagation()
    if (currentImageIndex < post.media.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }
  
  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${post.id}`)
      toast.success("Post deleted successfully")
      if (onDelete) {
        onDelete(post.id)
      }
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete post")
    }
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden shadow-lg hover:shadow-purple-500/10 transition-shadow duration-300">
      {/* Post header */}
      <div className="flex items-center p-4">
        <Link to={`/profile/${post.userId}`} className="flex items-center">
          {post.user?.profilePictureUrl ? (
            <img 
              src={post.user.profilePictureUrl || "/placeholder.svg"} 
              alt={post.user?.firstName} 
              className="w-10 h-10 rounded-full object-cover border border-purple-500/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center border border-purple-500/30">
              <span className="text-lg font-bold text-purple-600">
                {post.user?.firstName?.charAt(0) || "U"}
              </span>
            </div>
          )}
          <div className="ml-3">
            <p className="text-white font-medium">
              {post.user?.firstName} {post.user?.lastName}
            </p>
            <p className="text-purple-300 text-xs">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </Link>
        
        {isOwner && (
          <div className="ml-auto relative">
            <button 
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="text-purple-300 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>
            
            {showDeleteConfirm && (
              <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-purple-500/30 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <button 
                    onClick={() => navigate(`/edit-post/${post.id}`)}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-purple-500/20 rounded-md transition-colors"
                  >
                    Edit Post
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                  >
                    Delete Post
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Post image carousel */}
      <div className="relative">
        <div className="aspect-w-1 aspect-h-1 w-full">
          <img 
            src={post.media[currentImageIndex]?.mediaUrl || "/placeholder.svg"} 
            alt={`Post ${post.id} image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Image navigation dots */}
        {post.media.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {post.media.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImageIndex(index)
                }}
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Left/Right navigation arrows */}
        {post.media.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              disabled={currentImageIndex === 0}
              className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-1 ${
                currentImageIndex === 0 ? "opacity-30 cursor-not-allowed" : "opacity-70 hover:opacity-100"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleNextImage}
              disabled={currentImageIndex === post.media.length - 1}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-1 ${
                currentImageIndex === post.media.length - 1 ? "opacity-30 cursor-not-allowed" : "opacity-70 hover:opacity-100"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
      
      {/* Post caption */}
      <div className="p-4">
        <p className="text-white">
          <span className="font-medium">{post.user?.firstName} </span>
          {post.caption}
        </p>
      </div>
    </div>
  )
}

export default PostCard
