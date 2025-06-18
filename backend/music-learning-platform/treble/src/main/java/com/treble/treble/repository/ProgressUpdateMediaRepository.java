package com.treble.treble.repository;

import com.treble.treble.model.ProgressUpdateMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressUpdateMediaRepository extends JpaRepository<ProgressUpdateMedia, Long> {
    List<ProgressUpdateMedia> findByProgressUpdateId(Long progressUpdateId);
    void deleteByProgressUpdateId(Long progressUpdateId);
}
