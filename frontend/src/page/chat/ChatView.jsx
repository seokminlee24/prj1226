import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  Stack,
} from "@chakra-ui/react";
import "./chat.css";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Field } from "../../components/ui/field.jsx";
import { Client } from "@stomp/stompjs";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AuthenticationContext } from "../../components/context/AuthenticationProvider.jsx";

export function ChatView() {
  const scrollRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [message, setMessage] = useState([]);
  const [clientMessage, setClientMessage] = useState("");
  const [chatRoom, setChatRoom] = useState({});
  const [stompClient, setStompClient] = useState(null);
  const { roomId } = useParams();
  const [isloading, setIsloading] = useState(false);
  const [page, setPage] = useState(1);
  const { id } = useContext(AuthenticationContext);

  //  상품명, 방 번호 , 작성자를 보여줄

  //  stomp 객체 생성 및, 연결
  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/wschat",
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },

      onConnect: () => {
        client.subscribe("/room/" + roomId, function (message) {
          const a = JSON.parse(message.body);
          setMessage((prev) => [
            ...prev,
            { sender: a.sender, content: a.content },
          ]);
        });
      },
      onStompError: (err) => {
        console.error(err);
      },
      heartbeatIncoming: 5000,
      heartbeatOutgoing: 5000,
      reconnectDelay: 1000,
    });
    setStompClient(client);
    client.activate();
  }, []);

  // 의존성에  message 넣어야함
  useEffect(() => {
    loadInitialMessages();
    // chatroom 정보
    handleSetData();
  }, []);

  function handleSetData() {
    // 전체 데이터 가져오는 코드
    axios
      .get(`/api/chat/view/${roomId}`)
      .then((res) => {
        setChatRoom(res.data);
      })
      .catch((e) => {});
  }

  // Todo 타임 스탬프 mdn에서 하나 얻어와야함
  function sendMessage(sender, content) {
    const a = {
      sender: sender,
      content: content,
      sentAt: new Date().toISOString().slice(0, 19),
    };
    if (stompClient && stompClient.connected)
      stompClient.publish({
        destination: "/send/" + roomId,
        body: JSON.stringify(a),
      });

    setClientMessage("");
  }

  // 초기 메세지 로딩
  const loadInitialMessages = async () => {
    setIsloading(true);
    try {
      const response = await axios.get(`/api/chat/view/${roomId}/messages`, {
        params: { page },
      });

      // 2
      setPage((prev) => prev + 1);
      const initialMessages = response.data || [];
      setMessage(initialMessages.reverse());

      // 스크롤을 하단으로 이동
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    } catch (error) {
      console.error("메시지 로딩 중 오류:", error);
    } finally {
      setIsloading(false);
    }
  };

  const loadPreviousMessage = async () => {
    if (isloading || !hasMore) return;

    setIsloading(true);
    try {
      const response = await axios.get(`/api/chat/view/${roomId}/messages`, {
        params: {
          page,
        },
      });
      const newMessages = response.data.content.reverse();

      if (newMessages.length > 0) {
        setMessage((prev) => [...newMessages, ...prev]);
        setPage((prev) => prev + 1);
      } else {
        // 더이상 불러올 메시기  x
        setHasMore(false);
      }
    } catch (error) {
      console.log("이전 메시지 로딩 중 오류 ", error);
    } finally {
      setIsloading(false);
    }
  };

  const handleScroll = async () => {
    const chatBox = chatBoxRef.current;
    if (chatBox.scrollTop === 0) {
      // 스크롤 끝 점에서 로드
      loadPreviousMessage();
    }
  };

  return (
    <Box>
      <Heading mx={"auto"}>
        {" "}
        {roomId} 번 채팅 화면입니다. <hr />
      </Heading>
      <Box mx={"auto"}>상품명: {chatRoom.productName} </Box>

      <Flex
        direction="column"
        w={600}
        h={700}
        bg={"blue.300/50"}
        overflow={"hidden"}
      >
        <Box mx={"auto"} my={3} variant={"outline"} h={"5%"} pr={2}>
          {/*판매자 닉네임이 항상 */}
          판매자 닉네임: {chatRoom.nickname}
        </Box>
        <Box h={"85%"} overflowY={"auto"}>
          <Box
            ref={chatBoxRef}
            onScroll={handleScroll}
            h={"100%"}
            overflowY={"scroll"}
          >
            {message.map((message, index) => (
              <Box mx={2} my={1} key={index}>
                <Flex
                  justifyContent={
                    message.sender === id ? "flex-end" : "flex-start"
                  }
                >
                  <Stack h={"10%"}>
                    <Badge p={1} size={"lg"} key={index} color="primary">
                      {message.content}
                    </Badge>
                    <p style={{ fontSize: "12px" }}>
                      {new Date(message.sentAt).toLocaleTimeString()}
                    </p>
                    <div ref={scrollRef}></div>
                  </Stack>
                </Flex>
              </Box>
            ))}
          </Box>
        </Box>
        <HStack>
          <Field>
            <Input
              bg={"gray.300"}
              type={"text"}
              value={clientMessage}
              onChange={(e) => {
                setClientMessage(e.target.value);
              }}
            />
          </Field>
          <Button
            variant={"outline"}
            onClick={() => {
              // 세션의 닉네임
              var client = id;
              var message = clientMessage;
              sendMessage(client, message);
            }}
          >
            전송
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}