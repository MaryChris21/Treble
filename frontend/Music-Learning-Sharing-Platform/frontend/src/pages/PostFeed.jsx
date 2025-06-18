"use client"

import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { api } from "../api"
import toast from "react-hot-toast"
import CommentSection from "../components/CommentSection"
import LikeButton from "../components/LikeButton"
import ImageCarousel from "../components/ImageCarousel"
import SearchBar from "../components/SearchBar"
import FilterDropdown from "../components/FilterDropdown"

const PostFeed = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [expandedPost, setExpandedPost] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterOption, setFilterOption] = useState({ value: "newest", label: "Newest" })

  const filterOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "mostLiked", label: "Most Liked" },
    { value: "mostCommented", label: "Most Commented" },
  ]

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    setCurrentUserId(userId)

    if (userId) {
      fetchPostsForUser(userId)
    } else {
      fetchPosts()
    }
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await api.get("/posts")
      setPosts(response.data)
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error("Failed to load posts")
    } finally {
      setLoading(false)
    }
  }

  const fetchPostsForUser = async (userId) => {
    try {
      const response = await api.get(`/posts/for-user/${userId}`)
      setPosts(response.data)
    } catch (error) {
      console.error("Error fetching posts for user:", error)
      toast.error("Failed to load posts")
    } finally {
      setLoading(false)
    }
  }

  const toggleComments = (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null)
    } else {
      setExpandedPost(postId)
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleFilterChange = (option) => {
    setFilterOption(option)
  }

  // Filter and sort posts based on search term and filter option
  const filteredPosts = useMemo(() => {
    // First filter by search term
    let filtered = posts
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = posts.filter(
        (post) =>
          post.caption?.toLowerCase().includes(term) ||
          post.user?.firstName?.toLowerCase().includes(term) ||
          post.user?.lastName?.toLowerCase().includes(term),
      )
    }

    // Then sort based on filter option
    switch (filterOption.value) {
      case "newest":
        return [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      case "oldest":
        return [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      case "mostLiked":
        return [...filtered].sort((a, b) => b.likeCount - a.likeCount)
      case "mostCommented":
        return [...filtered].sort((a, b) => b.commentCount - a.commentCount)
      default:
        return filtered
    }
  }, [posts, searchTerm, filterOption])

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Music Feed
          </h1>
          <Link
            to="/create-post"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/20"
          >
            Create Post
          </Link>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <SearchBar onSearch={handleSearch} placeholder="Search by caption or user name..." className="w-full" />

          <div className="flex justify-end">
            <FilterDropdown
              options={filterOptions}
              selectedOption={filterOption}
              onSelect={handleFilterChange}
              label="Sort by"
            />
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-purple-500/10 shadow-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-purple-500/50 mb-4"
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
            {searchTerm ? (
              <>
                <h3 className="text-xl font-medium text-purple-200">No matching posts found</h3>
                <p className="text-purple-200/70 mt-2">Try a different search term or filter</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-medium text-purple-200">No posts yet</h3>
                <p className="text-purple-200/70 mt-2">Be the first to share your music journey!</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-purple-500/10 shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-purple-500/10 hover:border-purple-500/20 hover:-translate-y-1"
              >
                {/* Post Header */}
                <div className="flex items-center p-4 border-b border-purple-500/10">
                  <Link to={`/profile/${post.userId}`} className="flex items-center group">
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
                      {post.user?.profilePictureUrl ? (
                        <img
                          src={post.user.profilePictureUrl || "/placeholder.svg"}
                          alt={`${post.user.firstName}'s profile`}
                          className="relative w-10 h-10 rounded-full object-cover border-2 border-transparent z-10"
                        />
                      ) : (
                        <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center z-10">
                          <span className="text-lg font-bold text-white">{post.user?.firstName?.charAt(0) || "U"}</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-white group-hover:text-purple-300 transition-colors">
                        {post.user?.firstName} {post.user?.lastName}
                      </p>
                    </div>
                  </Link>

                  {/* Show edit options if current user is the post owner */}
                  {currentUserId && post.userId.toString() === currentUserId.toString() && (
                    <div className="ml-auto">
                      <Link
                        to={`/edit-post/${post.id}`}
                        className="text-purple-400 hover:text-purple-300 transition-colors p-2 rounded-full hover:bg-purple-500/10"
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
                  )}
                </div>

                {/* Post Media - Using the new ImageCarousel component */}
                {post.mediaItems && post.mediaItems.length > 0 && <ImageCarousel mediaItems={post.mediaItems} />}

                {/* Post Caption */}
                <div className="p-5">
                  <p className="text-white mb-4">{post.caption}</p>

                  {/* Like and Comment Actions */}
                  <div className="flex items-center space-x-6">
                    <LikeButton
                      postId={post.id}
                      userId={currentUserId}
                      initialLikeCount={post.likeCount}
                      initialHasLiked={post.hasLiked}
                      isOwner={currentUserId && post.userId.toString() === currentUserId.toString()}
                    />

                    <button
                      onClick={() => toggleComments(post.id)}
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

                  {/* Comments Section (expanded when clicked) */}
                  {expandedPost === post.id && <CommentSection postId={post.id} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PostFeed
