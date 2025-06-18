package com.treble.treble.service;

import com.treble.treble.dto.LikeResponse;
import com.treble.treble.dto.UserDTO;
import com.treble.treble.exception.ResourceNotFoundException;
import com.treble.treble.model.Like;
import com.treble.treble.model.Post;
import com.treble.treble.model.User;
import com.treble.treble.repository.LikeRepository;
import com.treble.treble.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LikeService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public LikeResponse likePost(Long postId, Long userId) {
        // Check if post exists
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        // Check if user is the post owner
        if (post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You cannot like your own post");
        }

        // Check if user has already liked the post
        if (likeRepository.existsByPostIdAndUserId(postId, userId)) {
            throw new IllegalArgumentException("You have already liked this post");
        }

        // Create and save the like
        Like like = new Like(postId, userId);
        Like savedLike = likeRepository.save(like);

        // Get user info for response
        User user = userService.getUserById(userId);
        UserDTO userDTO = convertToDTO(user);

        // Create notification for post owner
        notificationService.createLikeNotification(post.getUserId(), userId, postId);

        return new LikeResponse(savedLike, userDTO);
    }

    @Transactional
    public void unlikePost(Long postId, Long userId) {
        // Check if post exists
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found with id: " + postId);
        }

        // Check if like exists
        Like like = likeRepository.findByPostIdAndUserId(postId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Like not found for post id: " + postId + " and user id: " + userId));

        // Delete the like
        likeRepository.delete(like);
    }

    public List<LikeResponse> getLikesByPostId(Long postId) {
        List<Like> likes = likeRepository.findByPostId(postId);

        return likes.stream()
                .map(like -> {
                    User user = userService.getUserById(like.getUserId());
                    UserDTO userDTO = convertToDTO(user);
                    return new LikeResponse(like, userDTO);
                })
                .collect(Collectors.toList());
    }

    public int getLikeCountByPostId(Long postId) {
        return likeRepository.countByPostId(postId);
    }

    public boolean hasUserLikedPost(Long postId, Long userId) {
        return likeRepository.existsByPostIdAndUserId(postId, userId);
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
