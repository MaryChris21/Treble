package com.treble.treble.controller;

import com.treble.treble.dto.PostRequest;
import com.treble.treble.dto.PostResponse;
import com.treble.treble.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse> createPost(
            @RequestParam("userId") Long userId,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam("media") List<MultipartFile> mediaFiles) {
        try {
            PostResponse createdPost = postService.createPost(userId, caption, mediaFiles);
            return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
        } catch (IOException e) {
            throw new RuntimeException("Error creating post: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        List<PostResponse> posts = postService.getAllPosts();
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    @GetMapping("/for-user/{userId}")
    public ResponseEntity<List<PostResponse>> getAllPostsForUser(@PathVariable Long userId) {
        List<PostResponse> posts = postService.getAllPostsForUser(userId);
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostResponse>> getPostsByUser(@PathVariable Long userId) {
        List<PostResponse> posts = postService.getPostsByUser(userId);
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}/viewer/{viewerId}")
    public ResponseEntity<List<PostResponse>> getPostsByUserForViewer(
            @PathVariable Long userId,
            @PathVariable Long viewerId) {
        List<PostResponse> posts = postService.getPostsByUserForViewer(userId, viewerId);
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id) {
        PostResponse post = postService.getPostById(id);
        return new ResponseEntity<>(post, HttpStatus.OK);
    }

    @GetMapping("/{id}/user/{userId}")
    public ResponseEntity<PostResponse> getPostByIdForUser(
            @PathVariable Long id,
            @PathVariable Long userId) {
        PostResponse post = postService.getPostByIdForUser(id, userId);
        return new ResponseEntity<>(post, HttpStatus.OK);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long id,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "media", required = false) List<MultipartFile> mediaFiles) {
        try {
            PostRequest updateRequest = new PostRequest(caption);
            PostResponse updatedPost = postService.updatePost(id, updateRequest, mediaFiles);
            return new ResponseEntity<>(updatedPost, HttpStatus.OK);
        } catch (IOException e) {
            throw new RuntimeException("Error updating post: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
