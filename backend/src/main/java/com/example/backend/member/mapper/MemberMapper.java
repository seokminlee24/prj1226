package com.example.backend.member.mapper;

import com.example.backend.member.dto.Member;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MemberMapper {
    @Insert("""
            INSERT INTO prj1126.member
            (member_id,password,name,nickname)
            VALUES (#{memberId}, #{password}, #{name},#{nickName})
            """)
    int insert(Member member);
}
