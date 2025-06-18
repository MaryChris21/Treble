"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { api } from "../api"
import ImageCarousel from "./ImageCarousel"

const UserPosts = ({ userId }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    if (!userId) return

    const loggedInUserId = localStorage.getItem("userId")
    setCurrentUserId(loggedInUserId)

    const fetchUserPosts = async () => {
      try {
        // If the viewer is the same as the profile owner, use regular endpoint
        // Otherwise use the endpoint that includes hasLiked info
        const endpoint =
          loggedInUserId && loggedInUserId !== userId
            ? `/posts/user/${userId}/viewer/${loggedInUserId}`
            : `/posts/user/${userId}`

        const response = await api.get(endpoint)
        setPosts(response.data)
      } catch (error) {
        console.error("Error fetching user posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserPosts()
  }, [userId])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-10 h-10 relative">
          <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-purple-400 animate-spin animate-reverse"></div>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-700/30 rounded-xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mx-auto text-purple-400/50 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className="text-xl font-medium text-white">No posts yet</h3>
        <p className="text-purple-300/70 mt-2">Share your music journey with the world!</p>
        <Link
          to="/create-post"
          className="mt-4 inline-block px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-purple-500/20"
        >
          Create Your First Post
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-gray-700/30 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gray-700/50 group"
        >
          {/* Post Media (show first image as thumbnail with carousel) */}
          {post.mediaItems && post.mediaItems.length > 0 && (
            <div className="h-48 overflow-hidden">
              <ImageCarousel mediaItems={post.mediaItems} />
            </div>
          )}

          {/* Post Content */}
          <div className="p-4">
            <p className="text-white line-clamp-2 mb-3 group-hover:text-purple-300 transition-colors">
              {post.caption || "No caption"}
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center text-xs text-purple-300/70 space-x-3">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center text-purple-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
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
                  {post.commentCount}
                </div>
                <div className="flex items-center text-pink-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 mr-1 ${post.hasLiked ? "fill-current" : ""}`}
                    fill={post.hasLiked ? "currentColor" : "none"}
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
                  {post.likeCount}
                </div>
              </div>
              <Link
                to={`/edit-post/${post.id}`}
                className="text-purple-400 hover:text-purple-300 transition-colors p-1 rounded-full hover:bg-purple-500/10"
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
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default UserPosts
