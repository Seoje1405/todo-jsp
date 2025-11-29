-- 1. 기존 DB가 있다면 삭제하고 새로 생성 (초기화용)
-- 2. 한글과 이모지를 지원하는 utf8mb4로 데이터베이스 생성
CREATE DATABASE todo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE todo;

-- 3. 사용자 테이블
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(50) NOT NULL
);

-- 테스트 계정 추가
INSERT INTO users VALUES ('test', '1234'); 

-- 4. 투두 리스트 테이블
CREATE TABLE todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    content VARCHAR(200) NOT NULL,
    status ENUM('TODO', 'DONE') DEFAULT 'TODO',
    seq INT DEFAULT 0 COMMENT '드래그 정렬 순서',
    memo TEXT COMMENT '상세 메모',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 외래키 설정 (유저 삭제 시 할 일도 같이 삭제)
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- 5. 데이터 확인
SELECT * FROM users;
SELECT * FROM todos;

delete from users;
delete from todos;