package com.treble.treble.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "progress_update_media")
public class ProgressUpdateMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "progress_update_id", nullable = false)
    private Long progressUpdateId;

    @Column(name = "media_url", nullable = false)
    private String mediaUrl;

    @Column(name = "media_type", nullable = false)
    private String mediaType;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Default constructor
    public ProgressUpdateMedia() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructor with fields
    public ProgressUpdateMedia(Long progressUpdateId, String mediaUrl, String mediaType) {
        this.progressUpdateId = progressUpdateId;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProgressUpdateId() {
        return progressUpdateId;
    }

    public void setProgressUpdateId(Long progressUpdateId) {
        this.progressUpdateId = progressUpdateId;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
