import Navbar from './components/Navbar';
import {Routes, Route, Navigate} from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SettingPage from './pages/SettingPage';
import { useAuthStore } from './store/useAuthStore';
import {useEffect} from 'react';
import {Loader} from "lucide-react";
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from './store/useThemeStore';
import CallNotification from './components/CallNotification';
import { useChatStore } from './store/useChatStore.js'; // Fix import path

const App = () => {
  const {authUser,checkAuth,isCheckingAuth,socket}=useAuthStore()
  const {theme} = useThemeStore()

  useEffect(()=>
  {
    checkAuth()
  },[checkAuth]);
  console.log(authUser)
  
  useEffect(() => {
    if (socket) {
      socket.on("incomingCall", (data) => {
        console.log("Received incoming call data:", data);
        // First, fetch users if not already loaded
        const users = useChatStore.getState().users;
        if (users.length === 0) {
          useChatStore.getState().getUsers().then(() => {
            handleIncomingCallData(data);
          });
        } else {
          handleIncomingCallData(data);
        }
      });

      const handleIncomingCallData = (data) => {
        const users = useChatStore.getState().users;
        const caller = users.find(user => user._id === data.from);
        
        if (caller) {
          console.log("Found caller:", caller);
          useChatStore.getState().handleIncomingCall({ 
            caller, 
            isVideo: data.isVideo,
            offer: data.offer 
          });
        } else {
          console.error("Caller not found in users list:", data.from);
          console.log("Available users:", users);
        }
      };

      socket.on("callAccepted", (data) => {
        console.log("Call accepted:", data);
        useChatStore.getState().handleCallAccepted(data.answer);
      });

      socket.on("callEnded", () => {
        console.log("Call ended");
        useChatStore.getState().endCall();
      });

      socket.on("callDeclined", () => {
        console.log("Call declined");
        useChatStore.getState().handleCallDeclined();
      });

      return () => {
        socket.off("incomingCall");
        socket.off("callAccepted");
        socket.off("callEnded");
        socket.off("callDeclined");
      };
    }
  }, [socket]);

  if(isCheckingAuth && !authUser) return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin"/>
    </div>
  )

  return (  
  <div data-theme={theme}>
    <Navbar/>
    <Routes>
      <Route path="/" element={authUser ? <HomePage/> : <Navigate to="/login"/>}/>
      <Route path="/signup" element={<SignUpPage/>}/>
      <Route path="/login" element={authUser ? <Navigate to ="/"/> : <LoginPage/>}/>
      <Route path="/settings" element={<SettingPage/>}/>
      <Route path="/profile" element={authUser ? <ProfilePage/> : <Navigate to="/login"/>}/>
    </Routes>
    <CallNotification />
    <Toaster/>
  </div>
  )
}

export default App