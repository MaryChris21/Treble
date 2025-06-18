package com.treble.treble.controller;

import com.treble.treble.dto.EnrollmentResponse;
import com.treble.treble.service.EnrollmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/enrollments")
public class EnrollmentController {
    private static final Logger logger = LoggerFactory.getLogger(EnrollmentController.class);

    @Autowired
    private EnrollmentService enrollmentService;

    @GetMapping("/my-learning-plans")
    public ResponseEntity<List<EnrollmentResponse>> getUserEnrollments(
            @RequestParam("userId") Long userId) {
        logger.info("GET /api/v1/enrollments/my-learning-plans - userId: {}", userId);
        try {
            List<EnrollmentResponse> enrollments = enrollmentService.getUserEnrollments(userId);
            return ResponseEntity.ok(enrollments);
        } catch (Exception e) {
            logger.error("Error getting user enrollments for userId {}: {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/{learningPlanId}")
    public ResponseEntity<EnrollmentResponse> enrollInLearningPlan(
            @PathVariable Long learningPlanId,
            @RequestParam("userId") Long userId) {
        logger.info("POST /api/v1/enrollments/{} - userId: {}", learningPlanId, userId);
        try {
            EnrollmentResponse enrollment = enrollmentService.enrollInLearningPlan(learningPlanId, userId);
            return new ResponseEntity<>(enrollment, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error enrolling user {} in learning plan {}: {}", userId, learningPlanId, e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/{learningPlanId}")
    public ResponseEntity<Void> unenrollFromLearningPlan(
            @PathVariable Long learningPlanId,
            @RequestParam("userId") Long userId) {
        logger.info("DELETE /api/v1/enrollments/{} - userId: {}", learningPlanId, userId);
        try {
            enrollmentService.unenrollFromLearningPlan(learningPlanId, userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error unenrolling user {} from learning plan {}: {}", userId, learningPlanId, e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/{learningPlanId}/complete")
    public ResponseEntity<EnrollmentResponse> markLearningPlanAsCompleted(
            @PathVariable Long learningPlanId,
            @RequestParam("userId") Long userId) {
        logger.info("PUT /api/v1/enrollments/{}/complete - userId: {}", learningPlanId, userId);
        try {
            EnrollmentResponse enrollment = enrollmentService.markLearningPlanAsCompleted(learningPlanId, userId);
            return ResponseEntity.ok(enrollment);
        } catch (Exception e) {
            logger.error("Error marking learning plan {} as completed for user {}: {}", learningPlanId, userId, e.getMessage(), e);
            throw e;
        }
    }
}
