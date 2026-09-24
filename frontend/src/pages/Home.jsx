import React, { useEffect } from "react";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../utils/firebase.js";

import api from "../../utils/axios.js";

import { FcGoogle } from "react-icons/fc";

import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";

import Artifact from "../components/Artifact.jsx";
import SideBar from "../components/SideBar.jsx";
import ChatArea from "../components/ChatArea.jsx";

function Home() {
  const { userData } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  // Get logged-in user when app loads
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await api.get("/api/me");

        console.log(response.data);

        dispatch(setUserData(response.data));
      } catch (error) {
        console.log("No logged-in user");
        dispatch(setUserData(null));
      }
    };

    getCurrentUser();
  }, [dispatch]);

  const handleLogin = async (token) => {
    try {
      // 1. Login to backend
      const loginResponse = await api.post("/api/auth/login", {
        token,
      });

      console.log("LOGIN RESPONSE:", loginResponse.data);

      // 2. Get user from backend
      const response = await api.get("/api/me");

      console.log("ME RESPONSE:", response.data);
      console.log("ME USER:", response.data.user);

      // 3. Immediately update Redux
      dispatch(setUserData(response.data));

      console.log("USER STORED IN REDUX");
    } catch (error) {
      console.log("LOGIN ERROR:", error);
    }
  };

  const Googlelogin = async () => {
    try {
      // Google popup
      const data = await signInWithPopup(auth, googleProvider);

      // Firebase ID token
      const token = await data.user.getIdToken();

      console.log("GOOGLE LOGIN SUCCESS");

      // Backend login + Redux update
      await handleLogin(token);
    } catch (error) {
      console.log("GOOGLE LOGIN ERROR:", error);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <SideBar />

      <ChatArea />

      <Artifact />

      {!userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[340px] bg-black/80 p-7 rounded-2xl border border-white/[0.08] flex flex-col gap-5">
            <div className="flex flex-col gap-2 text-left">
              <h2 className="text-xl font-semibold text-slate-100 tracking-tight">
                Welcome to CortexAi
              </h2>

              <p className="text-[13px] text-slate-500 py-1 px-0">
                Please login to continue
              </p>
            </div>

            <button
              className="text-white font-bold py-[12px] px-4 flex items-center justify-center gap-3 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 active:to-violet-800 border border-indigo-500/30 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-150 cursor-pointer"
              onClick={Googlelogin}
            >
              <FcGoogle size={15} />
              Login with Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
