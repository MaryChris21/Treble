package com.treble.treble.dto;

import com.treble.treble.model.Like;

import java.time.LocalDateTime;

public class LikeResponse {
    private Long id;
    private Long postId;
    private Long userId;
    private LocalDateTime createdAt;
    private UserDTO user;

    public LikeResponse(Like like) {
        this.id = like.getId();
        this.postId = like.getPostId();
        this.userId = like.getUserId();
        this.createdAt = like.getCreatedAt();
    }

    public LikeResponse(Like like, UserDTO user) {
        this(like);
        this.user = user;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Long getPostId() {
        return postId;
    }

    public Long getUserId() {
        return userId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public UserDTO getUser() {
        return user;
    }
}
