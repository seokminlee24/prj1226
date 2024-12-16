import { Box, Input, Spinner, Stack } from "@chakra-ui/react";
import { Field } from "../../components/ui/field.jsx";
import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../../components/context/AuthenticationProvider.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  DialogActionTrigger,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog.jsx";
import { Button } from "../../components/ui/button.jsx";
import { toaster } from "../../components/ui/toaster.jsx";
import { kakaoUnlink } from "../../components/kakao/KakaoLogin.jsx";

// 카카오 계정 연결 해제 함수 추가

export function Profile({ onEditClick }) {
  const [member, setMember] = useState(null);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // 이메일 상태 추가
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { id } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      return;
    }
    setLoading(true);

    axios
      .get(`/api/member/${id}`)
      .then((res) => setMember(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  function handleDeleteClick() {
    // 카카오 사용자의 경우 이메일로 탈퇴 처리
    const data = member.password
      ? { memberId: id, password }
      : { memberId: id, email };

    axios
      .delete("/api/member/remove", {
        data: { memberId: id, password },
      })
      .then((res) => {
        const message = res.data.message;

        // 카카오 계정 연결 해제
        kakaoUnlink()
          .then(() => {
            console.log("카카오 계정 연결 해제 성공");
          })
          .catch((error) => {
            console.error("카카오 계정 연결 해제 실패:", error);
          });

        toaster.create({
          type: message.type,
          description: message.text,
        });
        navigate("/member/signup");
      })
      .catch((e) => {
        const message = e.response.data.message;

        toaster.create({
          type: message.type,
          description: message.text,
        });
      })
      .finally(() => {
        setOpen(false);
        setPassword("");
        setEmail("");
      });
  }

  if (loading || !id || !member) {
    return <Spinner />;
  }

  return (
    <Box>
      <h3>회원 정보</h3>
      <Stack gap={5}>
        <Field label={"아이디"}>
          <Input readOnly value={id} />
        </Field>
        {member.password && (
          <Field label={"암호"}>
            <Input readOnly value={member.password} />
          </Field>
        )}
        <Field label={"별명"}>
          <Input readOnly value={member.nickname} />
        </Field>
        <Field label={"가입일시"}>
          <Input type={"date"} readOnly value={member.inserted.split("T")[0]} />
        </Field>
        <Box>
          <Button onClick={onEditClick}>수정</Button>
          <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
            <DialogTrigger asChild>
              <Button colorPalette={"red"}>탈퇴</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>탈퇴 확인</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <Stack gap={5}>
                  {member.password ? (
                    <Field label={"암호"}>
                      <Input
                        placeholder={"암호를 입력해주세요."}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </Field>
                  ) : (
                    <Field label={"이메일"}>
                      <Input
                        placeholder={"카카오 이메일을 입력해주세요."}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Field>
                  )}
                </Stack>
              </DialogBody>
              <DialogFooter>
                <DialogActionTrigger>
                  <Button variant={"outline"}>취소</Button>
                </DialogActionTrigger>
                <Button colorPalette={"red"} onClick={handleDeleteClick}>
                  탈퇴
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>
        </Box>
      </Stack>
    </Box>
  );
}
