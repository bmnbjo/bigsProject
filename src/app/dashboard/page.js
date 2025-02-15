"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_BASE_URL = "https://front-mission.bigs.or.kr";

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (!storedToken) router.push("/auth/login");
    setToken(storedToken);
    fetchPosts(storedToken);
  }, []);

  const fetchPosts = async (accessToken) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/boards?page=0&size=10`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setPosts(response.data.content);
    } catch (error) {
      console.error("Fetch Posts Error:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>게시판</h2>
      <div>
        <h3>게시글 목록</h3>
        {posts.map((post) => (
          <div key={post.id} className="post-item">
            <h4>{post.title}</h4>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
