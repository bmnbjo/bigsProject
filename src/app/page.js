"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_BASE_URL = "https://front-mission.bigs.or.kr";

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
        setToken(storedToken);
        fetchPosts(storedToken);
    }
}, []);

    const handleSignup = async () => {
      if (!username.includes("@")) {
          alert("이메일 형식을 입력하세요.");
          return;
      }
      if (password.length < 8 || !/[0-9]/.test(password) || !/[!%*#?&]/.test(password)) {
          alert("비밀번호는 최소 8자 이상, 숫자 및 특수문자를 포함해야 합니다.");
          return;
      }
      if (password !== confirmPassword) {
          alert("비밀번호가 일치하지 않습니다.");
          return;
      }
  
      console.log("회원가입 요청 데이터:", { username, name, password, confirmPassword });
  
      try {
          const response = await axios.post(
              `${API_BASE_URL}/auth/signup`,
              {
                  username,
                  name,
                  password,
                  confirmPassword,
              },
              {
                  headers: { "Content-Type": "application/json" }
              }
          );
  
          console.log("회원가입 성공:", response.data);
          alert("회원가입 성공! 로그인 해주세요.");
      } catch (error) {
          console.error("Signup Error:", error.response ? error.response.data : error);
          alert(`회원가입 실패! 서버 응답: ${error.response ? JSON.stringify(error.response.data) : "알 수 없음"}`);
      }
  };
  

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
                username,
                password,
            });
            const { accessToken } = response.data;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("username", username);
            localStorage.setItem("name", name);
            setToken(accessToken);
            fetchPosts(accessToken);
            alert("로그인 성공!");
        } catch (error) {
            console.error("Login Error:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("username");
        localStorage.removeItem("name");
        setToken(null);
        setPosts([]);
        alert("로그아웃 되었습니다.");
    };

    const fetchPosts = async (accessToken) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/boards?page=0&size=10`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (response.data && Array.isArray(response.data.content)) {
                setPosts(response.data.content);
            } else {
                console.warn("서버 응답이 예상한 구조가 아닙니다:", response.data);
            }
        } catch (error) {
            console.error("Fetch Posts Error:", error);
        }
    };

    const createPost = async () => {
      if (!postTitle || !postContent) {
          alert("제목과 내용을 입력해주세요.");
          return;
      }
      if (!token) {
          alert("로그인이 필요합니다.");
          return;
      }

      console.log("게시글 생성 요청 데이터:", { title: postTitle, content: postContent, category: "NOTICE" });
      console.log("사용자 토큰:", token);

      try {
          const formData = new FormData();
          const requestData = JSON.stringify({
              title: postTitle,
              content: postContent,
              category: "NOTICE"
          });
          formData.append("request", new Blob([requestData], { type: "application/json" }));

          const response = await axios.post(`${API_BASE_URL}/boards`, formData, {
              headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "multipart/form-data",
              },
          });

          console.log("게시글 생성 성공:", response.data);
          setPostTitle("");
          setPostContent("");
          fetchPosts(token);
          alert("게시글 등록 성공!");
      } catch (error) {
          console.error("Create Post Error:", error.response ? error.response.data : error);
          alert(`게시글 등록 실패! 서버 응답: ${error.response ? JSON.stringify(error.response.data) : "알 수 없음"}`);
      }
  };

    return (
        <div>
            <h1>게시판</h1>
            <div>
                <h2>회원가입</h2>
                <input type="email" placeholder="이메일" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
                <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
                <input type="password" placeholder="비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <button onClick={handleSignup}>회원가입</button>
            </div>
            {token ? (
                <div>
                    <p>로그인 사용자: {localStorage.getItem("name")} ({localStorage.getItem("username")})</p>
                    <button onClick={handleLogout}>로그아웃</button>
                </div>
            ) : (
                <div>
                    <h2>로그인</h2>
                    <input type="email" placeholder="이메일" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={handleLogin}>로그인</button>
                </div>
            )}
            <div>
                <h2>게시글 작성</h2>
                <input type="text" placeholder="제목" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
                <textarea placeholder="내용" value={postContent} onChange={(e) => setPostContent(e.target.value)} />
                <button onClick={createPost}>게시글 등록</button>
            </div>
            <div>
                <h2>게시글 목록</h2>
                {posts.map((post) => (
                    <div key={post.id}>
                        <h3>{post.title}</h3>
                        <p>{post.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
