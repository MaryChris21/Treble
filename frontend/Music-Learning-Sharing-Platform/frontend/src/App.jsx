"use client"

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import EditProfile from "./pages/EditProfile"
import UsersList from "./pages/UserList"
import Navbar from "./components/Navbar"
import UserProfile from "./pages/UserProfile"
import OAuthRedirect from "./pages/OAuthRedirect"
import CompleteProfile from "./pages/CompleteProfile"
import CreatePost from "./pages/CreatePost"
import EditPost from "./pages/EditPost"
import PostFeed from "./pages/PostFeed"
import AdminSignup from "./pages/AdminSignup"
import LearningPlanList from "./pages/LearningPlanList"
import CreateLearningPlan from "./pages/CreateLearningPlan"
import EditLearningPlan from "./pages/EditLearningPlan"
import LearningPlanDetail from "./pages/LearningPlanDetail"
import { Toaster } from "react-hot-toast"
import MyLearningPlans from "./pages/MyLearningPlans"
import CreateProgressUpdate from "./pages/CreateProgressUpdate"
import EditProgressUpdate from "./pages/EditProgressUpdate"
import MyProgressUpdates from "./pages/MyProgressUpdates"
import AllProgressUpdates from "./pages/AllProgressUpdates"

const AppWrapper = () => {
  const location = useLocation()
  const [showNavbar, setShowNavbar] = useState(false)

  useEffect(() => {
    const hiddenRoutes = ["/login", "/register", "/oauth-redirect", "/complete-profile", "/admin-signup"]
    setShowNavbar(!hiddenRoutes.includes(location.pathname))
  }, [location])

  return (
    <>
      <Toaster position="top-right" />
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<UsersList />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/edit/:id" element={<EditProfile />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/oauth-redirect" element={<OAuthRedirect />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/edit-post/:id" element={<EditPost />} />
        <Route path="/feed" element={<PostFeed />} />
        <Route path="/learning-plans" element={<LearningPlanList />} />
        <Route path="/create-learning-plan" element={<CreateLearningPlan />} />
        <Route path="/edit-learning-plan/:id" element={<EditLearningPlan />} />
        <Route path="/learning-plan/:id" element={<LearningPlanDetail />} />
        <Route path="/my-learning-plans" element={<MyLearningPlans />} />
        <Route path="/create-progress-update" element={<CreateProgressUpdate />} />
        <Route path="/edit-progress-update/:id" element={<EditProgressUpdate />} />
        <Route path="/my-progress-updates" element={<MyProgressUpdates />} />
        <Route path="/all-progress-updates" element={<AllProgressUpdates />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  )
}

export default App
