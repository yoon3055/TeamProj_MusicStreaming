package com.music;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@Slf4j
public class MusicApplication {

	public static void main(String[] args) {
		log.info("=== [MAIN_APP] 음악 애플리케이션 시작 ===");
		SpringApplication.run(MusicApplication.class, args);
	}
}
