"use client"

// Create a new component for the image carousel
import { useState } from "react"

const ImageCarousel = ({ mediaItems }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!mediaItems || mediaItems.length === 0) {
    return null
  }

  const handlePrevious = (e) => {
    e.stopPropagation()
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? mediaItems.length - 1 : prevIndex - 1))
  }

  const handleNext = (e) => {
    e.stopPropagation()
    setCurrentIndex((prevIndex) => (prevIndex === mediaItems.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <div className="relative aspect-square bg-black">
      <img
        src={mediaItems[currentIndex]?.mediaUrl || "/placeholder.svg"}
        alt={`Post media ${currentIndex + 1}`}
        className="w-full h-full object-contain"
      />

      {mediaItems.length > 1 && (
        <>
          {/* Left arrow */}
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all duration-200"
            aria-label="Previous image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right arrow */}
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all duration-200"
            aria-label="Next image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Indicator dots */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
            {mediaItems.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ImageCarousel
