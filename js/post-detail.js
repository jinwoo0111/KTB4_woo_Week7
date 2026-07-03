const API_BASE_URL = "http://localhost:8080";

const params = new URLSearchParams(window.location.search);
const postId = Number(params.get("postId")) || 1;

// 상단 버튼
const backButton = document.querySelector(".back-button");
const headerProfileButton = document.querySelector(".header-profile-button");

// 게시글 영역
const postTitle = document.querySelector(".post-detail-title");
const postAuthor = document.querySelector(".post-meta-row .author-name");
const postDate = document.querySelector(".post-meta-row .post-date");
const postContent = document.querySelector(".post-content");
const postImage = document.querySelector(".post-image-placeholder");

const likeButton = document.querySelector(".like-button");
const postCountNumbers = document.querySelectorAll(".post-counts .count-box strong");

const likeCount = postCountNumbers[0];
const viewCount = postCountNumbers[1];
const commentCount = postCountNumbers[2];

// 댓글 목록 영역
const commentList = document.querySelector(".comment-list");

// 게시글 수정/삭제 버튼
const postEditButton = document.querySelector(".edit-post-button");
const postDeleteButton = document.querySelector(".delete-post-button");

// 댓글 입력 영역
const commentInput = document.querySelector(".comment-input");
const commentHelperText = document.querySelector(".comment-helper-text");
const commentSubmitButton = document.querySelector(".comment-submit-button");

// 게시글 삭제 모달
const postDeleteModal = document.querySelector(".post-delete-modal");
const postDeleteCancelButton = document.querySelector(".post-delete-cancel-button");
const postDeleteConfirmButton = document.querySelector(".post-delete-confirm-button");

// 댓글 삭제 모달
const commentDeleteModal = document.querySelector(".comment-delete-modal");
const commentDeleteCancelButton = document.querySelector(".comment-delete-cancel-button");
const commentDeleteConfirmButton = document.querySelector(".comment-delete-confirm-button");

const COMMENT_EMPTY_MESSAGE = "댓글을 입력해주세요.";

let selectedDeleteCommentId = null;
let selectedEditCommentId = null;

// 지금 DTO에는 내가 좋아요 눌렀는지 정보가 없어서 화면 안에서만 관리
let isLiked = false;

function showHelperText(helperTextElement, message) {
    helperTextElement.textContent = message;
    helperTextElement.style.visibility = "visible";
}

function hideHelperText(helperTextElement) {
    helperTextElement.style.visibility = "hidden";
}

function openModal(modalElement) {
    modalElement.classList.add("is-open");
}

function closeModal(modalElement) {
    modalElement.classList.remove("is-open");
}

function validateComment() {
    const comment = commentInput.value.trim();

    if(comment === "") {
        showHelperText(commentHelperText, COMMENT_EMPTY_MESSAGE);
        return false;
    }

    hideHelperText(commentHelperText);
    return true;
}

function updateCommentButtonStyle() {
    const comment = commentInput.value.trim();
    const isCommentValid = comment !== "";

    commentSubmitButton.classList.toggle("active", isCommentValid);
}

function resetCommentForm() {
    commentInput.value = "";
    selectedEditCommentId = null;
    commentSubmitButton.textContent = "댓글 등록";
    hideHelperText(commentHelperText);
    updateCommentButtonStyle();
}

function normalizePostDetail(post) {
    return {
        postId: post.post_id,
        title: post.title,
        createdAt: post.created_at,
        author: post.author,
        content: post.content,
        contentImage: post.content_image,
        likeCount: post.like_count,
        commentCount: post.comment_count,
        viewCount: post.view_count,
        comments: post.comments || []
    };
}

function normalizeComment(comment) {
    return {
        commentId: comment.comment_id,
        authorNickname:
            comment.author_nickname ||
            comment.authorNickname ||
            comment["author_nickname)"] ||
            "작성자",
        createdAt: comment.created_at,
        content: comment.content
    };
}

