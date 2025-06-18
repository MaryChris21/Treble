package com.treble.treble.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(length = 1000)
    private String caption;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostMedia> mediaItems = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Default constructor
    public Post() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructor with fields
    public Post(Long userId, String caption) {
        this.userId = userId;
        this.caption = caption;
        this.createdAt = LocalDateTime.now();
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

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public List<PostMedia> getMediaItems() {
        return mediaItems;
    }

    public void setMediaItems(List<PostMedia> mediaItems) {
        this.mediaItems = mediaItems;
    }

    public void addMediaItem(PostMedia mediaItem) {
        mediaItems.add(mediaItem);
        mediaItem.setPost(this);
    }

    public void removeMediaItem(PostMedia mediaItem) {
        mediaItems.remove(mediaItem);
        mediaItem.setPost(null);
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

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
