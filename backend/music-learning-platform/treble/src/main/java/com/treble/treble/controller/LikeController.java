package com.treble.treble.controller;

import com.treble.treble.dto.LikeResponse;
import com.treble.treble.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/likes")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @PostMapping("/post/{postId}/user/{userId}")
    public ResponseEntity<LikeResponse> likePost(
            @PathVariable Long postId,
            @PathVariable Long userId) {

        LikeResponse likeResponse = likeService.likePost(postId, userId);
        return new ResponseEntity<>(likeResponse, HttpStatus.CREATED);
    }

    @DeleteMapping("/post/{postId}/user/{userId}")
    public ResponseEntity<Void> unlikePost(
            @PathVariable Long postId,
            @PathVariable Long userId) {

        likeService.unlikePost(postId, userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<LikeResponse>> getLikesByPostId(@PathVariable Long postId) {
        List<LikeResponse> likes = likeService.getLikesByPostId(postId);
        return new ResponseEntity<>(likes, HttpStatus.OK);
    }

    @GetMapping("/count/post/{postId}")
    public ResponseEntity<Map<String, Integer>> getLikeCountByPostId(@PathVariable Long postId) {
        int count = likeService.getLikeCountByPostId(postId);
        Map<String, Integer> response = new HashMap<>();
        response.put("count", count);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/check/post/{postId}/user/{userId}")
    public ResponseEntity<Map<String, Boolean>> hasUserLikedPost(
            @PathVariable Long postId,
            @PathVariable Long userId) {

        boolean hasLiked = likeService.hasUserLikedPost(postId, userId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("hasLiked", hasLiked);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
