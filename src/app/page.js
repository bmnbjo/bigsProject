// app/page.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth/login"); // 기본 홈에서 로그인 페이지로 이동
  }, []);

  return <div>Redirecting...</div>;
}
