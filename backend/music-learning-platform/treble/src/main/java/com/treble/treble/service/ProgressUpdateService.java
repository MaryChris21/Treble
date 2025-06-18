package com.treble.treble.service;

import com.treble.treble.dto.ProgressUpdateRequest;
import com.treble.treble.dto.ProgressUpdateResponse;
import com.treble.treble.dto.UserDTO;
import com.treble.treble.exception.ResourceNotFoundException;
import com.treble.treble.model.LearningPlan;
import com.treble.treble.model.ProgressUpdate;
import com.treble.treble.model.ProgressUpdateMedia;
import com.treble.treble.model.User;
import com.treble.treble.repository.LearningPlanRepository;
import com.treble.treble.repository.ProgressUpdateMediaRepository;
import com.treble.treble.repository.ProgressUpdateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgressUpdateService {
    private static final Logger logger = LoggerFactory.getLogger(ProgressUpdateService.class);

    @Autowired
    private ProgressUpdateRepository progressUpdateRepository;

    @Autowired
    private ProgressUpdateMediaRepository progressUpdateMediaRepository;

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private FileStorageService fileStorageService;

    @Transactional
    public ProgressUpdateResponse createProgressUpdate(Long userId, ProgressUpdateRequest request) throws IOException {
        logger.info("Creating progress update for user: {}, learning plan: {}", userId, request.getLearningPlanId());

        // Verify learning plan exists
        LearningPlan learningPlan = learningPlanRepository.findById(request.getLearningPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Learning plan not found with id: " + request.getLearningPlanId()));

        // Create and save progress update
        ProgressUpdate progressUpdate = new ProgressUpdate(userId, request.getLearningPlanId(), request.getContent());
        ProgressUpdate savedProgressUpdate = progressUpdateRepository.save(progressUpdate);
        logger.info("Saved progress update with ID: {}", savedProgressUpdate.getId());

        // Process media files if any
        List<String> mediaUrls = new ArrayList<>();
        if (request.getMedia() != null && !request.getMedia().isEmpty()) {
            for (MultipartFile file : request.getMedia()) {
                if (file != null && !file.isEmpty()) {
                    logger.info("Processing media file: {}, size: {}", file.getOriginalFilename(), file.getSize());
                    try {
                        String mediaUrl = fileStorageService.storeFile(file);
                        logger.info("Stored file with URL: {}", mediaUrl);
                        ProgressUpdateMedia media = new ProgressUpdateMedia(savedProgressUpdate.getId(), mediaUrl, file.getContentType());
                        progressUpdateMediaRepository.save(media);
                        mediaUrls.add(mediaUrl);
                    } catch (Exception e) {
                        logger.error("Error storing media file: {}", e.getMessage(), e);
                    }
                } else {
                    logger.warn("Skipping empty media file");
                }
            }
        } else {
            logger.info("No media files to process");
        }

        // Get user info for response
        User user = userService.getUserById(userId);
        UserDTO userDTO = convertToDTO(user);

        return new ProgressUpdateResponse(
                savedProgressUpdate,
                userDTO,
                learningPlan.getTitle(),
                mediaUrls,
                0, // Initial like count
                0, // Initial comment count
                false // User hasn't liked their own post
        );
    }

    public List<ProgressUpdateResponse> getAllProgressUpdates(Long currentUserId) {
        List<ProgressUpdate> progressUpdates = progressUpdateRepository.findAllByOrderByCreatedAtDesc();
        return progressUpdates.stream()
                .map(progressUpdate -> convertToResponse(progressUpdate, currentUserId))
                .collect(Collectors.toList());
    }

    public List<ProgressUpdateResponse> getProgressUpdatesByUserId(Long userId, Long currentUserId) {
        logger.info("Getting progress updates for user ID: {}", userId);
        List<ProgressUpdate> progressUpdates = progressUpdateRepository.findByUserIdOrderByCreatedAtDesc(userId);
        logger.info("Found {} progress updates for user ID: {}", progressUpdates.size(), userId);

        return progressUpdates.stream()
                .map(progressUpdate -> convertToResponse(progressUpdate, currentUserId))
                .collect(Collectors.toList());
    }

    public ProgressUpdateResponse getProgressUpdateById(Long id, Long currentUserId) {
        ProgressUpdate progressUpdate = progressUpdateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Progress update not found with id: " + id));
        return convertToResponse(progressUpdate, currentUserId);
    }

    @Transactional
    public ProgressUpdateResponse updateProgressUpdate(Long id, Long userId, ProgressUpdateRequest request) throws IOException {
        logger.info("Updating progress update ID: {} for user: {}", id, userId);

        ProgressUpdate progressUpdate = progressUpdateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Progress update not found with id: " + id));

        // Verify the user is the owner of the progress update
        if (!progressUpdate.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own progress updates");
        }

        // Update the progress update content
        progressUpdate.setContent(request.getContent());
        ProgressUpdate updatedProgressUpdate = progressUpdateRepository.save(progressUpdate);
        logger.info("Updated progress update content for ID: {}", id);

        // Process media files
        List<String> mediaUrls = new ArrayList<>();
        boolean keepExistingMedia = request.isKeepExistingMedia();

        // If we're not keeping existing media or there's new media, handle media changes
        if (!keepExistingMedia || (request.getMedia() != null && !request.getMedia().isEmpty())) {
            // If not keeping existing media, delete it
            if (!keepExistingMedia) {
                logger.info("Deleting existing media for progress update ID: {}", id);
                List<ProgressUpdateMedia> existingMedia = progressUpdateMediaRepository.findByProgressUpdateId(id);
                for (ProgressUpdateMedia media : existingMedia) {
                    fileStorageService.deleteFile(media.getMediaUrl());
                }
                progressUpdateMediaRepository.deleteByProgressUpdateId(id);
            }

            // Add new media if provided
            if (request.getMedia() != null && !request.getMedia().isEmpty()) {
                logger.info("Processing {} new media files", request.getMedia().size());
                for (MultipartFile file : request.getMedia()) {
                    if (file != null && !file.isEmpty()) {
                        logger.info("Processing new media file: {}, size: {}", file.getOriginalFilename(), file.getSize());
                        try {
                            String mediaUrl = fileStorageService.storeFile(file);
                            logger.info("Stored new file with URL: {}", mediaUrl);
                            ProgressUpdateMedia media = new ProgressUpdateMedia(updatedProgressUpdate.getId(), mediaUrl, file.getContentType());
                            progressUpdateMediaRepository.save(media);
                            mediaUrls.add(mediaUrl);
                        } catch (Exception e) {
                            logger.error("Error storing new media file: {}", e.getMessage(), e);
                        }
                    }
                }
            }
        } else {
            // Keep existing media
            logger.info("Keeping existing media for progress update ID: {}", id);
            List<ProgressUpdateMedia> existingMedia = progressUpdateMediaRepository.findByProgressUpdateId(id);
            mediaUrls = existingMedia.stream()
                    .map(ProgressUpdateMedia::getMediaUrl)
                    .collect(Collectors.toList());
        }

        // Get user info for response
        User user = userService.getUserById(userId);
        UserDTO userDTO = convertToDTO(user);

        // Get learning plan title
        LearningPlan learningPlan = learningPlanRepository.findById(progressUpdate.getLearningPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Learning plan not found with id: " + progressUpdate.getLearningPlanId()));

        return new ProgressUpdateResponse(
                updatedProgressUpdate,
                userDTO,
                learningPlan.getTitle(),
                mediaUrls,
                0, // Like count (would need to be calculated)
                0, // Comment count (would need to be calculated)
                false // User has liked (would need to be calculated)
        );
    }

    @Transactional
    public void deleteProgressUpdate(Long id, Long userId) {
        ProgressUpdate progressUpdate = progressUpdateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Progress update not found with id: " + id));

        // Verify the user is the owner of the progress update
        if (!progressUpdate.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own progress updates");
        }

        // Delete media files from storage
        List<ProgressUpdateMedia> mediaList = progressUpdateMediaRepository.findByProgressUpdateId(id);
        for (ProgressUpdateMedia media : mediaList) {
            fileStorageService.deleteFile(media.getMediaUrl());
        }

        // Delete media records
        progressUpdateMediaRepository.deleteByProgressUpdateId(id);

        // Delete progress update
        progressUpdateRepository.deleteById(id);
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

    // Helper method to convert ProgressUpdate to ProgressUpdateResponse
    private ProgressUpdateResponse convertToResponse(ProgressUpdate progressUpdate, Long currentUserId) {
        User user = userService.getUserById(progressUpdate.getUserId());
        UserDTO userDTO = convertToDTO(user);

        LearningPlan learningPlan = learningPlanRepository.findById(progressUpdate.getLearningPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Learning plan not found with id: " + progressUpdate.getLearningPlanId()));

        List<ProgressUpdateMedia> media = progressUpdateMediaRepository.findByProgressUpdateId(progressUpdate.getId());
        List<String> mediaUrls = media.stream()
                .map(ProgressUpdateMedia::getMediaUrl)
                .collect(Collectors.toList());

        // In a real implementation, you would calculate these values
        int likeCount = 0; // Would need to be calculated
        int commentCount = 0; // Would need to be calculated
        boolean userHasLiked = false; // Would need to be calculated

        return new ProgressUpdateResponse(
                progressUpdate,
                userDTO,
                learningPlan.getTitle(),
                mediaUrls,
                likeCount,
                commentCount,
                userHasLiked
        );
    }
}
