import { PhoneOff, VideoOff, Video, Mic, MicOff } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore.js";

const CallModal = ({ isVideo, onClose, selectedUser }) => {
  const { localStream, remoteStream, callDuration } = useChatStore();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleMuteToggle = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleVideoToggle = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-base-300/80 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl max-w-4xl w-full p-6 shadow-xl">
        <div className="flex flex-col items-center gap-6">
          {/* User Avatar */}
          <div className="avatar">
            <div className="w-24 h-24 rounded-full ring ring-primary">
              <img src={selectedUser?.profilePic || "/user.png"} alt="user avatar" />
            </div>
          </div>

          {/* Call Status with Timer */}
          <div className="text-center">
            <h3 className="text-xl font-semibold">{selectedUser?.name}</h3>
            <p className="text-base-content/70">
              {remoteStream 
                ? formatTime(callDuration)
                : isVideo ? "Video calling..." : "Calling..."}
            </p>
          </div>

          {/* Video Containers */}
          {isVideo && (
            <div className="relative w-full aspect-video bg-base-300 rounded-xl overflow-hidden mb-4">
              {/* Remote Video (Large) */}
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              
              {/* Local Video (Small) */}
              <div className="absolute bottom-4 right-4 w-48 aspect-video bg-base-300 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover mirror"
                  autoPlay
                  playsInline
                  muted
                />
              </div>
            </div>
          )}

          {/* Call Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleMuteToggle}
              className={`btn btn-circle btn-lg ${
                isMuted ? "btn-error" : "btn-neutral"
              }`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            <button
              onClick={onClose}
              className="btn btn-circle btn-lg btn-error"
            >
              <PhoneOff size={24} />
            </button>

            {isVideo && (
              <button
                onClick={handleVideoToggle}
                className={`btn btn-circle btn-lg ${
                  isVideoOff ? "btn-error" : "btn-neutral"
                }`}
              >
                {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
