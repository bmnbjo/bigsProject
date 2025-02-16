"use client";

import { useState, useEffect,useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_BASE_URL = "https://front-mission.bigs.or.kr";

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [editPostId, setEditPostId] = useState(null);
  const [userInfo, setUserInfo] = useState({ username: "", name: "" });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const titleInputRef = useRef(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUsername = localStorage.getItem("username");
    const storedName = localStorage.getItem("name");

    console.log("🔹 저장된 사용자 정보:", { storedUsername, storedName });

    if (storedUsername && storedName) {
        setUserInfo({ username: storedUsername, name: storedName });
    } else {
        console.warn("⚠️ 사용자 이름이 저장되지 않았습니다. 로그인 로직 확인 필요!");
    }

    if (!storedToken) handleRefreshToken();
    else {
      setToken(storedToken);
      fetchPosts(storedToken, currentPage);
      fetchCategories(storedToken);
    }
  }, [currentPage]);

  
  

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
      fetchPosts(accessToken, currentPage);
      fetchCategories(accessToken);
    } catch (error) {
      console.error("Token Refresh Error:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      router.push("/auth/login");
    }
  };

  const fetchPosts = async (accessToken, page) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/boards?page=${page}&size=10`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      const updatedPosts = await Promise.all(response.data.content.map(async (post) => {
        try {
          const detailResponse = await axios.get(`${API_BASE_URL}/boards/${post.id}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          return {
            ...post,
            content: detailResponse.data.content || "(내용 없음)",
          };
        } catch (error) {
          console.error(`게시글 ID ${post.id} 개별 조회 실패:`, error);
          return { ...post, content: "(내용 없음)" };
        }
      }));

      setPosts(updatedPosts);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Fetch Posts Error:", error);
    }
  };




  const createPost = async () => {
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
        const response = await axios.post(`${API_BASE_URL}/boards`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        console.log("✅ 게시글 작성 응답:", response.data);

        alert("게시글이 등록되었습니다.");

        // **🚀 새로운 게시글 추가 후 첫 페이지로 이동**
        setCurrentPage(0);

        // **🚀 최신 게시글 목록 불러오기**
        setTimeout(() => fetchPosts(token, 0), 500);

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
        setCurrentPage(0);

        // **🚀 최신 게시글 목록 불러오기**
        setTimeout(() => fetchPosts(token, 0), 500);
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
      alert("게시글이 삭제되었습니다.");
      fetchPosts(token);
      setCurrentPage(0);

      // **🚀 최신 게시글 목록 불러오기**
      setTimeout(() => fetchPosts(token, 0), 500);
    } catch (error) {
      console.error("Delete Post Error:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>게시판</h2>
      <div className="user-info">
        <p>로그인한 사용자: {userInfo.username} ({userInfo.name})</p>
      </div>
      <div className="post-form">
        <h3>{editPostId ? "게시글 수정" : "게시글 작성"}</h3>
        <input type="text" 
         placeholder="제목"
         value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          ref={titleInputRef} 
        />
        <textarea placeholder="내용" value={postContent} onChange={(e) => setPostContent(e.target.value)} />
        <div className="button-group">
          {editPostId ? (
             <button onClick={() => {
              updatePost(editPostId);
              alert("수정 완료 되었습니다.");
            }}>수정</button>
          ) : (
            <button onClick={createPost}>등록</button>
          )}
        </div>
      </div>

      <div className="post-list">
        {posts.map((post) => (
          <div key={post.id} className="post-item">
            <h4>{post.title}</h4>
            <p>{post.content}</p>
            <div className="button-group">
              <button className="edit-btn" onClick={() => {
                setEditPostId(post.id);
                setPostTitle(post.title);
                setPostContent(post.content || "");
                setTimeout(() => {
                  alert("수정폼으로 바뀌었습니다.");
                  titleInputRef.current?.focus();
                }, 0);
              }}>수정</button>
              <button className="delete-btn" onClick={() => deletePost(post.id)}>삭제</button>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)}>
          이전
        </button>
        <span>{currentPage + 1} / {totalPages}</span>
        <button disabled={currentPage + 1 >= totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
          다음
        </button>
      </div>


    </div>
  );
}