function renderPostImage(contentImage) {
    if(postImage === null) {
        return;
    }

    if(contentImage === null || contentImage === "") {
        postImage.style.display = "none";
        return;
    }

    postImage.style.display = "block";
    postImage.style.backgroundImage = `url("../assets/${contentImage}")`;
    postImage.style.backgroundSize = "cover";
    postImage.style.backgroundPosition = "center";
}

function createCommentHTML(comment) {
    return `
        <article class="comment-item" data-comment-id="${comment.commentId}">
            <div class="comment-header">
                <div class="comment-author-info">
                    <div class="author-profile"></div>
                    <span class="author-name">${comment.authorNickname}</span>
                    <time class="comment-date">${comment.createdAt}</time>
                </div>

                <div class="comment-action-buttons">
                    <button class="outline-button edit-comment-button" type="button" data-comment-id="${comment.commentId}">
                        수정
                    </button>
                    <button class="outline-button delete-comment-button" type="button" data-comment-id="${comment.commentId}">
                        삭제
                    </button>
                </div>
            </div>

            <p class="comment-content">${comment.content}</p>
        </article>
    `;
}

function renderComments(comments) {
    if(commentList === null) {
        return;
    }

    commentList.innerHTML = "";

    if(comments.length === 0) {
        commentList.innerHTML = `
            <p class="empty-comment-message">
                아직 댓글이 없습니다.
            </p>
        `;
        return;
    }

    comments.forEach(function(comment) {
        const normalizedComment = normalizeComment(comment);
        const commentHTML = createCommentHTML(normalizedComment);

        commentList.insertAdjacentHTML("beforeend", commentHTML);
    });
}

function renderPostDetail(post) {
    const normalizedPost = normalizePostDetail(post);

    postTitle.textContent = normalizedPost.title;
    postAuthor.textContent = normalizedPost.author;
    postDate.textContent = normalizedPost.createdAt;
    postContent.textContent = normalizedPost.content;

    likeCount.textContent = normalizedPost.likeCount;
    viewCount.textContent = normalizedPost.viewCount;
    commentCount.textContent = normalizedPost.commentCount;

    renderPostImage(normalizedPost.contentImage);
    renderComments(normalizedPost.comments);
}

