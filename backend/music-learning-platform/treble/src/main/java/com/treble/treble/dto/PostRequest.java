package com.treble.treble.dto;

public class PostRequest {
    private String caption;

    public PostRequest() {
    }

    public PostRequest(String caption) {
        this.caption = caption;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }
}
