import {
    showHelperText,
    hideHelperText
} from "./common/ui.js";

import {
    parsePositiveIntegerParam
} from "./common/validation.js";

import {
    apiRequest
} from "./common/api.js";

import {
    requireLogin,
    getUserId
} from "./common/auth.js";


// URL 파라미터
const params =
    new URLSearchParams(window.location.search);

const postId =
    parsePositiveIntegerParam(
        params,
        "postId"
    );

const currentUserId =
    getUserId();


const headerProfileButton =
    document.querySelector(
        ".header-profile-button"
    );

const API_BASE_URL =
    "http://localhost:8080";

const DEFAULT_PROFILE_IMAGE_URL =
    "../assets/rescene-default-profile.jpg";


// 게시글 영역
const postTitle =
    document.querySelector(
        ".post-detail-title"
    );

const postAuthor =
    document.querySelector(
        ".post-meta-row .author-name"
    );

const postAuthorProfile =
    document.querySelector(
        ".post-meta-row .author-profile"
    );

const postDate =
    document.querySelector(
        ".post-meta-row .post-date"
    );

const postContent =
    document.querySelector(".post-content");

const postImage =
    document.querySelector(
        ".post-image-placeholder"
    );


// 게시글 통계 영역
const likeButton =
    document.querySelector(".like-button");

const postCountNumbers =
    document.querySelectorAll(
        ".post-counts .count-box strong"
    );

const likeCount =
    postCountNumbers[0];

const viewCount =
    postCountNumbers[1];

const commentCount =
    postCountNumbers[2];


// 댓글 목록
const commentList =
    document.querySelector(".comment-list");


// 게시글 수정·삭제
const postEditButton =
    document.querySelector(
        ".edit-post-button"
    );

const postDeleteButton =
    document.querySelector(
        ".delete-post-button"
    );


function formatPostDate(createdAt) {
    if(createdAt === null || createdAt === undefined || createdAt === "") {
        return "";
    }

    const rawDate = String(createdAt);
    const normalizedDate = rawDate.replace(" ", "T");
    const createdDate = new Date(normalizedDate);

    if(Number.isNaN(createdDate.getTime())) {
        return rawDate;
    }

    const diffMilliseconds =
        Date.now() - createdDate.getTime();

    const diffMinutes =
        Math.floor(diffMilliseconds / 60000);

    if(diffMinutes < 1) {
        return "방금 전";
    }

    if(diffMinutes < 60) {
        return `${diffMinutes}분 전`;
    }

    const diffHours =
        Math.floor(diffMinutes / 60);

    if(diffHours < 24) {
        return `${diffHours}시간 전`;
    }

    const diffDays =
        Math.floor(diffHours / 24);

    if(diffDays < 7) {
        return `${diffDays}일 전`;
    }

    return rawDate.slice(0, 10);
}


// 댓글 입력
const commentInput =
    document.querySelector(".comment-input");

const commentHelperText =
    document.querySelector(
        ".comment-helper-text"
    );

const commentSubmitButton =
    document.querySelector(
        ".comment-submit-button"
    );


// 게시글 삭제 모달
const postDeleteModal =
    document.querySelector(
        ".post-delete-modal"
    );

const postDeleteCancelButton =
    document.querySelector(
        ".post-delete-cancel-button"
    );

const postDeleteConfirmButton =
    document.querySelector(
        ".post-delete-confirm-button"
    );


// 댓글 삭제 모달
const commentDeleteModal =
    document.querySelector(
        ".comment-delete-modal"
    );

const commentDeleteCancelButton =
    document.querySelector(
        ".comment-delete-cancel-button"
    );

const commentDeleteConfirmButton =
    document.querySelector(
        ".comment-delete-confirm-button"
    );


// 메시지
const COMMENT_EMPTY_MESSAGE =
    "댓글을 입력해주세요.";


// 현재 선택 상태
let selectedDeleteCommentId = null;
let selectedEditCommentId = null;
let isLiked = false;


// 모달 열기
function openModal(modalElement) {
    if(modalElement === null) {
        return;
    }

    modalElement.classList.add("is-open");
}


// 모달 닫기
function closeModal(modalElement) {
    if(modalElement === null) {
        return;
    }

    modalElement.classList.remove("is-open");
}