async function fetchPostDetail() {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`);

        if(!response.ok) {
            console.log("게시글 상세 조회 실패 상태코드:", response.status);
            alert("게시글을 불러오지 못했습니다.");
            window.location.href = "./posts.html";
            return;
        }

        const responseBody = await response.json();

        console.log("게시글 상세 조회 응답:", responseBody);

        renderPostDetail(responseBody.data);

    } catch(error) {
        console.error("게시글 상세 조회 중 오류:", error);
        alert("서버와 연결할 수 없습니다.");
        window.location.href = "./posts.html";
    }
}

commentInput.addEventListener("input", function() {
    updateCommentButtonStyle();

    if(commentInput.value.trim() !== "") {
        hideHelperText(commentHelperText);
    }
});

commentSubmitButton.addEventListener("click", async function() {
    const isCommentValid = validateComment();

    if(!isCommentValid) {
        return;
    }

    const userId = localStorage.getItem("userId");

    if(userId === null) {
        window.location.href = "./login.html";
        return;
    }

    if(selectedEditCommentId === null) {
        await createComment(userId);
    }
    else {
        await updateComment();
    }
});

async function createComment(userId) {
    const comment = commentInput.value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                author_id: Number(userId),
                content: comment
            })
        });

        if(!response.ok) {
            console.log("댓글 등록 실패 상태코드:", response.status);
            showHelperText(commentHelperText, "댓글 등록에 실패했습니다.");
            return;
        }

        console.log("댓글 등록 성공");

        resetCommentForm();
        fetchPostDetail();

    } catch(error) {
        console.error("댓글 등록 중 오류:", error);
        showHelperText(commentHelperText, "서버와 연결할 수 없습니다.");
    }
}

async function updateComment() {
    const comment = commentInput.value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${selectedEditCommentId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: comment
            })
        });

        if(!response.ok) {
            console.log("댓글 수정 실패 상태코드:", response.status);
            showHelperText(commentHelperText, "댓글 수정에 실패했습니다.");
            return;
        }

        console.log("댓글 수정 성공");

        resetCommentForm();
        fetchPostDetail();

    } catch(error) {
        console.error("댓글 수정 중 오류:", error);
        showHelperText(commentHelperText, "서버와 연결할 수 없습니다.");
    }
}

postEditButton.addEventListener("click", function() {
    window.location.href = `./post-edit.html?postId=${postId}`;
});

postDeleteButton.addEventListener("click", function() {
    openModal(postDeleteModal);
});

postDeleteCancelButton.addEventListener("click", function() {
    closeModal(postDeleteModal);
});

postDeleteConfirmButton.addEventListener("click", async function() {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
            method: "DELETE"
        });

        if(!response.ok) {
            console.log("게시글 삭제 실패 상태코드:", response.status);
            closeModal(postDeleteModal);
            return;
        }

        console.log("게시글 삭제 성공");

        closeModal(postDeleteModal);
        window.location.href = "./posts.html";

    } catch(error) {
        console.error("게시글 삭제 중 오류:", error);
        closeModal(postDeleteModal);
    }
});

commentList.addEventListener("click", function(event) {
    const commentEditButton = event.target.closest(".edit-comment-button");
    const commentDeleteButton = event.target.closest(".delete-comment-button");

    if(commentEditButton !== null) {
        const commentItem = commentEditButton.closest(".comment-item");
        const commentContent = commentItem.querySelector(".comment-content").textContent;

        selectedEditCommentId = commentEditButton.dataset.commentId;

        commentInput.value = commentContent;
        commentSubmitButton.textContent = "댓글 수정";
        updateCommentButtonStyle();

        commentInput.focus();

        console.log("수정할 댓글 id:", selectedEditCommentId);
        return;
    }

    if(commentDeleteButton !== null) {
        selectedDeleteCommentId = commentDeleteButton.dataset.commentId;

        console.log("삭제할 댓글 id:", selectedDeleteCommentId);

        openModal(commentDeleteModal);
        return;
    }
});

commentDeleteCancelButton.addEventListener("click", function() {
    selectedDeleteCommentId = null;
    closeModal(commentDeleteModal);
});

commentDeleteConfirmButton.addEventListener("click", async function() {
    if(selectedDeleteCommentId === null) {
        closeModal(commentDeleteModal);
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/posts/${postId}/comments/${selectedDeleteCommentId}`,
            {
                method: "DELETE"
            }
        );

        if(!response.ok) {
            console.log("댓글 삭제 실패 상태코드:", response.status);
            closeModal(commentDeleteModal);
            return;
        }

        console.log("댓글 삭제 성공");

        if(selectedEditCommentId === selectedDeleteCommentId) {
            resetCommentForm();
        }

        selectedDeleteCommentId = null;
        closeModal(commentDeleteModal);

        fetchPostDetail();

    } catch(error) {
        console.error("댓글 삭제 중 오류:", error);
        selectedDeleteCommentId = null;
        closeModal(commentDeleteModal);
    }
});

likeButton.addEventListener("click", async function() {
    const userId = localStorage.getItem("userId");

    if(userId === null) {
        window.location.href = "./login.html";
        return;
    }

    try {
        let response;

        if(isLiked) {
            response = await fetch(`${API_BASE_URL}/posts/${postId}/likes`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: Number(userId)
                })
            });
        }
        else {
            response = await fetch(`${API_BASE_URL}/posts/${postId}/likes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: Number(userId)
                })
            });
        }

        if(!response.ok) {
            console.log("좋아요 처리 실패 상태코드:", response.status);
            return;
        }

        isLiked = !isLiked;

        console.log("좋아요 상태:", isLiked);

        fetchPostDetail();

    } catch(error) {
        console.error("좋아요 처리 중 오류:", error);
    }
});

backButton.addEventListener("click", function() {
    window.location.href = "./posts.html";
});

headerProfileButton.addEventListener("click", function() {
    window.location.href = "./user-edit.html";
});

updateCommentButtonStyle();
fetchPostDetail();