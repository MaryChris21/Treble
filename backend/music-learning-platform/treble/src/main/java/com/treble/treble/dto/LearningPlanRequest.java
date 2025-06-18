package com.treble.treble.dto;

public class LearningPlanRequest {
    private String title;
    private String description;
    private String videoUrl;

    // Default constructor
    public LearningPlanRequest() {
    }

    // Constructor with parameters
    public LearningPlanRequest(String title, String description, String videoUrl) {
        this.title = title;
        this.description = description;
        this.videoUrl = videoUrl;
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }
}
