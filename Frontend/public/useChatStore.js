import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../src/lib/axios";
import { useAuthStore } from "../src/store/useAuthStore";
import { playRingtone, playCallEndSound } from '../src/sounds';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  searchQuery: "",
  filteredUsers: [],
  isCallModalOpen: false,
  isVideoCall: false,
  isIncomingCall: false,
  caller: null,
  localStream: null,
  remoteStream: null,
  peerConnection: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  setSearchQuery: (query) => {
    const users = get().users;
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase())
    );
    set({ 
      searchQuery: query,
      filteredUsers: filtered
    });
  },
  
  clearSearch: () => {
    set({ 
      searchQuery: "",
      filteredUsers: []
    });
  },

  handleIncomingCall: (data) => {
    const { caller, isVideo } = data;
    const ringtone = playRingtone();
    if (ringtone) {
      ringtone.play().catch(error => {
        console.error('Error playing ringtone:', error);
      });
    }
    set({ 
      isIncomingCall: true, 
      caller,
      isVideoCall: isVideo,
      ringtone 
    });
  },

  startCall: async (isVideo = false) => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true
      });

      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        set({ remoteStream: event.streams[0] });
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const socket = useAuthStore.getState().socket;
          socket.emit("iceCandidate", {
            to: selectedUser._id,
            candidate: event.candidate
          });
        }
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const socket = useAuthStore.getState().socket;
      socket.emit("startCall", {
        to: selectedUser._id,
        isVideo,
        offer
      });

      set({ 
        isCallModalOpen: true,
        isVideoCall: isVideo,
        localStream: stream,
        peerConnection,
        isCameraOff: false,
        isMicOff: false
      });

    } catch (error) {
      toast.error("Could not access camera/microphone");
      console.error(error);
    }
  },

  toggleCamera: () => {
    const { localStream, isVideoCall } = get();
    if (!localStream || !isVideoCall) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      const isEnabled = videoTrack.enabled;
      videoTrack.enabled = !isEnabled;
      set({ isCameraOff: isEnabled });
    }
  },

  toggleMic: () => {
    const { localStream } = get();
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      const isEnabled = audioTrack.enabled;
      audioTrack.enabled = !isEnabled;
      set({ isMicOff: isEnabled });
    }
  },

  acceptCall: async (data) => {
    const { offer, from, isVideo } = data;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true
      });

      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        set({ remoteStream: event.streams[0] });
      };

      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      const socket = useAuthStore.getState().socket;
      socket.emit("acceptCall", {
        to: from,
        answer
      });

      set({ 
        isCallModalOpen: true,
        isVideoCall: isVideo,
        localStream: stream,
        peerConnection,
        isIncomingCall: false
      });

    } catch (error) {
      toast.error("Could not access camera/microphone");
      console.error(error);
    }
  },

  endCall: () => {
    const { localStream, peerConnection, ringtone } = get();
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnection) {
      peerConnection.close();
    }

    if (ringtone) {
      ringtone.pause();
      ringtone.currentTime = 0;
    }
    
    playCallEndSound();
    
    set({ 
      isCallModalOpen: false,
      isVideoCall: false,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      isIncomingCall: false,
      caller: null,
      ringtone: null,
      isCameraOff: false,
      isMicOff: false
    });
    
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (selectedUser) {
      socket.emit("endCall", { to: selectedUser._id });
    }
  },
}));