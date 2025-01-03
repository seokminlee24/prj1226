import { Box, HStack, Textarea } from "@chakra-ui/react";
import { Button } from "../ui/button.jsx";
import { useContext, useState } from "react";
import { AuthenticationContext } from "../context/AuthenticationProvider.jsx";
import { IoIosSend } from "react-icons/io";
import { useTheme } from "../context/ThemeProvider.jsx";

export function CommentInput({ boardId, onSaveClick }) {
  const [comment, setComment] = useState("");
  const { isAuthenticated } = useContext(AuthenticationContext);
  const { fontColor, buttonColor } = useTheme();

  return (
    <Box>
      <HStack w={"100%"} mb={-3}>
        <Textarea
          value={comment}
          disabled={!isAuthenticated}
          placeholder={
            isAuthenticated
              ? "댓글을 입력해 주세요."
              : "로그인 후 댓글을 남겨주세요."
          }
          onChange={(e) => setComment(e.target.value)}
          h="70px" // 높이 설정
          border="1px solid" // 테두리 추가
          borderColor="gray.300" // 테두리 색상 설정
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              // Shift + Enter는 줄바꿈을 허용하고, Enter는 줄바꿈을 방지
              e.preventDefault();
              onSaveClick(comment);
              setComment(""); // 저장 후 댓글 비우기
            }
          }}
        />
        <Button
          h="70px"
          disabled={!isAuthenticated || !comment.trim()}
          onClick={() => {
            setComment("");
            onSaveClick(comment);
          }}
          variant={"surface"}
          colorPalette={"blue"}
          color={fontColor}
          fontWeight="bold"
          bg={buttonColor}
          _hover={{ bg: `${buttonColor}AA` }}
        >
          <IoIosSend />
        </Button>
      </HStack>
    </Box>
  );
}