// 댓글 입력 검사
function validateComment() {
    const comment =
        commentInput.value.trim();

    if(comment === "") {
        showHelperText(
            commentHelperText,
            COMMENT_EMPTY_MESSAGE
        );
        return false;
    }

    hideHelperText(commentHelperText);
    return true;
}


// 댓글 버튼 스타일
function updateCommentButtonStyle() {
    const comment =
        commentInput.value.trim();

    const isCommentValid =
        comment !== "";

    commentSubmitButton.classList.toggle(
        "active",
        isCommentValid
    );
}


// 좋아요 버튼 스타일
function updateLikeButtonStyle() {
    likeButton.classList.toggle(
        "is-liked",
        isLiked
    );

    likeButton.setAttribute(
        "aria-pressed",
        String(isLiked)
    );
}


// 댓글 폼 초기화
function resetCommentForm() {
    commentInput.value = "";
    selectedEditCommentId = null;

    commentSubmitButton.textContent =
        "댓글 등록";

    hideHelperText(commentHelperText);
    updateCommentButtonStyle();
}


// 게시글 데이터 변환
function normalizePostDetail(post) {
    return {
        postId:
            post.post_id ??
            post.postId ??
            post.id,

        title:
            post.title ?? "",

        createdAt:
            post.created_at ??
            post.createdAt ??
            "",

        authorId:
            post.author_id ??
            post.authorId ??
            null,

        author:
            post.author ??
            post.author_nickname ??
            post.authorNickname ??
            "작성자",

        authorProfileImage:
            post.author_profile_image ??
            post.authorProfileImage ??
            null,

        content:
            post.content ?? "",

        contentImage:
            post.content_image ??
            post.contentImage ??
            null,

        likeCount:
            post.like_count ??
            post.likeCount ??
            0,

        likedByMe:
            post.liked_by_me === true ||
            post.likedByMe === true,

        commentCount:
            post.comment_count ??
            post.commentCount ??
            0,

        viewCount:
            post.view_count ??
            post.viewCount ??
            0,

        comments:
            Array.isArray(post.comments)
                ? post.comments
                : []
    };
}


// 댓글 데이터 변환
function normalizeComment(comment) {
    return {
        commentId:
            comment.comment_id ??
            comment.commentId ??
            comment.id,

        authorId:
            comment.author_id ??
            comment.authorId ??
            null,

        authorNickname:
            comment.author_nickname ??
            comment.authorNickname ??
            comment.author ??
            "작성자",

        authorProfileImage:
            comment.author_profile_image ??
            comment.authorProfileImage ??
            null,

        createdAt:
            comment.created_at ??
            comment.createdAt ??
            "",

        content:
            comment.content ?? ""
    };
}


function isCurrentUser(authorId) {
    return (
        currentUserId !== null &&
        authorId !== null &&
        String(currentUserId) === String(authorId)
    );
}


// 게시글 이미지 표시
function renderPostImage(contentImage) {
    if(postImage === null) {
        return;
    }

    if(
        contentImage === null ||
        contentImage === ""
    ) {
        postImage.style.display = "none";
        postImage.removeAttribute("src");
        return;
    }

    postImage.style.display = "block";

    let imageUrl = contentImage;

    if(contentImage.startsWith("/uploads/")) {
        imageUrl = `${API_BASE_URL}${contentImage}`;
    } else if(contentImage.startsWith("uploads/")) {
        imageUrl = `${API_BASE_URL}/${contentImage}`;
    } else if(
        !contentImage.startsWith("http") &&
        !contentImage.startsWith("../")
    ) {
        imageUrl = `../assets/${contentImage}`;
    }

    postImage.src = imageUrl;
}

function getProfileImageUrl(profileImage) {
    if(profileImage === null || profileImage === undefined || profileImage === "") {
        return DEFAULT_PROFILE_IMAGE_URL;
    }

    if(profileImage.startsWith("http")) {
        return profileImage;
    }

    if(profileImage.startsWith("/uploads/")) {
        return `${API_BASE_URL}${profileImage}`;
    }

    if(profileImage.startsWith("uploads/")) {
        return `${API_BASE_URL}/${profileImage}`;
    }

    if(profileImage.startsWith("../assets/")) {
        return profileImage;
    }

    return DEFAULT_PROFILE_IMAGE_URL;
}

