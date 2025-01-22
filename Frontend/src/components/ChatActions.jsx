import { Phone, Video } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const ChatActions = () => {
  const { startCall } = useChatStore();

  const handleVoiceCall = () => {
    startCall(false);
  };

  const handleVideoCall = () => {
    startCall(true);
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleVoiceCall}
        className="btn btn-circle btn-sm"
      >
        <Phone size={18} />
      </button>
      <button 
        onClick={handleVideoCall}
        className="btn btn-circle btn-sm"
      >
        <Video size={18} />
      </button>
    </div>
  );
};

export default ChatActions;
