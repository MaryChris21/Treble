package com.treble.treble.controller;

import com.treble.treble.model.User;
import com.treble.treble.service.UserService;
import com.treble.treble.dto.UserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody User user) {
        try {
            userService.createUser(user);
            return ResponseEntity.ok("User created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating user: " + e.getMessage());
        }
    }

    @GetMapping("/oauth-success")
    public void handleOAuthSuccess(@AuthenticationPrincipal OAuth2User oauth2User, HttpServletResponse response) throws IOException {
        try {
            System.out.println("OAuth success handler called");
            System.out.println("OAuth2User: " + oauth2User);

            if (oauth2User == null) {
                System.err.println("OAuth2User is null");
                response.sendRedirect("http://localhost:5173/login?error=oauth_failed");
                return;
            }

            String email = oauth2User.getAttribute("email");
            System.out.println("Email from OAuth: " + email);

            if (email == null) {
                System.err.println("Email is null from OAuth response");
                response.sendRedirect("http://localhost:5173/login?error=no_email");
                return;
            }

            User user = userService.getUserByEmail(email);

            if (user == null) {
                System.out.println("Creating new user for email: " + email);
                user = new User();
                user.setEmail(email);
                user.setFirstName(oauth2User.getAttribute("given_name"));
                user.setLastName(oauth2User.getAttribute("family_name"));
                user.setProfilePictureUrl(oauth2User.getAttribute("picture"));
                user.setUserRole("user");
                user = userService.createUser(user);
                System.out.println("New user created with ID: " + user.getId());
            } else {
                System.out.println("Found existing user with ID: " + user.getId());
            }

            if (user.getLastName() == null || user.getDOB() == null || user.getGender() == null || user.getContactNo() == null) {
                System.out.println("Redirecting to complete profile");
                response.sendRedirect("http://localhost:5173/complete-profile?email=" + email);
            } else {
                System.out.println("Redirecting to OAuth redirect");
                response.sendRedirect("http://localhost:5173/oauth-redirect?email=" + email);
            }
        } catch (Exception e) {
            System.err.println("Error in OAuth success handler: " + e.getMessage());
            e.printStackTrace();
            response.sendRedirect("http://localhost:5173/login?error=server_error");
        }
    }

    @GetMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response, Authentication auth) {
        if (auth != null) {
            new SecurityContextLogoutHandler().logout(request, response, auth);
        }
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            List<UserDTO> userDTOs = users.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch users: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(convertToDTO(user));
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            userService.updateUser(id, user);
            return ResponseEntity.ok("User updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating user: " + e.getMessage());
        }
    }

    @PutMapping("/update-by-email/{email}")
    public ResponseEntity<?> updateUserByEmail(@PathVariable String email, @RequestBody Map<String, String> updates) {
        try {
            User user = userService.getUserByEmail(email);
            if (user == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found with email: " + email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            if (updates.containsKey("dob")) user.setDOB(LocalDate.parse(updates.get("dob")));
            if (updates.containsKey("gender")) user.setGender(updates.get("gender"));
            if (updates.containsKey("contactNo")) user.setContactNo(Integer.parseInt(updates.get("contactNo")));
            if (updates.containsKey("lastName")) user.setLastName(updates.get("lastName"));

            User updatedUser = userService.updateUser(user.getId(), user); // ✅ Fixed
            return ResponseEntity.ok(convertToDTO(updatedUser));
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        try {
            User user = userService.getUserByEmail(email);
            if (user != null) {
                return ResponseEntity.ok(convertToDTO(user));
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found with email: " + email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error deleting user: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/follow/{followId}")
    public ResponseEntity<Map<String, Object>> followUser(@PathVariable Long id, @PathVariable Long followId) {
        try {
            userService.followUser(id, followId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Followed user successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{id}/unfollow/{unfollowId}")
    public ResponseEntity<Map<String, Object>> unfollowUser(@PathVariable Long id, @PathVariable Long unfollowId) {
        try {
            userService.unfollowUser(id, unfollowId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Unfollowed user successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Helper method to convert User to UserDTO
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setUserRole(user.getUserRole());
        dto.setGender(user.getGender());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setContactNo(user.getContactNo());
        dto.setDOB(user.getDOB());

        dto.setFollowerIds(user.getFollowers().stream()
                .map(User::getId)
                .collect(Collectors.toSet()));

        dto.setFollowingIds(user.getFollowing().stream()
                .map(User::getId)
                .collect(Collectors.toSet()));

        return dto;
    }
}
