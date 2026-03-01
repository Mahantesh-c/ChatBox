package com.chatapp.controller;

import com.chatapp.entity.User;
import com.chatapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** List all users for the chat sidebar (excludes email/password). */
    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserResponse(u.getUsername(), u.getFullName(), u.isOnline(), u.getProfilePicture()))
                .collect(Collectors.toList());
    }

    /** My full profile — includes email and role. */
    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(Principal principal) {
        if (principal == null)
            return ResponseEntity.status(401).build();
        return userRepository.findByUsername(principal.getName())
                .map(u -> ResponseEntity.ok(new ProfileResponse(
                        u.getUsername(), u.getFullName(), u.getEmail(),
                        u.getRole().name(), u.isOnline(), u.getProfilePicture())))
                .orElse(ResponseEntity.notFound().build());
    }

    /** Public profile of any user — used in the contact detail panel. */
    @GetMapping("/{username}")
    public ResponseEntity<ContactResponse> getUserDetail(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .map(u -> ResponseEntity.ok(new ContactResponse(
                        u.getUsername(), u.getFullName(), u.isOnline(), u.getProfilePicture())))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Upload / update profile picture.
     * Accepts JSON: { "picture": "data:image/jpeg;base64,..." }
     */
    @PutMapping("/me/picture")
    public ResponseEntity<Map<String, String>> uploadPicture(
            @RequestBody Map<String, String> body,
            Principal principal) {
        if (principal == null)
            return ResponseEntity.status(401).build();
        String picture = body.get("picture");
        if (picture == null || picture.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "No picture provided."));

        return userRepository.findByUsername(principal.getName())
                .map(u -> {
                    u.setProfilePicture(picture);
                    userRepository.save(u);
                    return ResponseEntity.ok(Map.of("message", "Profile picture updated."));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Records ─────────────────────────────────────────────────────────────
    public record UserResponse(String username, String fullName, boolean online, String profilePicture) {
    }

    public record ProfileResponse(
            String username, String fullName, String email,
            String role, boolean online, String profilePicture) {
    }

    public record ContactResponse(
            String username, String fullName, boolean online, String profilePicture) {
    }
}