function applyProfileImage(element, profileImage) {
    if(element === null) {
        return;
    }

    element.style.backgroundImage =
        `url("${getProfileImageUrl(profileImage)}")`;
    element.style.backgroundSize = "cover";
    element.style.backgroundPosition = "center";
}


// 댓글 HTML 생성
function createCommentHTML(comment) {
    const commentActions =
        isCurrentUser(comment.authorId)
            ? `
                <button
                    class="outline-button edit-comment-button"
                    type="button"
                    data-comment-id="${comment.commentId}"
                >
                    수정
                </button>

                <button
                    class="outline-button delete-comment-button"
                    type="button"
                    data-comment-id="${comment.commentId}"
                >
                    삭제
                </button>
            `
            : "";

    return `
        <article
            class="comment-item"
            data-comment-id="${comment.commentId}"
        >
            <div class="comment-header">
                <div class="comment-author-info">
                    <div
                        class="author-profile"
                        style="background-image: url('${getProfileImageUrl(comment.authorProfileImage)}')"
                    ></div>

                    <span class="author-name">
                        ${comment.authorNickname}
                    </span>

                    <time class="comment-date">
                        ${formatPostDate(comment.createdAt)}
                    </time>
                </div>

                <div class="comment-action-buttons">
                    ${commentActions}
                </div>
            </div>

            <p class="comment-content">
                ${comment.content}
            </p>
        </article>
    `;
}


// 댓글 목록 렌더링
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
        const normalizedComment =
            normalizeComment(comment);

        const commentHTML =
            createCommentHTML(
                normalizedComment
            );

        commentList.insertAdjacentHTML(
            "beforeend",
            commentHTML
        );
    });
}


// 빈 댓글 문구 제거
function removeEmptyCommentMessage() {
    const emptyMessage =
        commentList.querySelector(
            ".empty-comment-message"
        );

    if(emptyMessage !== null) {
        emptyMessage.remove();
    }
}


// 댓글이 없으면 빈 문구 표시
function showEmptyCommentMessageIfNeeded() {
    const remainingComments =
        commentList.querySelectorAll(
            ".comment-item"
        );

    if(remainingComments.length > 0) {
        return;
    }

    commentList.innerHTML = `
        <p class="empty-comment-message">
            아직 댓글이 없습니다.
        </p>
    `;
}


// 새 댓글 추가
function appendComment(comment) {
    removeEmptyCommentMessage();

    const commentWithAuthor = {
        ...comment,
        authorId:
            comment.authorId ??
            currentUserId
    };

    const commentHTML =
        createCommentHTML(commentWithAuthor);

    commentList.insertAdjacentHTML(
        "beforeend",
        commentHTML
    );
}


// 댓글 수정 결과 반영
function updateCommentItem(comment) {
    const commentItem =
        commentList.querySelector(
            `.comment-item[data-comment-id="${comment.commentId}"]`
        );

    if(commentItem === null) {
        return;
    }

    const authorName =
        commentItem.querySelector(
            ".author-name"
        );

    const commentDate =
        commentItem.querySelector(
            ".comment-date"
        );

    const commentContent =
        commentItem.querySelector(
            ".comment-content"
        );

    if(authorName !== null) {
        authorName.textContent =
            comment.authorNickname;
    }

    if(commentDate !== null) {
        commentDate.textContent =
            formatPostDate(comment.createdAt);
    }

    if(commentContent !== null) {
        commentContent.textContent =
            comment.content;
    }
}


// 댓글 화면에서 제거
function removeCommentItem(commentId) {
    const commentItem =
        commentList.querySelector(
            `.comment-item[data-comment-id="${commentId}"]`
        );

    if(commentItem !== null) {
        commentItem.remove();
    }

    showEmptyCommentMessageIfNeeded();
}


// 댓글 수 변경
function changeCommentCount(amount) {
    const currentCount =
        Number(commentCount.textContent) || 0;

    const nextCount =
        Math.max(
            0,
            currentCount + amount
        );

    commentCount.textContent =
        String(nextCount);
}


