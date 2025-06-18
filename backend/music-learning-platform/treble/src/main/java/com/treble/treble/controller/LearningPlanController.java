package com.treble.treble.controller;

import com.treble.treble.dto.LearningPlanRequest;
import com.treble.treble.dto.LearningPlanResponse;
import com.treble.treble.service.LearningPlanService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/learning-plans")
public class LearningPlanController {
    private static final Logger logger = LoggerFactory.getLogger(LearningPlanController.class);

    @Autowired
    private LearningPlanService learningPlanService;

    @GetMapping
    public ResponseEntity<List<LearningPlanResponse>> getAllLearningPlans(
            @RequestParam(value = "userId", required = false) Long userId) {
        logger.info("GET /api/v1/learning-plans - userId: {}", userId);
        try {
            List<LearningPlanResponse> learningPlans = learningPlanService.getAllLearningPlans(userId);
            return ResponseEntity.ok(learningPlans);
        } catch (Exception e) {
            logger.error("Error getting all learning plans: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningPlanResponse> getLearningPlanById(
            @PathVariable Long id,
            @RequestParam(value = "userId", required = false) Long userId) {
        logger.info("GET /api/v1/learning-plans/{} - userId: {}", id, userId);
        try {
            LearningPlanResponse learningPlan = learningPlanService.getLearningPlanById(id, userId);
            return ResponseEntity.ok(learningPlan);
        } catch (Exception e) {
            logger.error("Error getting learning plan by id {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LearningPlanResponse> createLearningPlan(
            @RequestParam("adminId") Long adminId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "videoUrl", required = false) String videoUrl,
            @RequestParam(value = "videoFile", required = false) MultipartFile videoFile) throws IOException {
        logger.info("POST /api/v1/learning-plans - adminId: {}, title: {}", adminId, title);
        try {
            LearningPlanRequest request = new LearningPlanRequest(title, description, videoUrl);
            LearningPlanResponse createdPlan = learningPlanService.createLearningPlan(request, videoFile, adminId);
            return new ResponseEntity<>(createdPlan, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating learning plan: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LearningPlanResponse> updateLearningPlan(
            @PathVariable Long id,
            @RequestParam("adminId") Long adminId,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "videoUrl", required = false) String videoUrl,
            @RequestParam(value = "videoFile", required = false) MultipartFile videoFile) throws IOException {
        logger.info("PUT /api/v1/learning-plans/{} - adminId: {}", id, adminId);
        try {
            LearningPlanRequest request = new LearningPlanRequest(title, description, videoUrl);
            LearningPlanResponse updatedPlan = learningPlanService.updateLearningPlan(id, request, videoFile, adminId);
            return ResponseEntity.ok(updatedPlan);
        } catch (Exception e) {
            logger.error("Error updating learning plan with id {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearningPlan(
            @PathVariable Long id,
            @RequestParam("adminId") Long adminId) {
        logger.info("DELETE /api/v1/learning-plans/{} - adminId: {}", id, adminId);
        try {
            learningPlanService.deleteLearningPlan(id, adminId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting learning plan with id {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }
}
