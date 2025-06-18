package com.treble.treble.dto;

import com.treble.treble.model.ProgressUpdate;
import com.treble.treble.model.ProgressUpdateMedia;

import java.time.LocalDateTime;
import java.util.List;

public class ProgressUpdateResponse {
    private Long id;
    private Long userId;
    private Long learningPlanId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserDTO user;
    private String learningPlanTitle;
    private List<String> mediaUrls;
    private int likeCount;
    private int commentCount;
    private boolean userHasLiked;

    // Constructor
    public ProgressUpdateResponse(ProgressUpdate progressUpdate, UserDTO user, String learningPlanTitle,
                                  List<String> mediaUrls, int likeCount, int commentCount, boolean userHasLiked) {
        this.id = progressUpdate.getId();
        this.userId = progressUpdate.getUserId();
        this.learningPlanId = progressUpdate.getLearningPlanId();
        this.content = progressUpdate.getContent();
        this.createdAt = progressUpdate.getCreatedAt();
        this.updatedAt = progressUpdate.getUpdatedAt();
        this.user = user;
        this.learningPlanTitle = learningPlanTitle;
        this.mediaUrls = mediaUrls;
        this.likeCount = likeCount;
        this.commentCount = commentCount;
        this.userHasLiked = userHasLiked;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getLearningPlanId() {
        return learningPlanId;
    }

    public void setLearningPlanId(Long learningPlanId) {
        this.learningPlanId = learningPlanId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public String getLearningPlanTitle() {
        return learningPlanTitle;
    }

    public void setLearningPlanTitle(String learningPlanTitle) {
        this.learningPlanTitle = learningPlanTitle;
    }

    public List<String> getMediaUrls() {
        return mediaUrls;
    }

    public void setMediaUrls(List<String> mediaUrls) {
        this.mediaUrls = mediaUrls;
    }

    public int getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(int likeCount) {
        this.likeCount = likeCount;
    }

    public int getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(int commentCount) {
        this.commentCount = commentCount;
    }

    public boolean isUserHasLiked() {
        return userHasLiked;
    }

    public void setUserHasLiked(boolean userHasLiked) {
        this.userHasLiked = userHasLiked;
    }
}
