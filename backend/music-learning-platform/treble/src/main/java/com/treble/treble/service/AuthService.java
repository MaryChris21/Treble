package com.treble.treble.service;

import com.treble.treble.model.User;
import com.treble.treble.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User authenticateUser(String email, String rawPassword) {
        User user = userRepository.findByEmail(email);

        if (user == null || user.getPassword() == null) {
            return null;
        }

        if (passwordEncoder.matches(rawPassword, user.getPassword())) {
            return user;
        }

        return null;
    }
}
