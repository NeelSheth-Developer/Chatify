import { useChatStore } from "../store/useChatStore.js";
import { Phone, Video, PhoneOff } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const CallNotification = () => {
  const { isIncomingCall, caller, isVideoCall, acceptCall } = useChatStore();
  const { socket } = useAuthStore();

  if (!isIncomingCall || !caller) {
    return null;
  }

  const handleAccept = async () => {
    try {
      await acceptCall();
    } catch {
      toast.error("Failed to accept call");
    }
  };

  const handleDecline = () => {
    socket.emit("declineCall", { to: caller._id });
    useChatStore.getState().endCall();
  };

  console.log("Rendering notification for:", { caller, isVideoCall }); // Debug log

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-left">
      <div className="bg-base-200 p-4 rounded-lg shadow-xl flex items-center gap-4 min-w-80">
        <img
          src={caller.profilePic || "/avatar.png"}
          alt="caller"
          className="w-12 h-12 rounded-full"
        />
        
        <div className="flex-1">
          <h3 className="font-medium">{caller.name}</h3>
          <p className="text-sm text-base-content/70">
            Incoming {isVideoCall ? "video" : "voice"} call...
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="btn btn-circle btn-sm btn-success"
          >
            {isVideoCall ? <Video size={18} /> : <Phone size={18} />}
          </button>
          
          <button
            onClick={handleDecline}
            className="btn btn-circle btn-sm btn-error"
          >
            <PhoneOff size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;
