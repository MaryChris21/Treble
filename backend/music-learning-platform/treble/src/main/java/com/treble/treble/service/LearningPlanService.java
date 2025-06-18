package com.treble.treble.service;

import com.treble.treble.dto.LearningPlanRequest;
import com.treble.treble.dto.LearningPlanResponse;
import com.treble.treble.dto.UserDTO;
import com.treble.treble.exception.ResourceNotFoundException;
import com.treble.treble.model.LearningPlan;
import com.treble.treble.model.User;
import com.treble.treble.repository.EnrollmentRepository;
import com.treble.treble.repository.LearningPlanRepository;
import com.treble.treble.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LearningPlanService {
    private static final Logger logger = LoggerFactory.getLogger(LearningPlanService.class);

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${server.port:8080}")
    private String serverPort;

    public List<LearningPlanResponse> getAllLearningPlans(Long userId) {
        logger.info("Fetching all learning plans for userId: {}", userId);

        User currentUser = null;
        if (userId != null) {
            try {
                currentUser = userRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                logger.info("Found user: {}", currentUser.getFirstName());
            } catch (Exception e) {
                logger.error("Error finding user with id {}: {}", userId, e.getMessage());
                // Continue without user context
            }
        }

        final User user = currentUser;

        try {
            List<LearningPlan> plans = learningPlanRepository.findAllByOrderByCreatedAtDesc();
            logger.info("Found {} learning plans", plans.size());

            return plans.stream()
                    .map(learningPlan -> convertToResponse(learningPlan, user))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching learning plans: {}", e.getMessage(), e);
            throw e;
        }
    }

    public LearningPlanResponse getLearningPlanById(Long id, Long userId) {
        logger.info("Fetching learning plan with id: {} for userId: {}", id, userId);

        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learning plan not found with id: " + id));

        User user = null;
        if (userId != null) {
            try {
                user = userRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            } catch (Exception e) {
                logger.error("Error finding user with id {}: {}", userId, e.getMessage());
                // Continue without user context
            }
        }

        return convertToResponse(learningPlan, user);
    }

    public LearningPlanResponse createLearningPlan(LearningPlanRequest request, MultipartFile videoFile, Long userId) throws IOException {
        logger.info("Creating learning plan for userId: {}", userId);

        User admin = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if user is admin
        if (!"admin".equals(admin.getUserRole())) {
            logger.error("User {} is not an admin", admin.getFirstName());
            throw new AccessDeniedException("Only admins can create learning plans");
        }

        LearningPlan learningPlan = new LearningPlan();
        learningPlan.setTitle(request.getTitle());
        learningPlan.setDescription(request.getDescription());
        learningPlan.setVideoUrl(request.getVideoUrl());
        learningPlan.setCreatedBy(admin);

        // Handle video file upload if provided
        if (videoFile != null && !videoFile.isEmpty()) {
            logger.info("Processing video file: {}", videoFile.getOriginalFilename());
            String fileName = fileStorageService.storeFile(videoFile);
            String videoFilePath;
            if (baseUrl.contains(":")) {
                // If baseUrl already contains port
                videoFilePath = baseUrl + "/uploads/" + fileName;
            } else {
                // If baseUrl doesn't contain port
                videoFilePath = baseUrl + ":" + serverPort + "/uploads/" + fileName;
            }
            learningPlan.setVideoFilePath(videoFilePath);
            logger.info("Video file path set to: {}", videoFilePath);
        }

        LearningPlan savedLearningPlan = learningPlanRepository.save(learningPlan);
        logger.info("Learning plan created with id: {}", savedLearningPlan.getId());

        return convertToResponse(savedLearningPlan, null);
    }

    public LearningPlanResponse updateLearningPlan(Long id, LearningPlanRequest request, MultipartFile videoFile, Long userId) throws IOException {
        logger.info("Updating learning plan with id: {} for userId: {}", id, userId);

        User admin = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if user is admin
        if (!"admin".equals(admin.getUserRole())) {
            logger.error("User {} is not an admin", admin.getFirstName());
            throw new AccessDeniedException("Only admins can update learning plans");
        }

        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learning plan not found with id: " + id));

        // Check if the admin is the creator of the learning plan
        if (!learningPlan.getCreatedBy().getId().equals(admin.getId())) {
            logger.error("User {} is not the creator of learning plan {}", admin.getFirstName(), id);
            throw new AccessDeniedException("You can only update your own learning plans");
        }

        learningPlan.setTitle(request.getTitle());
        learningPlan.setDescription(request.getDescription());
        learningPlan.setVideoUrl(request.getVideoUrl());

        // Handle video file upload if provided
        if (videoFile != null && !videoFile.isEmpty()) {
            logger.info("Processing video file: {}", videoFile.getOriginalFilename());
            // Delete old file if exists
            if (learningPlan.getVideoFilePath() != null) {
                String oldFileName = learningPlan.getVideoFilePath().substring(learningPlan.getVideoFilePath().lastIndexOf("/") + 1);
                fileStorageService.deleteFile(oldFileName);
                logger.info("Deleted old video file: {}", oldFileName);
            }

            String fileName = fileStorageService.storeFile(videoFile);
            String videoFilePath;
            if (baseUrl.contains(":")) {
                // If baseUrl already contains port
                videoFilePath = baseUrl + "/uploads/" + fileName;
            } else {
                // If baseUrl doesn't contain port
                videoFilePath = baseUrl + ":" + serverPort + "/uploads/" + fileName;
            }
            learningPlan.setVideoFilePath(videoFilePath);
            logger.info("Video file path set to: {}", videoFilePath);
        }

        LearningPlan updatedLearningPlan = learningPlanRepository.save(learningPlan);
        logger.info("Learning plan updated with id: {}", updatedLearningPlan.getId());

        return convertToResponse(updatedLearningPlan, null);
    }

    public void deleteLearningPlan(Long id, Long userId) {
        logger.info("Deleting learning plan with id: {} for userId: {}", id, userId);

        User admin = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if user is admin
        if (!"admin".equals(admin.getUserRole())) {
            logger.error("User {} is not an admin", admin.getFirstName());
            throw new AccessDeniedException("Only admins can delete learning plans");
        }

        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learning plan not found with id: " + id));

        // Check if the admin is the creator of the learning plan
        if (!learningPlan.getCreatedBy().getId().equals(admin.getId())) {
            logger.error("User {} is not the creator of learning plan {}", admin.getFirstName(), id);
            throw new AccessDeniedException("You can only delete your own learning plans");
        }

        // Delete video file if exists
        if (learningPlan.getVideoFilePath() != null) {
            String fileName = learningPlan.getVideoFilePath().substring(learningPlan.getVideoFilePath().lastIndexOf("/") + 1);
            fileStorageService.deleteFile(fileName);
            logger.info("Deleted video file: {}", fileName);
        }

        learningPlanRepository.delete(learningPlan);
        logger.info("Learning plan deleted with id: {}", id);
    }

    public LearningPlanResponse convertToResponse(LearningPlan learningPlan, User currentUser) {
        LearningPlanResponse response = new LearningPlanResponse();
        response.setId(learningPlan.getId());
        response.setTitle(learningPlan.getTitle());
        response.setDescription(learningPlan.getDescription());
        response.setVideoUrl(learningPlan.getVideoUrl());
        response.setVideoFilePath(learningPlan.getVideoFilePath());
        response.setCreatedAt(learningPlan.getCreatedAt());
        response.setUpdatedAt(learningPlan.getUpdatedAt());

        UserDTO createdByDTO = new UserDTO();
        createdByDTO.setId(learningPlan.getCreatedBy().getId());

        // Handle potential null values in User properties
        if (learningPlan.getCreatedBy().getFirstName() != null) {
            createdByDTO.setFirstName(learningPlan.getCreatedBy().getFirstName());
        } else {
            createdByDTO.setFirstName("Unknown");
        }

        if (learningPlan.getCreatedBy().getProfilePictureUrl() != null) {
            createdByDTO.setProfilePictureUrl(learningPlan.getCreatedBy().getProfilePictureUrl());
        }

        response.setCreatedBy(createdByDTO);

        // Set enrollment count
        response.setEnrollmentCount(learningPlan.getEnrollments().size());

        // Check if current user is enrolled
        if (currentUser != null) {
            boolean isEnrolled = enrollmentRepository.existsByUserAndLearningPlan(currentUser, learningPlan);
            response.setUserEnrolled(isEnrolled);
        } else {
            response.setUserEnrolled(false);
        }

        return response;
    }
}
