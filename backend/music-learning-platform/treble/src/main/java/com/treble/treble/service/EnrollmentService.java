package com.treble.treble.service;

import com.treble.treble.dto.EnrollmentResponse;
import com.treble.treble.dto.LearningPlanResponse;
import com.treble.treble.dto.UserDTO;
import com.treble.treble.exception.ResourceNotFoundException;
import com.treble.treble.model.Enrollment;
import com.treble.treble.model.LearningPlan;
import com.treble.treble.model.User;
import com.treble.treble.repository.EnrollmentRepository;
import com.treble.treble.repository.LearningPlanRepository;
import com.treble.treble.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    @Autowired
    private LearningPlanService learningPlanService;

    public List<EnrollmentResponse> getUserEnrollments(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return enrollmentRepository.findByUserOrderByEnrolledAtDesc(user).stream()
                .map(enrollment -> {
                    LearningPlanResponse learningPlanResponse = learningPlanService.convertToResponse(enrollment.getLearningPlan(), user);
                    return convertToResponse(enrollment, learningPlanResponse);
                })
                .collect(Collectors.toList());
    }

    public EnrollmentResponse enrollInLearningPlan(Long learningPlanId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if user is not an admin
        if ("admin".equals(user.getUserRole())) {
            throw new AccessDeniedException("Admins cannot enroll in learning plans");
        }

        LearningPlan learningPlan = learningPlanRepository.findById(learningPlanId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning plan not found"));

        // Check if user is already enrolled
        if (enrollmentRepository.existsByUserAndLearningPlan(user, learningPlan)) {
            throw new IllegalStateException("User is already enrolled in this learning plan");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setLearningPlan(learningPlan);
        enrollment.setEnrolledAt(LocalDateTime.now());
        enrollment.setCompleted(false);

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        LearningPlanResponse learningPlanResponse = learningPlanService.convertToResponse(learningPlan, user);

        return convertToResponse(savedEnrollment, learningPlanResponse);
    }

    public void unenrollFromLearningPlan(Long learningPlanId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LearningPlan learningPlan = learningPlanRepository.findById(learningPlanId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning plan not found"));

        Enrollment enrollment = enrollmentRepository.findByUserAndLearningPlan(user, learningPlan)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));

        enrollmentRepository.delete(enrollment);
    }

    public EnrollmentResponse markLearningPlanAsCompleted(Long learningPlanId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LearningPlan learningPlan = learningPlanRepository.findById(learningPlanId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning plan not found"));

        Enrollment enrollment = enrollmentRepository.findByUserAndLearningPlan(user, learningPlan)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));

        enrollment.setCompleted(true);
        enrollment.setCompletedAt(LocalDateTime.now());

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        LearningPlanResponse learningPlanResponse = learningPlanService.convertToResponse(learningPlan, user);

        return convertToResponse(savedEnrollment, learningPlanResponse);
    }

    private EnrollmentResponse convertToResponse(Enrollment enrollment, LearningPlanResponse learningPlanResponse) {
        EnrollmentResponse response = new EnrollmentResponse();
        response.setId(enrollment.getId());

        // Set user info
        User user = enrollment.getUser();
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setProfilePictureUrl(user.getProfilePictureUrl());
        response.setUser(userDTO);

        // Set learning plan info
        response.setLearningPlan(learningPlanResponse);
        response.setEnrolledAt(enrollment.getEnrolledAt());
        response.setCompleted(enrollment.isCompleted());
        response.setCompletedAt(enrollment.getCompletedAt());

        return response;
    }
}
