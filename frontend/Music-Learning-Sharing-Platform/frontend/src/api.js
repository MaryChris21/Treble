// In src/api.js
import axios from "axios"

export const api = axios.create({
  baseURL: "http://localhost:9090/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.baseURL}${config.url}`, config)
    return config
  },
  (error) => {
    console.error("Request error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.status, response.data)
    return response
  },
  (error) => {
    console.error("Response error:", error.message)
    if (error.response) {
      console.error("Error status:", error.response.status)
      console.error("Error data:", error.response.data)
      console.error("Error headers:", error.response.headers)
    }
    return Promise.reject(error)
  },
)

// Helper function to get proper media URL
export const getMediaUrl = (url) => {
  if (!url) return null
  if (url.startsWith("http")) return url
  return `http://localhost:9090/api/v1/files/${url}`
}

// Helper function to format progress update data
export const formatProgressUpdateData = (update) => {
  if (!update) return update

  // Format media URLs
  if (update.mediaUrl) {
    update.mediaUrl = getMediaUrl(update.mediaUrl)
  }

  // Ensure mediaUrls is always an array and properly formatted
  if (update.mediaUrls) {
    if (!Array.isArray(update.mediaUrls)) {
      update.mediaUrls = [update.mediaUrls]
    }
    update.mediaUrls = update.mediaUrls.map((url) => getMediaUrl(url))
  }

  // If mediaUrls exists but mediaUrl doesn't, set mediaUrl to the first item in mediaUrls
  if (update.mediaUrls && update.mediaUrls.length > 0 && !update.mediaUrl) {
    update.mediaUrl = update.mediaUrls[0]
  }

  // Make sure caption is available (some responses use content instead of caption)
  if (!update.caption && update.content) {
    update.caption = update.content
  }

  return update
}

// Learning Plan API functions
export const getAllLearningPlans = async () => {
  try {
    const response = await api.get("/learning-plans")
    return response.data
  } catch (error) {
    console.error("Failed to fetch learning plans", error)
    throw error
  }
}

export const getLearningPlanById = async (id) => {
  try {
    const response = await api.get(`/learning-plans/${id}`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch learning plan", error)
    throw error
  }
}

export const createLearningPlan = async (learningPlanData, videoFile) => {
  const formData = new FormData()
  formData.append(
    "learningPlan",
    new Blob([JSON.stringify(learningPlanData)], {
      type: "application/json",
    }),
  )

  if (videoFile) {
    formData.append("videoFile", videoFile)
  }

  try {
    const response = await api.post("/learning-plans", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Failed to create learning plan", error)
    throw error
  }
}

export const updateLearningPlan = async (id, learningPlanData, videoFile) => {
  const formData = new FormData()
  formData.append(
    "learningPlan",
    new Blob([JSON.stringify(learningPlanData)], {
      type: "application/json",
    }),
  )

  if (videoFile) {
    formData.append("videoFile", videoFile)
  }

  try {
    const response = await api.put(`/learning-plans/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Failed to update learning plan", error)
    throw error
  }
}

export const deleteLearningPlan = async (id) => {
  try {
    await api.delete(`/learning-plans/${id}`)
    return true
  } catch (error) {
    console.error("Failed to delete learning plan", error)
    throw error
  }
}

// Enrollment API functions
export const getUserEnrollments = async () => {
  try {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      throw new Error("User not logged in")
    }
    const response = await api.get(`/enrollments/my-learning-plans?userId=${userId}`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch user enrollments", error)
    throw error
  }
}

// Alias for getUserEnrollments to match import in MyLearningPlans.jsx
export const getMyEnrollments = getUserEnrollments

export const enrollInLearningPlan = async (learningPlanId) => {
  try {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      throw new Error("User not logged in")
    }
    const response = await api.post(`/enrollments/${learningPlanId}?userId=${userId}`)
    return response.data
  } catch (error) {
    console.error("Failed to enroll in learning plan", error)
    throw error
  }
}

export const unenrollFromLearningPlan = async (learningPlanId) => {
  try {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      throw new Error("User not logged in")
    }
    await api.delete(`/enrollments/${learningPlanId}?userId=${userId}`)
    return true
  } catch (error) {
    console.error("Failed to unenroll from learning plan", error)
    throw error
  }
}

export const markLearningPlanAsCompleted = async (learningPlanId) => {
  try {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      throw new Error("User not logged in")
    }
    const response = await api.put(`/enrollments/${learningPlanId}/complete?userId=${userId}`)
    return response.data
  } catch (error) {
    console.error("Failed to mark learning plan as completed", error)
    throw error
  }
}

// Alias for markLearningPlanAsCompleted to match import in MyLearningPlans.jsx
export const markEnrollmentAsCompleted = markLearningPlanAsCompleted

export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch user", error)
    throw error
  }
}

// Posts API functions
export const getPosts = async () => {
  try {
    const response = await api.get("/posts")
    return response.data.map((post) => {
      if (post.mediaUrls) {
        post.mediaUrls = post.mediaUrls.map((url) => getMediaUrl(url))
      }
      return post
    })
  } catch (error) {
    console.error("Failed to fetch posts", error)
    return [] // Return empty array instead of throwing to prevent feed from breaking
  }
}

export const getPostById = async (id) => {
  try {
    const response = await api.get(`/posts/${id}`)
    const post = response.data
    if (post.mediaUrls) {
      post.mediaUrls = post.mediaUrls.map((url) => getMediaUrl(url))
    }
    return post
  } catch (error) {
    console.error("Failed to fetch post", error)
    throw error
  }
}

export const createPost = async (caption, mediaFiles) => {
  try {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      throw new Error("User not logged in")
    }

    const formData = new FormData()
    formData.append("userId", userId)
    formData.append("caption", caption)

    if (mediaFiles && mediaFiles.length > 0) {
      for (let i = 0; i < mediaFiles.length; i++) {
        formData.append("media", mediaFiles[i])
      }
    }

    const response = await api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Failed to create post", error)
    throw error
  }
}

export const updatePost = async (id, caption, mediaFiles, keepExistingMedia = true) => {
  try {
    const formData = new FormData()
    formData.append("caption", caption)
    formData.append("keepExistingMedia", keepExistingMedia.toString())

    if (mediaFiles && mediaFiles.length > 0) {
      for (let i = 0; i < mediaFiles.length; i++) {
        formData.append("media", mediaFiles[i])
      }
    }

    const response = await api.put(`/posts/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Failed to update post", error)
    throw error
  }
}

export const deletePost = async (id) => {
  try {
    await api.delete(`/posts/${id}`)
    return true
  } catch (error) {
    console.error("Failed to delete post", error)
    throw error
  }
}

// Progress Update API functions
export const createProgressUpdate = async (formData) => {
  try {
    // Don't modify the formData directly - the backend will get the userId from authentication
    const response = await api.post("/progress-updates", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return formatProgressUpdateData(response.data)
  } catch (error) {
    console.error("Failed to create progress update", error)
    throw error
  }
}

export const getProgressUpdates = async () => {
  try {
    const response = await api.get("/progress-updates")
    return response.data.map(formatProgressUpdateData)
  } catch (error) {
    console.error("Failed to fetch progress updates", error)
    return [] // Return empty array instead of throwing to prevent feed from breaking
  }
}

export const getMyProgressUpdates = async () => {
  try {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      throw new Error("User not logged in")
    }
    const response = await api.get(`/progress-updates/my-updates?userId=${userId}`)
    console.log("Progress updates response:", response.data)

    // Format each progress update
    if (Array.isArray(response.data)) {
      return response.data.map(formatProgressUpdateData)
    }

    return response.data
  } catch (error) {
    console.error("Error fetching my progress updates:", error)
    console.error("Error status:", error.response?.status)
    console.error("Error data:", error.response?.data)
    console.error("Error headers:", error.response?.headers)
    throw error
  }
}

export const getUserProgressUpdates = async (userId) => {
  try {
    const response = await api.get(`/progress-updates/user/${userId}`)
    return response.data.map(formatProgressUpdateData)
  } catch (error) {
    console.error("Failed to fetch user progress updates", error)
    return [] // Return empty array instead of throwing
  }
}

export const getProgressUpdateById = async (id) => {
  try {
    const response = await api.get(`/progress-updates/${id}`)
    return formatProgressUpdateData(response.data)
  } catch (error) {
    console.error("Failed to fetch progress update", error)
    throw error
  }
}

export const updateProgressUpdate = async (id, formData) => {
  try {
    // Log the form data for debugging
    console.log("Form data entries:")
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`)
    }

    const response = await api.put(`/progress-updates/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return formatProgressUpdateData(response.data)
  } catch (error) {
    console.error("Failed to update progress update", error)
    throw error
  }
}

export const deleteProgressUpdate = async (id) => {
  try {
    await api.delete(`/progress-updates/${id}`)
    return true
  } catch (error) {
    console.error("Failed to delete progress update", error)
    throw error
  }
}
