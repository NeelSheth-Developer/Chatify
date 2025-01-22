import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore.js"; // Fix the extension
import { Send, Phone, Video } from "lucide-react";
import Message from "./Message";
import CallModal from "./CallModal";
import CallHistory from "./CallHistory";
import toast from "react-hot-toast";

const Chat = () => {
  const { 
    selectedUser, 
    messages, 
    sendMessage, 
    getMessages, 
    subscribeToMessages, 
    unsubscribeFromMessages,
    isCallModalOpen,
    startCall,
    callHistory
  } = useChatStore();

  const messageRef = useRef();
  const chatContainerRef = useRef();

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = messageRef.current.value;
    if (!message.trim()) return;

    await sendMessage({ message });
    messageRef.current.value = "";
  };

  const handleVoiceCall = () => {
    try {
      startCall(false);
    } catch {
      toast.error("Could not start voice call");
    }
  };

  const handleVideoCall = () => {
    try {
      startCall(true);
    } catch {
      toast.error("Could not start video call");
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-center">
        <div className="space-y-2">
          <div className="text-3xl font-semibold">Welcome 👋</div>
          <p className="text-base-content/60">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="border-b border-base-300 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt="user avatar"
              />
            </div>
          </div>
          <div>
            <div className="font-medium">{selectedUser.name}</div>
            <div className="text-sm text-base-content/70">Online</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleVoiceCall} className="btn btn-circle btn-sm">
            <Phone size={18} />
          </button>
          <button onClick={handleVideoCall} className="btn btn-circle btn-sm">
            <Video size={18} />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Combine messages and call history in chronological order */}
        {[
          ...messages.map(msg => ({ type: 'message', data: msg, timestamp: new Date(msg.createdAt) })),
          ...callHistory
            .filter(call => call.userId === selectedUser._id)
            .map(call => ({ type: 'call', data: call, timestamp: new Date(call.timestamp) }))
        ]
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((item, index) => (
            <div key={`${item.type}-${index}`}>
              {item.type === 'message' ? (
                <Message message={item.data} />
              ) : (
                <CallHistory call={item.data} />
              )}
            </div>
          ))}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-base-300">
        <div className="flex items-center gap-2">
          <input
            ref={messageRef}
            type="text"
            className="input input-bordered flex-1"
            placeholder="Type a message..."
          />
          <button type="submit" className="btn btn-circle btn-primary">
            <Send size={18} />
          </button>
        </div>
      </form>

      {/* Call Modal */}
      {isCallModalOpen && (
        <CallModal
          isVideo={useChatStore.getState().isVideoCall}
          onClose={() => useChatStore.getState().endCall()}
          selectedUser={selectedUser}
        />
      )}
    </div>
  );
};

export default Chat;
