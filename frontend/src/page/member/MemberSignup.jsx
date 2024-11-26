import { useState } from "react";
import { Box, Input, Stack } from "@chakra-ui/react";
import { Field } from "../../components/ui/field.jsx";
import { Button } from "../../components/ui/button.jsx";
import axios from "axios";

export function MemberSignup() {
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [nickName, setNickName] = useState("");

  function handleSaveClick() {
    axios
      .post("/api/member/signup", { memberId, password, name, nickName })
      .then((res) => {
        console.log("잘됨, 페이지 이동, 토스트 출력");
      })
      .catch((e) => {
        console.log("안됐을 때 해야하는 일, 토스트 출력");
      })
      .finally(() => {
        console.log("성공이든 실패든 무조건 실행");
      });
  }

  return (
    <Box>
      <h3>회원 가입</h3>
      <Stack gap={5}>
        <Field label={"아이디"} placehold>
          <Input
            value={memberId}
            placeholder="아메일를 입력하세요"
            onChange={(e) => {
              setMemberId(e.target.value);
            }}
          />
        </Field>
        <Field label={"암호"} placehold>
          <Input
            value={password}
            placeholder="암호를 입력하세요"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </Field>
        <Field label={"이름"} placehold>
          <Input
            value={name}
            placeholder="이름을 입력하세요"
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </Field>
        <Field label={"별명"} placehold>
          <Input
            value={nickName}
            placeholder="이름을 입력하세요"
            onChange={(e) => {
              setNickName(e.target.value);
            }}
          />
        </Field>
        <Button onClick={handleSaveClick}>저장</Button>
      </Stack>
    </Box>
  );
}
