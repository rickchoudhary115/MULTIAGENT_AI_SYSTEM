
import React, { useEffect } from "react";
import MessageList from "./MessageList";
import Nav from "./Nav";
import ChatInput from "./ChatInput";
import { useDispatch, useSelector } from "react-redux";
import getMessages from "../features/getMessages";
import { setArtifacts, setmessage } from "../redux/messageSlice";

function ChatArea() {
  const { selectedConversation } = useSelector(
    (state) => state.conversation
  );

  const dispatch = useDispatch();

  useEffect(() => {
    const getMsg = async () => {
      if (!selectedConversation?._id) return;

      try {
       if( selectedConversation.title == "New Conversation") return;
        const data = await getMessages(selectedConversation?._id);
        console.log(data)

        dispatch(setmessage(data));
        const latestArtifactMessage=[...data].reverse().find(msg=>msg.artifacts && msg.artifacts.length>0)
        dispatch(setArtifacts(latestArtifactMessage?.artifacts || []));
      } catch (error) {
        console.log("Error fetching messages:", error);
      }
    };

    getMsg();
  }, [selectedConversation?._id, dispatch]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Nav />
      <MessageList />
      <ChatInput />
    </div>
  );
}

export default ChatArea;

