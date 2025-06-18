package com.treble.treble.service;

import com.treble.treble.model.User;
import com.treble.treble.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(User user) {
        // Check for duplicate email
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }

        // Encode password if present and not already encoded
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        // Set default first name if missing
        if (user.getFirstName() == null) {
            user.setFirstName("User");
        }

        // Set default role as user
        if (user.getUserRole() == null) {
            user.setUserRole("user");
        }

        return userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User updateUser(Long id, User user) {
        User existing = getUserById(id);

        if (user.getFirstName() != null) existing.setFirstName(user.getFirstName());
        if (user.getLastName() != null) existing.setLastName(user.getLastName());
        if (user.getEmail() != null) existing.setEmail(user.getEmail());

        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            existing.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        if (user.getGender() != null) existing.setGender(user.getGender());
        if (user.getProfilePictureUrl() != null) existing.setProfilePictureUrl(user.getProfilePictureUrl());
        if (user.getDOB() != null) existing.setDOB(user.getDOB());
        if (user.getContactNo() != null) existing.setContactNo(user.getContactNo());
        if (user.getUserRole() != null) existing.setUserRole(user.getUserRole());

        return userRepository.save(existing);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public void followUser(Long id, Long followId) {
        User user = getUserById(id);
        User toFollow = getUserById(followId);

        if (!user.getFollowing().contains(toFollow)) {
            user.getFollowing().add(toFollow);
            toFollow.getFollowers().add(user);

            userRepository.save(user);
            userRepository.save(toFollow);
        }
    }

    public void unfollowUser(Long id, Long unfollowId) {
        User user = getUserById(id);
        User toUnfollow = getUserById(unfollowId);

        if (user.getFollowing().contains(toUnfollow)) {
            user.getFollowing().remove(toUnfollow);
            toUnfollow.getFollowers().remove(user);

            userRepository.save(user);
            userRepository.save(toUnfollow);
        }
    }
}