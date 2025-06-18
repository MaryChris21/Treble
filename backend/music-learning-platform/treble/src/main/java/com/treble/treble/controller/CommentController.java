package com.treble.treble.controller;

import com.treble.treble.dto.CommentRequest;
import com.treble.treble.dto.CommentResponse;
import com.treble.treble.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/post/{postId}/user/{userId}")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long postId,
            @PathVariable Long userId,
            @RequestBody CommentRequest commentRequest) {

        CommentResponse createdComment = commentService.createComment(postId, userId, commentRequest);
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentResponse>> getCommentsByPostId(@PathVariable Long postId) {
        List<CommentResponse> comments = commentService.getCommentsByPostId(postId);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentResponse> getCommentById(@PathVariable Long id) {
        CommentResponse comment = commentService.getCommentById(id);
        return new ResponseEntity<>(comment, HttpStatus.OK);
    }

    @PutMapping("/{id}/user/{userId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long id,
            @PathVariable Long userId,
            @RequestBody CommentRequest commentRequest) {

        CommentResponse updatedComment = commentService.updateComment(id, userId, commentRequest);
        return new ResponseEntity<>(updatedComment, HttpStatus.OK);
    }

    @DeleteMapping("/{id}/user/{userId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @PathVariable Long userId) {

        commentService.deleteComment(id, userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/count/post/{postId}")
    public ResponseEntity<Integer> getCommentCountByPostId(@PathVariable Long postId) {
        int count = commentService.getCommentCountByPostId(postId);
        return new ResponseEntity<>(count, HttpStatus.OK);
    }
}
