package com.treble.treble.service;

import com.treble.treble.dto.CommentRequest;
import com.treble.treble.dto.CommentResponse;
import com.treble.treble.dto.UserDTO;
import com.treble.treble.exception.ResourceNotFoundException;
import com.treble.treble.model.Comment;
import com.treble.treble.model.Post;
import com.treble.treble.model.User;
import com.treble.treble.repository.CommentRepository;
import com.treble.treble.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserService userService;

    public CommentResponse createComment(Long postId, Long userId, CommentRequest commentRequest) {
        // Verify post exists
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        // Create and save the comment
        Comment comment = new Comment(postId, userId, commentRequest.getContent());
        Comment savedComment = commentRepository.save(comment);

        // Get user info for response
        User user = userService.getUserById(userId);
        UserDTO userDTO = convertToDTO(user);

        return new CommentResponse(savedComment, userDTO);
    }

    public List<CommentResponse> getCommentsByPostId(Long postId) {
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId);

        return comments.stream()
                .map(comment -> {
                    User user = userService.getUserById(comment.getUserId());
                    UserDTO userDTO = convertToDTO(user);
                    return new CommentResponse(comment, userDTO);
                })
                .collect(Collectors.toList());
    }

    public CommentResponse getCommentById(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));

        User user = userService.getUserById(comment.getUserId());
        UserDTO userDTO = convertToDTO(user);

        return new CommentResponse(comment, userDTO);
    }

    public CommentResponse updateComment(Long id, Long userId, CommentRequest commentRequest) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));

        // Verify the user is the owner of the comment
        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own comments");
        }

        // Update the comment
        comment.setContent(commentRequest.getContent());
        Comment updatedComment = commentRepository.save(comment);

        // Get user info for response
        User user = userService.getUserById(userId);
        UserDTO userDTO = convertToDTO(user);

        return new CommentResponse(updatedComment, userDTO);
    }

    public void deleteComment(Long id, Long userId) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));

        // Verify the user is the owner of the comment
        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own comments");
        }

        commentRepository.deleteById(id);
    }

    public int getCommentCountByPostId(Long postId) {
        return commentRepository.countByPostId(postId);
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
