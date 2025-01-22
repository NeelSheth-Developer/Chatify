import { Phone, Video } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../../public/useChatStore";

const ChatHeader = () => {
  const { selectedUser, startCall } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser?._id);

  return (
    <div className="border-b border-base-300 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="w-12 h-12 rounded-full relative">
            <img
              src={selectedUser?.profilePic || "/user.png"}
              alt="user avatar"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></span>
            )}
          </div>
        </div>
        <div>
          <h3 className="font-medium">{selectedUser?.name}</h3>
          <p className="text-xs text-base-content/70">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => startCall(false)}
          className="btn btn-ghost btn-circle"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          onClick={() => startCall(true)}
          className="btn btn-ghost btn-circle"
        >
          <Video className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;