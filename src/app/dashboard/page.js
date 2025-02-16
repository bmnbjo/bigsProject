"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance"; 

const API_BASE_URL = "https://front-mission.bigs.or.kr";

export default function Dashboard() {
    const router = useRouter();
    const [token, setToken] = useState(null);
    const [posts, setPosts] = useState([]);
    const [postTitle, setPostTitle] = useState("");
    const [postContent, setPostContent] = useState("");
    const [categories, setCategories] = useState([]);
    const [editPostId, setEditPostId] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (!storedToken) handleRefreshToken();
    else {
      setToken(storedToken);
      fetchPosts(storedToken);
      fetchCategories(storedToken);
    }
  }, []);

  

  const handleRefreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      router.push("/auth/login");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });
      const { accessToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      setToken(accessToken);
      fetchPosts(accessToken);
      fetchCategories(accessToken);
    } catch (error) {
      console.error("Token Refresh Error:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      router.push("/auth/login");
    }
  };

  const fetchPosts = async (accessToken) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/boards?page=0&size=10`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        console.log("🌐 서버에서 가져온 원본 데이터:", response.data);

        if (!response.data || !response.data.content) {
            console.warn("⚠️ 서버 응답에서 게시글 목록을 찾을 수 없음.");
            return;
        }

        const updatedPosts = await Promise.all(response.data.content.map(async (post) => {
            // 개별 조회를 통해 content 값 채우기
            try {
                const detailResponse = await axios.get(`${API_BASE_URL}/boards/${post.id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                return {
                    ...post,
                    content: detailResponse.data.content || "(내용 없음)", // 개별 조회에서 content 보강
                };
            } catch (error) {
                console.error(`❌ 게시글 ID ${post.id} 개별 조회 실패:`, error);
                return { ...post, content: "(내용 없음)" }; // 오류 발생 시 기본값 사용
            }
        }));

        console.log("📌 처리된 게시글 목록:", updatedPosts);
        setPosts(updatedPosts);
    } catch (error) {
        console.error("❌ Fetch Posts Error:", error.response ? error.response.data : error);
    }
};




const createPost = async () => {
    if (!token) {
        alert("로그인이 필요합니다.");
        return;
    }

    // 요청 데이터 생성
    const requestData = JSON.stringify({
        title: postTitle,
        content: postContent.trim(),
        category: "NOTICE",
    });

    console.log("🚀 전송할 데이터 (requestData):", requestData);

    // FormData 생성
    const formData = new FormData();
    formData.append("request", new Blob([requestData], { type: "application/json" }));

    console.log("📌 formData 확인:", formData.get("request"));

    try {
        // 게시글 등록 API 호출
        const response = await axios.post(`${API_BASE_URL}/boards`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        console.log("✅ 게시글 작성 응답:", response.data);

        // 최신 게시글 목록 가져오기
        setTimeout(() => fetchPosts(token), 500);

    } catch (error) {
        console.error("❌ Create Post Error:", error.response ? error.response.data : error);
        alert("게시글 등록 실패! 서버 응답을 확인하세요.");
    }
};




  const fetchCategories = async (accessToken) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/boards/categories`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Fetch Categories Error:", error);
    }
  };


  
  const updatePost = async (postId) => {
    if (!token) {
        alert("로그인이 필요합니다.");
        return;
    }

    const requestData = JSON.stringify({
        title: postTitle,
        content: postContent.trim(),
        category: "NOTICE",
    });

    const formData = new FormData();
    formData.append("request", new Blob([requestData], { type: "application/json" }));

    try {
        const response = await axios.patch(`${API_BASE_URL}/boards/${postId}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        console.log("✅ 게시글 수정 응답:", response.data);
        fetchPosts(token);
        setEditPostId(null);
    } catch (error) {
        console.error("❌ Update Post Error:", error.response ? error.response.data : error);
        alert("게시글 수정에 실패했습니다. 다시 시도해주세요.");
    }
};



  const deletePost = async (postId) => {
    try {
      await axios.delete(`${API_BASE_URL}/boards/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts(token);
    } catch (error) {
      console.error("Delete Post Error:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>게시판</h2>
      <div className="post-form">
        <h3>{editPostId ? "게시글 수정" : "게시글 작성"}</h3>
        <input type="text" placeholder="제목" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
        <textarea placeholder="내용" value={postContent} onChange={(e) => setPostContent(e.target.value)} />
        <div className="button-group">
          {editPostId ? (
            <button onClick={() => updatePost(editPostId)}>수정</button>
          ) : (
            <button onClick={createPost}>등록</button>
          )}
        </div>
      </div>

      <div className="post-list">
  <h3>게시글 목록</h3>
  {posts.map((post) => (
    <div key={post.id} className="post-item">
      <div className="post-content">
        <h4>{post.title}</h4>
        <p>{post.content || "내용 없음"}</p>
      </div>
      <div className="button-group">
        <button className="edit-btn" onClick={() => {
          setEditPostId(post.id);
          setPostTitle(post.title);
          setPostContent(post.content || "");
        }}>수정</button>
        <button className="delete-btn" onClick={() => deletePost(post.id)}>삭제</button>
      </div>
    </div>
  ))}
</div>


    </div>
  );
}
