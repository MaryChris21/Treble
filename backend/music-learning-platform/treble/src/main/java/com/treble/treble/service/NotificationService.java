package com.treble.treble.service;

import com.treble.treble.dto.NotificationResponse;
import com.treble.treble.dto.UserDTO;
import com.treble.treble.model.Notification;
import com.treble.treble.model.User;
import com.treble.treble.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserService userService;

    public void createLikeNotification(Long userId, Long senderId, Long postId) {
        User sender = userService.getUserById(senderId);
        String message = sender.getFirstName() + " " + sender.getLastName() + " liked your post";

        Notification notification = new Notification(
                userId,
                senderId,
                "LIKE",
                postId,
                message
        );

        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getNotificationsByUserId(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return notifications.stream()
                .map(notification -> {
                    User sender = userService.getUserById(notification.getSenderId());
                    UserDTO senderDTO = convertToDTO(sender);
                    return new NotificationResponse(notification, senderDTO);
                })
                .collect(Collectors.toList());
    }

    public int getUnreadNotificationCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markNotificationAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    public void markAllNotificationsAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    // Helper method to convert User to UserDTO
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setUserRole(user.getUserRole());
        dto.setGender(user.getGender());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        return dto;
    }
}
