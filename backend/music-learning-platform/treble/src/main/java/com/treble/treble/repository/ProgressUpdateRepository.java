package com.treble.treble.repository;

import com.treble.treble.model.ProgressUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressUpdateRepository extends JpaRepository<ProgressUpdate, Long> {
    List<ProgressUpdate> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ProgressUpdate> findByLearningPlanIdOrderByCreatedAtDesc(Long learningPlanId);
    List<ProgressUpdate> findAllByOrderByCreatedAtDesc();
}
