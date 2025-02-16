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

      console.log("✅ 로그인 API 응답 데이터:", response.data); // 🔥 응답 데이터 확인
      
      const { accessToken, refreshToken  } = response.data;

      // ✅ JWT 토큰 디코딩 (Base64 디코딩 방식 사용)
      const decodeJWT = (token) => {
        try {
            const base64Url = token.split(".")[1]; // JWT의 Payload 부분 추출
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Base64 형식 변환
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("❌ JWT 디코딩 오류:", error);
            return null;
        }
    };

    const decodedToken = decodeJWT(accessToken);
    console.log("🔹 디코딩된 JWT:", decodedToken);

    const extractedName = decodedToken?.name ; 
    const extractedUsername = decodedToken?.username ;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("username", extractedUsername);
        localStorage.setItem("name", extractedName);

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
