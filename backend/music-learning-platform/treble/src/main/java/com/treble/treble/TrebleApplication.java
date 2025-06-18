package com.treble.treble;

import com.treble.treble.service.FileStorageService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class TrebleApplication {

	public static void main(String[] args) {
		SpringApplication.run(TrebleApplication.class, args);
	}

	@Bean
	CommandLineRunner init(FileStorageService fileStorageService) {
		return (args) -> {
			// Initialize the file storage
			fileStorageService.init();
		};
	}
}
