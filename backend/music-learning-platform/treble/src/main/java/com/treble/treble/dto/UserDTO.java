package com.treble.treble.dto;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private LocalDate DOB;
    private String userRole;
    private Integer contactNo;
    private String email;
    private String gender;
    private String profilePictureUrl;
    private Set<Long> followerIds = new HashSet<>();
    private Set<Long> followingIds = new HashSet<>();

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public LocalDate getDOB() {
        return DOB;
    }

    public void setDOB(LocalDate DOB) {
        this.DOB = DOB;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public Integer getContactNo() {
        return contactNo;
    }

    public void setContactNo(Integer contactNo) {
        this.contactNo = contactNo;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public Set<Long> getFollowerIds() {
        return followerIds;
    }

    public void setFollowerIds(Set<Long> followerIds) {
        this.followerIds = followerIds;
    }

    public Set<Long> getFollowingIds() {
        return followingIds;
    }

    public void setFollowingIds(Set<Long> followingIds) {
        this.followingIds = followingIds;
    }
}
