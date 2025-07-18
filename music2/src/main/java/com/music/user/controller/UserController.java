package com.music.user.controller;

import com.music.user.entity.User; // User 엔티티 경로
import com.music.user.service.UserService; // UserService 경로
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus; // HTTP 상태 코드
import org.springframework.http.ResponseEntity; // HTTP 응답을 커스터마이징하기 위함
import org.springframework.web.bind.annotation.*; // RestController, RequestMapping 등 어노테이션

import java.util.List;
import java.util.Optional;

@RestController // 이 클래스가 RESTful 웹 서비스의 컨트롤러임을 나타냅니다.
@RequestMapping("/api/users") // 이 컨트롤러의 모든 메서드는 "/api/users" 경로 아래에서 동작합니다.
public class UserController {

    private final UserService userService; // UserService 주입 (final + 생성자 주입 권장)

    // @Autowired는 필드 주입 방식입니다. 최근에는 생성자 주입이 더 권장됩니다.
    // 생성자 주입 예시:
    @Autowired // Lombok의 @RequiredArgsConstructor를 사용하면 이 생성자를 자동으로 만들어줍니다.
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 1. 사용자 생성 (CREATE)
    // HTTP POST 요청을 처리합니다. 클라이언트가 JSON 형태의 User 객체를 요청 본문에 담아 보냅니다.
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        // 클라이언트로부터 받은 User 객체를 서비스 계층으로 전달하여 저장합니다.
        User savedUser = userService.saveUser(user);
        // 저장된 User 객체와 함께 HTTP 201 Created 상태 코드를 반환합니다.
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    // 2. 모든 사용자 조회 (READ - All)
    // HTTP GET 요청을 처리합니다. 모든 사용자 목록을 반환합니다.
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        // 서비스 계층에서 모든 사용자 목록을 가져옵니다.
        List<User> users = userService.getAllUsers();
        // 사용자 목록과 함께 HTTP 200 OK 상태 코드를 반환합니다.
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // 3. ID로 사용자 조회 (READ - By ID)
    // HTTP GET 요청을 처리하며, 경로 변수 {id}로부터 사용자 ID를 받습니다.
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        // 서비스 계층에서 ID로 사용자를 조회합니다. Optional<User>를 반환합니다.
        Optional<User> user = userService.getUserById(id);
        // user.map(...)을 사용하여 Optional 내부의 User 객체가 존재하면 200 OK와 함께 반환하고,
        // 존재하지 않으면 404 Not Found 상태 코드를 반환합니다.
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // 4. 이메일로 사용자 조회 (READ - By Email)
    // HTTP GET 요청을 처리하며, 요청 파라미터 'email'로부터 이메일 주소를 받습니다.
    // 예: /api/users/by-email?email=test@example.com
    @GetMapping("/by-email")
    public ResponseEntity<User> getUserByEmail(@RequestParam String email) {
        // 서비스 계층에서 이메일로 사용자를 조회합니다. Optional<User>를 반환합니다.
        Optional<User> user = userService.getUserByEmail(email);
        // user.map(...)을 사용하여 Optional 내부의 User 객체가 존재하면 200 OK와 함께 반환하고,
        // 존재하지 않으면 404 Not Found 상태 코드를 반환합니다.
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // 5. 사용자 정보 수정 (UPDATE)
    // HTTP PUT 요청을 처리하며, 경로 변수 {id}로 수정할 사용자 ID를 받고,
    // 요청 본문에서 수정될 User 객체 정보를 받습니다.
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        // 먼저 해당 ID의 사용자가 존재하는지 확인합니다.
        Optional<User> existingUser = userService.getUserById(id);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // 요청받은 userDetails의 값으로 기존 사용자 정보 업데이트
            user.setEmail(userDetails.getEmail());
            user.setPassword(userDetails.getPassword());
            user.setNickname(userDetails.getNickname());
            user.setProfileImage(userDetails.getProfileImage());
            user.setVerified(userDetails.isVerified());
            // createdAt은 @PrePersist로 자동 설정되므로 수동 업데이트 불필요

            // 업데이트된 User 객체를 서비스 계층으로 전달하여 저장합니다.
            // saveUser 메서드가 내부적으로 UPDATE 쿼리를 실행합니다.
            User updatedUser = userService.saveUser(user);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } else {
            // 해당 ID의 사용자가 없으면 404 Not Found 반환
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // 6. 사용자 삭제 (DELETE)
    // HTTP DELETE 요청을 처리하며, 경로 변수 {id}로부터 삭제할 사용자 ID를 받습니다.
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable Long id) {
        try {
            // 서비스 계층에서 사용자를 삭제합니다.
            userService.deleteUser(id);
            // 삭제 성공 시 204 No Content 상태 코드를 반환합니다.
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            // 삭제 중 오류 발생 시 (예: 존재하지 않는 ID) 500 Internal Server Error 반환
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}