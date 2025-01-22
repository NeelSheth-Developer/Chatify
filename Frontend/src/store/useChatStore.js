import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { playRingtone, playCallEndSound, playCallStartSound } from '../sounds';

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
  ringtone: null,
  callDuration: 0,
  callTimer: null,
  isCameraOff: false,
  isMicOff: false,
  incomingOffer: null,
  callHistory: [], // Add this new state

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching users");
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
      toast.error(error.response?.data?.message || "Error fetching messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error sending message";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  setSearchQuery: (query) => {
    const users = get().users;
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase())
    );
    set({ searchQuery: query, filteredUsers: filtered });
  },

  clearSearch: () => set({ searchQuery: "", filteredUsers: [] }),

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

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const socket = useAuthStore.getState().socket;
      socket.emit("startCall", {
        to: selectedUser._id,
        isVideo,
        offer
      });

      playCallStartSound();

      const timer = setInterval(() => {
        set(state => ({ callDuration: state.callDuration + 1 }));
      }, 1000);

      set({ 
        isCallModalOpen: true,
        isVideoCall: isVideo,
        localStream: stream,
        peerConnection,
        callTimer: timer,
        callDuration: 0
      });

    } catch (error) {
      toast.error("Could not access camera/microphone");
      console.error(error);
    }
  },

  handleIncomingCall: (data) => {
    const { caller, isVideo, offer } = data;
    console.log("Handling incoming call:", { caller, isVideo });
    
    try {
      if (!caller) {
        console.error("No caller data provided");
        return;
      }

      // Stop any existing ringtone
      const { ringtone: existingRingtone } = get();
      if (existingRingtone) {
        existingRingtone.pause();
        existingRingtone.currentTime = 0;
      }

      const ringtone = playRingtone();
      if (ringtone) {
        ringtone.play().catch(error => {
          console.error("Error playing ringtone:", error);
        });
      }
      
      set({ 
        isIncomingCall: true, 
        caller,
        isVideoCall: isVideo,
        ringtone,
        incomingOffer: offer
      });

      // Use plain string for toast instead of JSX
      toast('Incoming call from ' + caller.name, {
        duration: 5000,
        position: 'top-center'
      });

    } catch (error) {
      console.error('Error in handleIncomingCall:', error);
      toast.error("Error handling incoming call");
    }
  },

  acceptCall: async () => {
    const { incomingOffer, caller, isVideoCall, ringtone } = get();
    
    if (ringtone) {
      ringtone.pause();
      ringtone.currentTime = 0;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoCall,
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

      await peerConnection.setRemoteDescription(incomingOffer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      const socket = useAuthStore.getState().socket;
      socket.emit("acceptCall", {
        to: caller._id,
        answer
      });

      playCallStartSound();

      const timer = setInterval(() => {
        set(state => ({ callDuration: state.callDuration + 1 }));
      }, 1000);

      set({ 
        isCallModalOpen: true,
        isIncomingCall: false,
        localStream: stream,
        peerConnection,
        selectedUser: caller,
        callTimer: timer,
        callDuration: 0
      });

    } catch (error) {
      toast.error("Could not access camera/microphone");
      console.error(error);
    }
  },

  handleCallAccepted: (answer) => {
    const { peerConnection } = get();
    if (peerConnection) {
      peerConnection.setRemoteDescription(answer);
    }
  },

  handleCallDeclined: () => {
    const { localStream, peerConnection, ringtone, callTimer, selectedUser } = get();
    
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

    if (callTimer) {
      clearInterval(callTimer);
    }
    
    set(state => ({ 
      isCallModalOpen: false,
      isVideoCall: false,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      isIncomingCall: false,
      caller: null,
      ringtone: null,
      callTimer: null,
      callDuration: 0,
      isCameraOff: false,
      isMicOff: false,
      callHistory: [...state.callHistory, {
        type: 'missed',
        userId: selectedUser?._id || state.caller?._id, // Add fallback for caller ID
        timestamp: new Date(),
      }]
    }));
    
    toast.error("Call was declined");
  },

  endCall: () => {
    const { localStream, peerConnection, ringtone, callTimer, selectedUser, isIncomingCall } = get();
    
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

    if (callTimer) {
      clearInterval(callTimer);
    }
    
    playCallEndSound();
    
    const socket = useAuthStore.getState().socket;
    if (selectedUser && !isIncomingCall) {
      socket.emit("endCall", { to: selectedUser._id });
    }
    
    set(state => ({ 
      isCallModalOpen: false,
      isVideoCall: false,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      isIncomingCall: false,
      caller: null,
      ringtone: null,
      callTimer: null,
      callDuration: 0,
      isCameraOff: false,
      isMicOff: false,
      callHistory: [...state.callHistory, {
        type: 'ended',
        userId: selectedUser?._id || state.caller?._id, // Add fallback for caller ID
        timestamp: new Date(),
        duration: state.callDuration
      }]
    }));
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

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId === selectedUser._id) {
        set({ messages: [...get().messages, newMessage] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  }
}));