// 좋아요 수 변경
function changeLikeCount(amount) {
    const currentCount =
        Number(likeCount.textContent) || 0;

    const nextCount =
        Math.max(
            0,
            currentCount + amount
        );

    likeCount.textContent =
        String(nextCount);
}


// 게시글 상세 렌더링
function renderPostDetail(postData) {
    const post =
        normalizePostDetail(postData);

    postTitle.textContent =
        post.title;

    postAuthor.textContent =
        post.author;

    applyProfileImage(
        postAuthorProfile,
        post.authorProfileImage
    );

    postDate.textContent =
        formatPostDate(post.createdAt);

    postContent.textContent =
        post.content;

    const isPostAuthor =
        isCurrentUser(post.authorId);

    postEditButton.hidden =
        !isPostAuthor;

    postDeleteButton.hidden =
        !isPostAuthor;

    likeCount.textContent =
        String(post.likeCount);

    viewCount.textContent =
        String(post.viewCount);

    commentCount.textContent =
        String(post.commentCount);

    isLiked = post.likedByMe;

    updateLikeButtonStyle();
    renderPostImage(post.contentImage);
    renderComments(post.comments);
}


// 게시글 상세 조회
async function fetchPostDetail() {
    try {
        const result = await apiRequest(
            `/posts/${postId}`
        );

        if(!result.ok) {
            console.error(
                "게시글 상세 조회 실패:",
                result.status,
                result.body
            );

            if(result.authExpired) {
                return;
            }

            alert("게시글을 불러오지 못했습니다.");
            window.location.href = "./posts.html";
            return;
        }

        const postData =
            result.body?.data;

        if(
            postData === null ||
            postData === undefined
        ) {
            console.error(
                "게시글 상세 응답 형식 오류:",
                result.body
            );

            alert(
                "게시글 응답 데이터가 올바르지 않습니다."
            );
            return;
        }

        renderPostDetail(postData);

    } catch(error) {
        console.error(
            "게시글 상세 조회 중 오류:",
            error
        );

        alert("서버와 연결할 수 없습니다.");
        window.location.href = "./posts.html";
    }
}


// 댓글 등록
async function createComment() {
    const content =
        commentInput.value.trim();

    try {
        const result = await apiRequest(
            `/posts/${postId}/comments`,
            {
                method: "POST",
                body: JSON.stringify({
                    content: content
                })
            }
        );

        if(!result.ok) {
            console.error(
                "댓글 등록 실패:",
                result.status,
                result.body
            );

            if(result.authExpired) {
                return;
            }

            if(result.errorType === "forbidden") {
                showHelperText(
                    commentHelperText,
                    "댓글을 등록할 권한이 없습니다."
                );
                return;
            }

            showHelperText(
                commentHelperText,
                "댓글 등록에 실패했습니다."
            );
            return;
        }

        const commentData =
            result.body?.data;

        if(
            commentData === null ||
            commentData === undefined
        ) {
            console.error(
                "댓글 등록 응답 형식 오류:",
                result.body
            );

            showHelperText(
                commentHelperText,
                "댓글 응답 데이터가 올바르지 않습니다."
            );
            return;
        }

        const createdComment =
            normalizeComment(commentData);

        appendComment(createdComment);
        changeCommentCount(1);
        resetCommentForm();

    } catch(error) {
        console.error(
            "댓글 등록 중 오류:",
            error
        );

        showHelperText(
            commentHelperText,
            "서버와 연결할 수 없습니다."
        );
    }
}


// 댓글 수정
async function updateComment() {
    const content =
        commentInput.value.trim();

    const editingCommentId =
        selectedEditCommentId;

    try {
        const result = await apiRequest(
            `/posts/${postId}/comments/${editingCommentId}`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    content: content
                })
            }
        );

        if(!result.ok) {
            console.error(
                "댓글 수정 실패:",
                result.status,
                result.body
            );

            if(result.authExpired) {
                return;
            }

            if(result.errorType === "forbidden") {
                showHelperText(
                    commentHelperText,
                    "댓글을 수정할 권한이 없습니다."
                );
                return;
            }

            if(result.errorType === "conflict") {
                showHelperText(
                    commentHelperText,
                    "댓글 수정 중 충돌이 발생했습니다. 새로고침 후 다시 시도해주세요."
                );
                return;
            }

            showHelperText(
                commentHelperText,
                "댓글 수정에 실패했습니다."
            );
            return;
        }

        const commentData =
            result.body?.data;

        if(
            commentData === null ||
            commentData === undefined
        ) {
            console.error(
                "댓글 수정 응답 형식 오류:",
                result.body
            );

            showHelperText(
                commentHelperText,
                "댓글 응답 데이터가 올바르지 않습니다."
            );
            return;
        }

        const updatedComment =
            normalizeComment(commentData);

        updateCommentItem(updatedComment);
        resetCommentForm();

    } catch(error) {
        console.error(
            "댓글 수정 중 오류:",
            error
        );

        showHelperText(
            commentHelperText,
            "서버와 연결할 수 없습니다."
        );
    }
}


