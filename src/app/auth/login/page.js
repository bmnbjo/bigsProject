"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance"; // 🚀 변경된 axios 사용

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axiosInstance.post("/auth/signin", {
        username,
        password,
      });
      const { accessToken, refreshToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("username", username);

      router.push("/dashboard");
    } catch (error) {
      console.error("❌ Login Error:", error);
      alert("잘못된 아이디 또는 비밀번호입니다.");
    }
  };

  return (
    <div className="auth-container">
      <h2>로그인</h2>
      <input type="email" placeholder="이메일" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>로그인</button>
      <p>계정이 없으신가요? <a href="/auth/signup">회원가입</a></p>
    </div>
  );
}
