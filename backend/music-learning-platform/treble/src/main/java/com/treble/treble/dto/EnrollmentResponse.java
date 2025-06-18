package com.treble.treble.dto;

import java.time.LocalDateTime;

public class EnrollmentResponse {
    private Long id;
    private UserDTO user;
    private LearningPlanResponse learningPlan;
    private LocalDateTime enrolledAt;
    private boolean completed;
    private LocalDateTime completedAt;

    // Default constructor
    public EnrollmentResponse() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public LearningPlanResponse getLearningPlan() {
        return learningPlan;
    }

    public void setLearningPlan(LearningPlanResponse learningPlan) {
        this.learningPlan = learningPlan;
    }

    public LocalDateTime getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(LocalDateTime enrolledAt) {
        this.enrolledAt = enrolledAt;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
