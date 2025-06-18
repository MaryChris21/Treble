package com.treble.treble.dto;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public class ProgressUpdateRequest {
    private String content;
    private Long learningPlanId;
    private List<MultipartFile> media;
    private boolean keepExistingMedia = true;

    public ProgressUpdateRequest() {
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getLearningPlanId() {
        return learningPlanId;
    }

    public void setLearningPlanId(Long learningPlanId) {
        this.learningPlanId = learningPlanId;
    }

    public List<MultipartFile> getMedia() {
        return media;
    }

    public void setMedia(List<MultipartFile> media) {
        this.media = media;
    }

    public boolean isKeepExistingMedia() {
        return keepExistingMedia;
    }

    public void setKeepExistingMedia(boolean keepExistingMedia) {
        this.keepExistingMedia = keepExistingMedia;
    }
}
