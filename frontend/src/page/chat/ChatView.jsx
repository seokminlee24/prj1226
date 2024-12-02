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
import React, { useEffect, useState } from "react";
import { Field } from "../../components/ui/field.jsx";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import { useParams } from "react-router-dom";

export function ChatView() {
  // 메시지에는 보낸사람:아이디 , 메시지 :내용이 들어가야함 (stomp 에 보낼 내용)
  const [message, setMessage] = useState([]);
  const [clientMessage, setClientMessage] = useState("");
  const [chatRoom, setChatRoom] = useState({});
  const [stompClient, setStompClient] = useState(null);
  const { id } = useParams();

  //  상품명, 방 번호 , 작성자를 보여줄

  //  stomp 객체 생성 및, 연결
  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/wschat",
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },

      onConnect: () => {
        client.subscribe("/room/" + id, function (message) {
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

  useEffect(() => {
    axios
      .get(`/api/chat/view/${id}`)
      .then((res) => {
        setChatRoom(res.data);
        setMessage(res.data.messages);
      })
      .catch((e) => {});
  }, []);

  //  뭐냐  타임 스탬프 mdn에서 하나 얻어와야함
  function sendMessage(sender, content) {
    const a = {
      sender: sender,
      content: content,
    };
    if (stompClient && stompClient.connected)
      stompClient.publish({
        destination: "/send/" + id,
        body: JSON.stringify(a),
      });

    setClientMessage("");
  }

  return (
    <Box>
      <Heading mx={"auto"}>
        {" "}
        {id} 번 채팅 화면입니다. <hr />
      </Heading>
      <Box mx={"auto"}>상품명: {chatRoom.productName} </Box>
      <Flex h={"80%"} bg={"blue.300/50"}>
        <Flex direction="column" h={500} w={800}>
          <Box mx={"auto"} my={3} variant={"outline"}>
            {/*판매자 닉네임이 항상 */}
            판매자 닉네임: {chatRoom.nickname}
          </Box>
          <Box h={"70%"}>
            {message.map((message, index) => (
              <Box
                display={"flex"}
                mx={2}
                my={1}
                justify={
                  message.sender === "client" ? "flex-start" : "flex-end"
                }
              >
                <Stack>
                  <Badge p={1} size={"lg"} key={index} color="primary">
                    {message.content}
                  </Badge>

                  <p style={{ fontSize: "12px" }}>
                    {" "}
                    {new Date(message.sentAt).toLocaleTimeString()}
                  </p>
                </Stack>
              </Box>
            ))}
          </Box>
        </Flex>
      </Flex>
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
            var client = "server";
            var message = clientMessage;
            sendMessage(client, message);
          }}
        >
          전송
        </Button>
      </HStack>
    </Box>
  );
}
