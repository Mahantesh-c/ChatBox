package com.chatapp.service;

import com.chatapp.dto.AuthResponse;
import com.chatapp.dto.LoginRequest;
import com.chatapp.dto.RegisterRequest;
import com.chatapp.entity.User;
import com.chatapp.repository.UserRepository;
import com.chatapp.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class AuthService {

        private final UserRepository repository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        public AuthService(UserRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService,
                        AuthenticationManager authenticationManager) {
                this.repository = repository;
                this.passwordEncoder = passwordEncoder;
                this.jwtService = jwtService;
                this.authenticationManager = authenticationManager;
        }

        public AuthResponse register(RegisterRequest request) {
                // Validate input
                if (request.getUsername() == null || request.getUsername().isBlank()) {
                        throw new IllegalArgumentException("Username is required.");
                }
                if (request.getEmail() == null || request.getEmail().isBlank()) {
                        throw new IllegalArgumentException("Email is required.");
                }
                if (request.getPassword() == null || request.getPassword().length() < 6) {
                        throw new IllegalArgumentException("Password must be at least 6 characters.");
                }

                // Check for duplicate username
                if (repository.findByUsername(request.getUsername()).isPresent()) {
                        throw new IllegalArgumentException(
                                        "Username '" + request.getUsername() + "' is already taken.");
                }

                // Check for duplicate email
                if (repository.findByEmail(request.getEmail()).isPresent()) {
                        throw new IllegalArgumentException(
                                        "An account with email '" + request.getEmail() + "' already exists.");
                }

                var user = User.builder()
                                .username(request.getUsername())
                                .email(request.getEmail())
                                .fullName(request.getFullName())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(User.Role.USER)
                                .online(false)
                                .build();
                repository.save(user);
                var jwtToken = jwtService.generateToken(new org.springframework.security.core.userdetails.User(
                                user.getUsername(),
                                user.getPassword(),
                                Collections.emptyList()));
                return AuthResponse.builder()
                                .token(jwtToken)
                                .username(user.getUsername())
                                .build();
        }

        public AuthResponse login(LoginRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getUsername(),
                                                request.getPassword()));
                var user = repository.findByUsername(request.getUsername())
                                .orElseThrow();
                var jwtToken = jwtService.generateToken(new org.springframework.security.core.userdetails.User(
                                user.getUsername(),
                                user.getPassword(),
                                Collections.emptyList()));
                return AuthResponse.builder()
                                .token(jwtToken)
                                .username(user.getUsername())
                                .build();
        }
}