// 댓글 입력 이벤트
commentInput.addEventListener(
    "input",
    function() {
        updateCommentButtonStyle();

        if(commentInput.value.trim() !== "") {
            hideHelperText(
                commentHelperText
            );
        }
    }
);


// 댓글 등록 또는 수정
commentSubmitButton.addEventListener(
    "click",
    async function() {
        if(!validateComment()) {
            return;
        }

        if(!requireLogin()) {
            return;
        }

        commentSubmitButton.disabled = true;

        try {
            if(selectedEditCommentId === null) {
                await createComment();
            } else {
                await updateComment();
            }
        } finally {
            commentSubmitButton.disabled = false;
        }
    }
);


// 게시글 수정 페이지 이동
postEditButton.addEventListener(
    "click",
    function() {
        window.location.href =
            `./post-edit.html?postId=${postId}`;
    }
);


// 게시글 삭제 모달 열기
postDeleteButton.addEventListener(
    "click",
    function() {
        if(!requireLogin()) {
            return;
        }

        openModal(postDeleteModal);
    }
);


// 게시글 삭제 취소
postDeleteCancelButton.addEventListener(
    "click",
    function() {
        closeModal(postDeleteModal);
    }
);


// 게시글 삭제 확인
postDeleteConfirmButton.addEventListener(
    "click",
    async function() {
        if(!requireLogin()) {
            return;
        }

        postDeleteConfirmButton.disabled = true;

        try {
            const result = await apiRequest(
                `/posts/${postId}`,
                {
                    method: "DELETE"
                }
            );

            if(!result.ok) {
                console.error(
                    "게시글 삭제 실패:",
                    result.status,
                    result.body
                );

                if(result.authExpired) {
                    closeModal(postDeleteModal);
                    return;
                }

                if(result.errorType === "forbidden") {
                    alert(
                        "게시글을 삭제할 권한이 없습니다."
                    );
                    closeModal(postDeleteModal);
                    return;
                }

                alert(
                    "게시글 삭제에 실패했습니다."
                );

                closeModal(postDeleteModal);
                return;
            }

            console.log("게시글 삭제 성공");

            closeModal(postDeleteModal);

            window.location.href =
                "./posts.html";

        } catch(error) {
            console.error(
                "게시글 삭제 중 오류:",
                error
            );

            alert("서버와 연결할 수 없습니다.");
            closeModal(postDeleteModal);

        } finally {
            postDeleteConfirmButton.disabled =
                false;
        }
    }
);


// 댓글 수정·삭제 이벤트 위임
commentList.addEventListener(
    "click",
    function(event) {
        const commentEditButton =
            event.target.closest(
                ".edit-comment-button"
            );

        const commentDeleteButton =
            event.target.closest(
                ".delete-comment-button"
            );

        if(commentEditButton !== null) {
            const commentItem =
                commentEditButton.closest(
                    ".comment-item"
                );

            if(commentItem === null) {
                return;
            }

            const commentContentElement =
                commentItem.querySelector(
                    ".comment-content"
                );

            if(commentContentElement === null) {
                return;
            }

            selectedEditCommentId =
                commentEditButton.dataset.commentId;

            commentInput.value =
                commentContentElement.textContent.trim();

            commentSubmitButton.textContent =
                "댓글 수정";

            updateCommentButtonStyle();

            commentInput.focus();
            return;
        }

        if(commentDeleteButton !== null) {
            if(!requireLogin()) {
                return;
            }

            selectedDeleteCommentId =
                commentDeleteButton.dataset.commentId;

            openModal(commentDeleteModal);
        }
    }
);


