package com.music;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Bean;
import com.music.music.controller.SongController;
import com.music.music.service.SongService;
import com.music.music.repository.SongRepository;
import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@ComponentScan(basePackages = {"com.music", "com.music.music"})
@Slf4j
public class MusicApplication {

	public static void main(String[] args) {
		SpringApplication.run(MusicApplication.class, args);
	}

	@Bean
	public SongService songService(SongRepository songRepository) {
		log.info("=== [MAIN_APP] Creating SongService Bean ===");
		return new SongService(songRepository);
	}

	@Bean
	public SongController songController(SongService songService) {
		log.info("=== [MAIN_APP] Creating SongController Bean ===");
		return new SongController(songService);
	}
}
