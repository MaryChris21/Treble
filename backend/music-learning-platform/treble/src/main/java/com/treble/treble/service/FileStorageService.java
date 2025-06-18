package com.treble.treble.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("Created upload directory at: " + uploadPath);
            } else {
                System.out.println("Using existing upload directory at: " + uploadPath);
                // Ensure it's writable
                if (!Files.isWritable(uploadPath)) {
                    System.err.println("WARNING: Upload directory is not writable: " + uploadPath);
                }
            }
        } catch (IOException e) {
            System.err.println("Failed to initialize storage: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    public String storeFile(MultipartFile file) throws IOException {
        try {
            if (file == null || file.isEmpty()) {
                throw new IOException("Failed to store empty file");
            }

            // Create the upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            System.out.println("Upload directory: " + uploadPath);

            // Generate a unique file name
            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null) {
                originalFileName = "unknown.jpg";
            }

            String fileExtension = "";
            if (originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            String fileName = UUID.randomUUID().toString() + fileExtension;

            // Copy the file to the target location
            Path targetLocation = uploadPath.resolve(fileName);
            System.out.println("Saving file to: " + targetLocation);

            // Ensure the parent directory exists
            Files.createDirectories(targetLocation.getParent());

            // Copy the file
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("File saved successfully to: " + targetLocation);

            return fileName;
        } catch (IOException e) {
            System.err.println("Failed to store file: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public boolean deleteFile(String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
            return Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            ex.printStackTrace();
            return false;
        }
    }

    public Path getFilePath(String fileName) {
        return Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
    }
}
