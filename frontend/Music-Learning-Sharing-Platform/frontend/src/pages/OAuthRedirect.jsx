"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {api} from "../api" // Assuming api is in "../api"

const OAuthRedirect = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const email = params.get("email")

    if (email) {
      // Store email
      localStorage.setItem("userEmail", email)

      // Fetch user ID and store it
      api
        .get(`/users/email/${email}`)
        .then((res) => {
          if (res.data && res.data.id) {
            localStorage.setItem("userId", res.data.id)
          }
          // Navigate to profile after storing data
          setTimeout(() => {
            navigate("/profile")
          }, 300)
        })
        .catch((err) => {
          console.error("Error fetching user data:", err)
          navigate("/profile")
        })
    } else {
      navigate("/login")
    }
  }, [navigate])

  return <div className="p-4">Redirecting after login...</div>
}

export default OAuthRedirect
