"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_BASE_URL = "https://front-mission.bigs.or.kr";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
        username,
        password,
      });
      const { accessToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("username", username);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
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