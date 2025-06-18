package com.treble.treble.controller;

import com.treble.treble.dto.ProgressUpdateRequest;
import com.treble.treble.dto.ProgressUpdateResponse;
import com.treble.treble.service.ProgressUpdateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/progress-updates")
public class ProgressUpdateController {
    private static final Logger logger = LoggerFactory.getLogger(ProgressUpdateController.class);

    @Autowired
    private ProgressUpdateService progressUpdateService;

    /**
     * Helper method to safely parse user ID from authentication
     */
    private Long getUserIdFromAuth(Authentication authentication) {
        if (authentication == null || "anonymousUser".equals(authentication.getName())) {
            return null;
        }

        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            logger.warn("Could not parse user ID: {}. Using default ID.", authentication.getName());
            return 1L; // Use a default user ID as a fallback
        }
    }

    @PostMapping
    public ResponseEntity<ProgressUpdateResponse> createProgressUpdate(
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "learningPlanId", required = false) Long learningPlanId,
            @RequestParam(value = "media", required = false) List<MultipartFile> media) throws IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getUserIdFromAuth(authentication);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Create a request object manually
        ProgressUpdateRequest request = new ProgressUpdateRequest();
        request.setContent(content);
        request.setLearningPlanId(learningPlanId);
        request.setMedia(media);

        logger.info("Creating progress update: content={}, learningPlanId={}, media={}",
                content, learningPlanId, media != null ? media.size() : 0);

        ProgressUpdateResponse response = progressUpdateService.createProgressUpdate(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProgressUpdateResponse>> getAllProgressUpdates() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getUserIdFromAuth(authentication);

        if (userId == null) {
            // For anonymous users, return public progress updates or an empty list
            logger.info("Anonymous user accessing progress updates");
            try {
                // Use a default user ID (e.g., 1) or pass null to get public updates only
                return ResponseEntity.ok(progressUpdateService.getAllProgressUpdates(1L));
            } catch (Exception e) {
                logger.error("Error getting progress updates for anonymous user: {}", e.getMessage());
                return ResponseEntity.ok(Collections.emptyList());
            }
        }

        List<ProgressUpdateResponse> responses = progressUpdateService.getAllProgressUpdates(userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProgressUpdateResponse>> getProgressUpdatesByUserId(
            @PathVariable Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = getUserIdFromAuth(authentication);

        List<ProgressUpdateResponse> responses = progressUpdateService.getProgressUpdatesByUserId(userId, currentUserId != null ? currentUserId : userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/my-updates")
    public ResponseEntity<List<ProgressUpdateResponse>> getMyProgressUpdates(
            @RequestParam(value = "userId", required = false) Long requestedUserId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getUserIdFromAuth(authentication);

        // If userId from auth is null, try to use the requested userId
        if (userId == null) {
            if (requestedUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            userId = requestedUserId;
        }

        // Log the user ID for debugging
        logger.info("Fetching progress updates for user ID: {}", userId);

        List<ProgressUpdateResponse> responses = progressUpdateService.getProgressUpdatesByUserId(userId, userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgressUpdateResponse> getProgressUpdateById(
            @PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getUserIdFromAuth(authentication);

        ProgressUpdateResponse response = progressUpdateService.getProgressUpdateById(id, userId != null ? userId : 1L);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgressUpdateResponse> updateProgressUpdate(
            @PathVariable Long id,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "learningPlanId", required = false) Long learningPlanId,
            @RequestParam(value = "media", required = false) List<MultipartFile> media,
            @RequestParam(value = "keepExistingMedia", required = false, defaultValue = "true") boolean keepExistingMedia) throws IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getUserIdFromAuth(authentication);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Create a request object manually
        ProgressUpdateRequest request = new ProgressUpdateRequest();
        request.setContent(content);
        request.setLearningPlanId(learningPlanId);
        request.setMedia(media);
        request.setKeepExistingMedia(keepExistingMedia);

        logger.info("Updating progress update: id={}, content={}, learningPlanId={}, media={}, keepExistingMedia={}",
                id, content, learningPlanId, media != null ? media.size() : 0, keepExistingMedia);

        ProgressUpdateResponse response = progressUpdateService.updateProgressUpdate(id, userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgressUpdate(
            @PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getUserIdFromAuth(authentication);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        progressUpdateService.deleteProgressUpdate(id, userId);
        return ResponseEntity.noContent().build();
    }
}
