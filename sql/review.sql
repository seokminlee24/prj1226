CREATE TABLE review
(
    review_id     INT PRIMARY KEY AUTO_INCREMENT,
    product_id    INT         REFERENCES product (product_id) ON DELETE SET NULL, # 상품 삭제해도 후기는 남게
    product_name  VARCHAR(50),
    buyer_id      VARCHAR(50) REFERENCES member (member_id) ON DELETE SET NULL,
    buyer_name    VARCHAR(50),                                                    # 작성자 삭제 시 알수없음 표시
    review_text   TEXT        NOT NULL,
    rating        INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
    seller_id     VARCHAR(50),
    price         INT,
    review_status ENUM ('uncompleted', 'completed') DEFAULT 'uncompleted',
    created_at    DATE                              DEFAULT CURRENT_DATE
);

# product_name, price 는 상품 삭제돼도 어떤 상품인지 정보 보여주기

# 테스트용 코드
# 작성한 후기
INSERT INTO review (product_id, product_name, buyer_id, buyer_name, review_text, rating, seller_id, price,
                    review_status)
VALUES (48, '구매함', 'sm@naver.com', 'sm', '좋은 거래였습니다.',
        5, '111@zz.zz', 5999, 'completed');

# 받은 후기
INSERT INTO review (product_id, product_name, buyer_id, buyer_name, review_text, rating, seller_id, price,
                    review_status)
VALUES (29, 'mk 판매', 'mk@naver.com', 'mk', '좋은 거래였습니다.',
        4, 'sm@naver.com', 111111, 'completed');

# 삭제 시 null로 수정
ALTER TABLE review
    ADD CONSTRAINT fk_product FOREIGN KEY (seller_id)
        REFERENCES member (member_id) ON DELETE SET NULL;