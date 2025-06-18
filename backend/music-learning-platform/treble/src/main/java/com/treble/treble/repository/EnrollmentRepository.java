package com.treble.treble.repository;

import com.treble.treble.model.Enrollment;
import com.treble.treble.model.LearningPlan;
import com.treble.treble.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByUserOrderByEnrolledAtDesc(User user);
    Optional<Enrollment> findByUserAndLearningPlan(User user, LearningPlan learningPlan);
    boolean existsByUserAndLearningPlan(User user, LearningPlan learningPlan);
}
