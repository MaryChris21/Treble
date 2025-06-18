package com.treble.treble.dto;

import com.treble.treble.model.Notification;

import java.time.LocalDateTime;

public class NotificationResponse {
    private Long id;
    private Long userId;
    private Long senderId;
    private String type;
    private Long referenceId;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
    private UserDTO sender;

    public NotificationResponse(Notification notification) {
        this.id = notification.getId();
        this.userId = notification.getUserId();
        this.senderId = notification.getSenderId();
        this.type = notification.getType();
        this.referenceId = notification.getReferenceId();
        this.message = notification.getMessage();
        this.read = notification.isRead();
        this.createdAt = notification.getCreatedAt();
    }

    public NotificationResponse(Notification notification, UserDTO sender) {
        this(notification);
        this.sender = sender;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public String getType() {
        return type;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public String getMessage() {
        return message;
    }

    public boolean isRead() {
        return read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public UserDTO getSender() {
        return sender;
    }
}
