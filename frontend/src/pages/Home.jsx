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

        console.log("CURRENT USER:", response.data);

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
    <div className="flex h-screen bg-[#08090d] text-white overflow-hidden">
      <SideBar />

      <ChatArea />

      <Artifact />

      {!userData && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/70
            backdrop-blur-md
            px-4
            animate-in
            fade-in
            duration-300
          "
        >
          {/* Background glow */}

          <div
            className="
              absolute
              w-[420px]
              h-[420px]
              rounded-full
              bg-indigo-600/10
              blur-[120px]
              pointer-events-none
            "
          />

          <div
            className="
              relative
              w-full
              max-w-[380px]
              overflow-hidden
              rounded-3xl
              border
              border-white/[0.10]
              bg-[#0d1017]/95
              shadow-2xl
              shadow-black/60
              backdrop-blur-2xl
              p-7
              sm:p-8
              animate-in
              zoom-in-95
              duration-300
            "
          >
            {/* Top glow */}

            <div
              className="
                absolute
                top-0
                left-1/2
                -translate-x-1/2
                w-40
                h-px
                bg-gradient-to-r
                from-transparent
                via-indigo-400
                to-transparent
                opacity-80
              "
            />

            {/* Logo */}

            <div className="flex justify-center mb-6">
              <div
                className="
                  relative
                  flex
                  items-center
                  justify-center
                  w-16
                  h-16
                  rounded-2xl
                  bg-gradient-to-br
                  from-indigo-500
                  via-violet-600
                  to-purple-700
                  shadow-xl
                  shadow-indigo-500/25
                  border
                  border-white/[0.12]
                "
              >
                <div
                  className="
                    absolute
                    inset-1
                    rounded-xl
                    border
                    border-white/[0.12]
                  "
                />

                <span className="relative text-2xl font-bold text-white tracking-tight">
                  C
                </span>
              </div>
            </div>

            {/* Heading */}

            <div className="flex flex-col items-center text-center gap-2 mb-7">
              <h2
                className="
                  text-2xl
                  sm:text-[26px]
                  font-semibold
                  tracking-tight
                  text-white
                "
              >
                Welcome to CortexAi
              </h2>

              <p
                className="
                  text-[13px]
                  sm:text-sm
                  leading-6
                  text-slate-500
                  max-w-[280px]
                "
              >
                Your AI workspace for coding, research, ideas, and intelligent
                conversations.
              </p>
            </div>

            {/* Login button */}

            <button
              className="
                group
                relative
                overflow-hidden
                text-white
                font-semibold
                py-3
                px-4
                flex
                items-center
                justify-center
                gap-3
                w-full
                rounded-xl
                bg-gradient-to-r
                from-indigo-500
                via-violet-600
                to-purple-600
                border
                border-indigo-400/20
                shadow-lg
                shadow-indigo-500/20
                hover:shadow-xl
                hover:shadow-indigo-500/30
                hover:-translate-y-0.5
                active:translate-y-0
                active:scale-[0.99]
                transition-all
                duration-200
                cursor-pointer
              "
              onClick={Googlelogin}
            >
              {/* Shine effect */}

              <span
                className="
                  absolute
                  inset-0
                  -translate-x-full
                  group-hover:translate-x-full
                  bg-gradient-to-r
                  from-transparent
                  via-white/10
                  to-transparent
                  transition-transform
                  duration-700
                "
              />

              <span className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-white shadow-sm">
                <FcGoogle size={17} />
              </span>

              <span className="relative">Continue with Google</span>
            </button>

            {/* Footer */}

            <div className="flex items-center justify-center gap-2 mt-5">
              <div className="w-1 h-1 rounded-full bg-slate-700" />

              <p className="text-[11px] text-slate-600">
                Secure authentication
              </p>

              <div className="w-1 h-1 rounded-full bg-slate-700" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
