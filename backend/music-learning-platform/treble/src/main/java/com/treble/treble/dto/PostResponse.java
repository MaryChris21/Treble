package com.treble.treble.dto;

import com.treble.treble.model.Post;
import com.treble.treble.model.PostMedia;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class PostResponse {
    private Long id;
    private Long userId;
    private String caption;
    private List<PostMediaDTO> mediaItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserDTO user;
    private int commentCount;
    private List<CommentResponse> comments;
    private int likeCount;
    private boolean hasLiked;

    public PostResponse(Post post) {
        this.id = post.getId();
        this.userId = post.getUserId();
        this.caption = post.getCaption();
        this.mediaItems = post.getMediaItems().stream()
                .map(PostMediaDTO::new)
                .collect(Collectors.toList());
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
    }

    public PostResponse(Post post, UserDTO user) {
        this(post);
        this.user = user;
    }

    public PostResponse(Post post, UserDTO user, int commentCount) {
        this(post, user);
        this.commentCount = commentCount;
    }

    public PostResponse(Post post, UserDTO user, int commentCount, List<CommentResponse> comments) {
        this(post, user, commentCount);
        this.comments = comments;
    }

    public PostResponse(Post post, UserDTO user, int commentCount, int likeCount, boolean hasLiked) {
        this(post, user, commentCount);
        this.likeCount = likeCount;
        this.hasLiked = hasLiked;
    }

    public PostResponse(Post post, UserDTO user, int commentCount, List<CommentResponse> comments, int likeCount, boolean hasLiked) {
        this(post, user, commentCount, comments);
        this.likeCount = likeCount;
        this.hasLiked = hasLiked;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getCaption() {
        return caption;
    }

    public List<PostMediaDTO> getMediaItems() {
        return mediaItems;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public UserDTO getUser() {
        return user;
    }

    public int getCommentCount() {
        return commentCount;
    }

    public List<CommentResponse> getComments() {
        return comments;
    }

    public int getLikeCount() {
        return likeCount;
    }

    public boolean isHasLiked() {
        return hasLiked;
    }

    // Inner class for media items
    public static class PostMediaDTO {
        private Long id;
        private String mediaType;
        private String mediaUrl;

        public PostMediaDTO(PostMedia media) {
            this.id = media.getId();
            this.mediaType = media.getMediaType();
            this.mediaUrl = media.getMediaUrl();
        }

        public Long getId() {
            return id;
        }

        public String getMediaType() {
            return mediaType;
        }

        public String getMediaUrl() {
            return mediaUrl;
        }
    }
}
