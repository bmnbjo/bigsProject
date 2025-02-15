"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    try {
      await axios.post("https://front-mission.bigs.or.kr/auth/signup", {
        username,
        name,
        password,
        confirmPassword,
      });
      alert("회원가입 성공! 로그인 해주세요.");
      router.push("/auth/login");
    } catch (error) {
      console.error("Signup Error:", error);
    }
  };

  return (
    <div className="auth-container">
      <h2>회원가입</h2>
      <input type="email" placeholder="이메일" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input type="password" placeholder="비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      <button onClick={handleSignup}>회원가입</button>
      <p>이미 계정이 있으신가요? <a href="/auth/login">로그인</a></p>
    </div>
  );
}