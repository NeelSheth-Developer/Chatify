import { useAuthStore } from "../store/useAuthStore";
import { Download } from "lucide-react";
import { downloadImage } from "../lib/utils";

const Message = ({ message }) => {
  const { authUser } = useAuthStore();
  const fromMe = message.senderId === authUser._id;

  return (
    <div className={`chat ${fromMe ? "chat-end" : "chat-start"}`}>
      <div className="chat-bubble flex flex-col gap-1">
        {message.text && <span>{message.text}</span>}
        {message.image && (
          <div className="relative group">
            <img
              src={message.image}
              alt="Message"
              className="max-w-[200px] rounded-md"
            />
            <button
              onClick={() => downloadImage(message.image)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              hover:bg-black/75"
              title="Download image"
            >
              <Download size={16} className="text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
