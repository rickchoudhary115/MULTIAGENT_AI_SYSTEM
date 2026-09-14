
import React, { useEffect } from "react";
import MessageList from "./MessageList";
import Nav from "./Nav";
import ChatInput from "./ChatInput";
import { useDispatch, useSelector } from "react-redux";
import getMessages from "../features/getMessages";
import { setmessage } from "../redux/messageSlice";

function ChatArea() {
  const { selectedConversation } = useSelector(
    (state) => state.conversation
  );

  const dispatch = useDispatch();

  useEffect(() => {
    const getMsg = async () => {
      if (!selectedConversation?._id) return;

      try {
        const data = await getMessages(selectedConversation._id);

        console.log("MESSAGES FROM API:", data);

        dispatch(setmessage(data));
      } catch (error) {
        console.log("Error fetching messages:", error);
      }
    };

    getMsg();
  }, [selectedConversation, dispatch]);

  return (
    <div className="flex-1 flex flex-col">
      <Nav />
      <MessageList />
      <ChatInput />
    </div>
  );
}

export default ChatArea;

