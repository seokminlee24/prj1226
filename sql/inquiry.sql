CREATE TABLE inquiry
(
    inquiry_id INT PRIMARY KEY AUTO_INCREMENT,
    title      VARCHAR(255)  NOT NULL,
    content    VARCHAR(1000) NOT NULL,
    member_id  VARCHAR(50)   NOT NULL REFERENCES member (member_id),
    answer     VARCHAR(1000),
    inserted   DATE DEFAULT CURRENT_DATE
);

DROP TABLE inquiry;

INSERT INTO inquiry (title, content, member_id, answer, inserted)
VALUES ('사용법 문의', '이 웹사이트를 어떻게 사용하는지 궁금합니다.', 'coogie@naver.com', NULL, CURRENT_DATE);

INSERT INTO inquiry (title, content, member_id, answer, inserted)
VALUES ('기타 문의', '닉네임 수정 가능한가요?.', 'sm@naver.com', NULL, CURRENT_DATE);

INSERT INTO inquiry (title, content, member_id, answer, inserted)
VALUES ('탈퇴 문의', '탈퇴하고싶은데 어떻게 하나요?', 'sm@naver.com', NULL, CURRENT_DATE);

SELECT *
FROM inquiry;