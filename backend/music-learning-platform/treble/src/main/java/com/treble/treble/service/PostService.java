package com.treble.treble.service;

import com.treble.treble.dto.CommentResponse;
import com.treble.treble.dto.PostRequest;
import com.treble.treble.dto.PostResponse;
import com.treble.treble.dto.UserDTO;
import com.treble.treble.exception.ResourceNotFoundException;
import com.treble.treble.model.Post;
import com.treble.treble.model.PostMedia;
import com.treble.treble.model.User;
import com.treble.treble.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private CommentService commentService;

    @Autowired
    private LikeService likeService;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${server.port:8080}")
    private String serverPort;

    public PostResponse createPost(Long userId, String caption, List<MultipartFile> mediaFiles) throws IOException {
        if (mediaFiles == null || mediaFiles.isEmpty() || mediaFiles.size() > 3) {
            throw new IllegalArgumentException("You must provide 1-3 media files");
        }

        // Create the post
        Post post = new Post(userId, caption);

        // Process each media file
        for (MultipartFile mediaFile : mediaFiles) {
            if (mediaFile.isEmpty()) {
                continue;
            }

            // Validate file type
            String contentType = mediaFile.getContentType();
            String mediaType;

            if (contentType != null && contentType.startsWith("image/")) {
                mediaType = "IMAGE";
            } else if (contentType != null && contentType.startsWith("video/")) {
                mediaType = "VIDEO";
            } else {
                throw new IllegalArgumentException("Unsupported media type: " + contentType);
            }

            // Store the file
            String fileName = fileStorageService.storeFile(mediaFile);

            String mediaUrl;
            if (baseUrl.contains(":")) {
                // If baseUrl already contains port
                mediaUrl = baseUrl + "/uploads/" + fileName;
            } else {
                // If baseUrl doesn't contain port
                mediaUrl = baseUrl + ":" + serverPort + "/uploads/" + fileName;
            }

            // Create and add the media item to the post
            PostMedia postMedia = new PostMedia(mediaType, mediaUrl);
            post.addMediaItem(postMedia);
        }

        // Save the post
        Post savedPost = postRepository.save(post);

        // Get user info for response
        User user = userService.getUserById(userId);
        UserDTO userDTO = convertToDTO(user);

        return new PostResponse(savedPost, userDTO, 0, 0, false);
    }

    public List<PostResponse> getAllPosts() {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        return posts.stream()
                .map(post -> {
                    User user = userService.getUserById(post.getUserId());
                    UserDTO userDTO = convertToDTO(user);
                    int commentCount = commentService.getCommentCountByPostId(post.getId());
                    int likeCount = likeService.getLikeCountByPostId(post.getId());
                    return new PostResponse(post, userDTO, commentCount, likeCount, false);
                })
                .collect(Collectors.toList());
    }

    public List<PostResponse> getAllPostsForUser(Long viewerId) {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        return posts.stream()
                .map(post -> {
                    User user = userService.getUserById(post.getUserId());
                    UserDTO userDTO = convertToDTO(user);
                    int commentCount = commentService.getCommentCountByPostId(post.getId());
                    int likeCount = likeService.getLikeCountByPostId(post.getId());
                    boolean hasLiked = likeService.hasUserLikedPost(post.getId(), viewerId);
                    return new PostResponse(post, userDTO, commentCount, likeCount, hasLiked);
                })
                .collect(Collectors.toList());
    }

    public List<PostResponse> getPostsByUser(Long userId) {
        List<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(userId);
        User user = userService.getUserById(userId);
        UserDTO userDTO = convertToDTO(user);

        return posts.stream()
                .map(post -> {
                    int commentCount = commentService.getCommentCountByPostId(post.getId());
                    int likeCount = likeService.getLikeCountByPostId(post.getId());
                    return new PostResponse(post, userDTO, commentCount, likeCount, false);
                })
                .collect(Collectors.toList());
    }

    public List<PostResponse> getPostsByUserForViewer(Long userId, Long viewerId) {
        List<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(userId);
        User user = userService.getUserById(userId);
        UserDTO userDTO = convertToDTO(user);

        return posts.stream()
                .map(post -> {
                    int commentCount = commentService.getCommentCountByPostId(post.getId());
                    int likeCount = likeService.getLikeCountByPostId(post.getId());
                    boolean hasLiked = likeService.hasUserLikedPost(post.getId(), viewerId);
                    return new PostResponse(post, userDTO, commentCount, likeCount, hasLiked);
                })
                .collect(Collectors.toList());
    }

    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        User user = userService.getUserById(post.getUserId());
        UserDTO userDTO = convertToDTO(user);

        int commentCount = commentService.getCommentCountByPostId(post.getId());
        List<CommentResponse> comments = commentService.getCommentsByPostId(post.getId());
        int likeCount = likeService.getLikeCountByPostId(post.getId());

        return new PostResponse(post, userDTO, commentCount, comments, likeCount, false);
    }

    public PostResponse getPostByIdForUser(Long id, Long userId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        User user = userService.getUserById(post.getUserId());
        UserDTO userDTO = convertToDTO(user);

        int commentCount = commentService.getCommentCountByPostId(post.getId());
        List<CommentResponse> comments = commentService.getCommentsByPostId(post.getId());
        int likeCount = likeService.getLikeCountByPostId(post.getId());
        boolean hasLiked = likeService.hasUserLikedPost(post.getId(), userId);

        return new PostResponse(post, userDTO, commentCount, comments, likeCount, hasLiked);
    }

    public PostResponse updatePost(Long id, PostRequest updateRequest, List<MultipartFile> newMediaFiles) throws IOException {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        // Update caption if provided
        if (updateRequest.getCaption() != null) {
            existingPost.setCaption(updateRequest.getCaption());
        }

        // Update media if provided
        if (newMediaFiles != null && !newMediaFiles.isEmpty()) {
            if (newMediaFiles.size() > 3) {
                throw new IllegalArgumentException("You can only upload up to 3 media files");
            }

            // Remove old media files
            for (PostMedia media : new ArrayList<>(existingPost.getMediaItems())) {
                String oldFileName = media.getMediaUrl().substring(media.getMediaUrl().lastIndexOf("/") + 1);
                fileStorageService.deleteFile(oldFileName);
                existingPost.removeMediaItem(media);
            }

            // Add new media files
            for (MultipartFile mediaFile : newMediaFiles) {
                if (mediaFile.isEmpty()) {
                    continue;
                }

                // Validate file type
                String contentType = mediaFile.getContentType();
                String mediaType;

                if (contentType != null && contentType.startsWith("image/")) {
                    mediaType = "IMAGE";
                } else if (contentType != null && contentType.startsWith("video/")) {
                    mediaType = "VIDEO";
                } else {
                    throw new IllegalArgumentException("Unsupported media type: " + contentType);
                }

                // Store the file
                String fileName = fileStorageService.storeFile(mediaFile);

                String mediaUrl;
                if (baseUrl.contains(":")) {
                    // If baseUrl already contains port
                    mediaUrl = baseUrl + "/uploads/" + fileName;
                } else {
                    // If baseUrl doesn't contain port
                    mediaUrl = baseUrl + ":" + serverPort + "/uploads/" + fileName;
                }

                // Create and add the media item to the post
                PostMedia postMedia = new PostMedia(mediaType, mediaUrl);
                existingPost.addMediaItem(postMedia);
            }
        }

        // Save the updated post
        Post updatedPost = postRepository.save(existingPost);

        // Get user info for response
        User user = userService.getUserById(updatedPost.getUserId());
        UserDTO userDTO = convertToDTO(user);

        int commentCount = commentService.getCommentCountByPostId(updatedPost.getId());
        List<CommentResponse> comments = commentService.getCommentsByPostId(updatedPost.getId());
        int likeCount = likeService.getLikeCountByPostId(updatedPost.getId());

        return new PostResponse(updatedPost, userDTO, commentCount, comments, likeCount, false);
    }

    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        // Delete all media files
        for (PostMedia media : post.getMediaItems()) {
            String fileName = media.getMediaUrl().substring(media.getMediaUrl().lastIndexOf("/") + 1);
            fileStorageService.deleteFile(fileName);
        }

        // Delete the post
        postRepository.deleteById(id);
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