// 댓글 삭제 취소
commentDeleteCancelButton.addEventListener(
    "click",
    function() {
        selectedDeleteCommentId = null;
        closeModal(commentDeleteModal);
    }
);


// 댓글 삭제 확인
commentDeleteConfirmButton.addEventListener(
    "click",
    async function() {
        if(selectedDeleteCommentId === null) {
            closeModal(commentDeleteModal);
            return;
        }

        if(!requireLogin()) {
            return;
        }

        const deletedCommentId =
            selectedDeleteCommentId;

        commentDeleteConfirmButton.disabled =
            true;

        try {
            const result = await apiRequest(
                `/posts/${postId}/comments/${deletedCommentId}`,
                {
                    method: "DELETE"
                }
            );

            if(!result.ok) {
                console.error(
                    "댓글 삭제 실패:",
                    result.status,
                    result.body
                );

                if(result.authExpired) {
                    selectedDeleteCommentId = null;
                    closeModal(commentDeleteModal);
                    return;
                }

                if(result.errorType === "forbidden") {
                    alert(
                        "댓글을 삭제할 권한이 없습니다."
                    );
                    selectedDeleteCommentId = null;
                    closeModal(commentDeleteModal);
                    return;
                }

                if(result.errorType === "conflict") {
                    alert(
                        "댓글 삭제 중 충돌이 발생했습니다. 새로고침 후 다시 시도해주세요."
                    );
                    selectedDeleteCommentId = null;
                    closeModal(commentDeleteModal);
                    return;
                }

                alert(
                    "댓글 삭제에 실패했습니다."
                );

                selectedDeleteCommentId = null;
                closeModal(commentDeleteModal);
                return;
            }

            if(
                selectedEditCommentId ===
                deletedCommentId
            ) {
                resetCommentForm();
            }

            removeCommentItem(
                deletedCommentId
            );

            changeCommentCount(-1);

            selectedDeleteCommentId = null;
            closeModal(commentDeleteModal);

        } catch(error) {
            console.error(
                "댓글 삭제 중 오류:",
                error
            );

            alert("서버와 연결할 수 없습니다.");

            selectedDeleteCommentId = null;
            closeModal(commentDeleteModal);

        } finally {
            commentDeleteConfirmButton.disabled =
                false;
        }
    }
);


// 좋아요 또는 좋아요 취소
likeButton.addEventListener(
    "click",
    async function() {
        if(!requireLogin()) {
            return;
        }

        likeButton.disabled = true;

        try {
            const method =
                isLiked
                    ? "DELETE"
                    : "POST";

            const result = await apiRequest(
                `/posts/${postId}/likes`,
                {
                    method: method
                }
            );

            if(!result.ok) {
                console.error(
                    "좋아요 처리 실패:",
                    result.status,
                    result.body
                );

                if(result.authExpired) {
                    return;
                }

                if(result.status === 403) {
                    alert(
                        "좋아요를 처리할 권한이 없습니다."
                    );
                    return;
                }

                if(result.status === 409) {
                    if(method === "POST") {
                        alert(
                            "이미 좋아요를 누른 게시글입니다."
                        );
                    } else {
                        alert(
                            "이미 좋아요를 취소한 게시글입니다."
                        );
                    }
                    return;
                }

                alert(
                    "좋아요 처리에 실패했습니다."
                );
                return;
            }

            isLiked = !isLiked;

            if(isLiked) {
                changeLikeCount(1);
            } else {
                changeLikeCount(-1);
            }

            updateLikeButtonStyle();

        } catch(error) {
            console.error(
                "좋아요 처리 중 오류:",
                error
            );
        } finally {
            likeButton.disabled = false;
        }
    }
);


// 회원정보 페이지 이동
headerProfileButton.addEventListener(
    "click",
    function() {
        window.location.href =
            "./user-edit.html";
    }
);


// 페이지 초기화
async function initializePostDetailPage() {
    if(postId === null) {
        alert("잘못된 게시글 주소입니다.");
        window.location.replace("./posts.html");
        return;
    }

    updateCommentButtonStyle();
    await fetchPostDetail();
}


initializePostDetailPage();
