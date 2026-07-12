import {
    apiRequest
} from "./common/api.js";

import {
    requireLogin
} from "./common/auth.js";


const writePostButton =
    document.querySelector(".write-post-button");

const postList =
    document.querySelector("#post-list");

const headerProfileButton =
    document.querySelector(".header-profile-button");


// 게시글 카드 HTML 생성
function createPostCardHTML(post) {
    return `
        <article class="post-card" data-post-id="${post.postId}">
            <div class="post-card-content">
                <h2 class="post-title">${post.title}</h2>

                <div class="post-info-row">
                    <div class="post-stats">
                        <span>좋아요 ${post.likeCount}</span>
                        <span>댓글 ${post.commentCount}</span>
                        <span>조회수 ${post.viewCount}</span>
                    </div>

                    <time class="post-date">${post.createdAt}</time>
                </div>
            </div>

            <div class="post-author-row">
                <div class="author-profile"></div>
                <span class="author-name">${post.authorNickname}</span>
            </div>
        </article>
    `;
}


// 게시글 목록 렌더링
function renderPosts(posts) {
    postList.innerHTML = "";

    if(posts.length === 0) {
        postList.innerHTML = `
            <p class="empty-post-message">
                아직 작성된 게시글이 없습니다.
            </p>
        `;
        return;
    }

    posts.forEach(function(post) {
        const postCardHTML =
            createPostCardHTML(post);

        postList.insertAdjacentHTML(
            "beforeend",
            postCardHTML
        );
    });
}


// 백엔드 snake_case 응답을 camelCase로 변경
function normalizePost(post) {
    return {
        postId: post.post_id,
        title: post.title,
        likeCount: post.like_count,
        commentCount: post.comment_count,
        viewCount: post.view_count,
        createdAt: post.created_at,
        authorNickname: post.author
    };
}


// 게시글 목록 조회
async function fetchPosts() {
    try {
        const result = await apiRequest("/posts");

        if(!result.ok) {
            console.log(
                "게시글 목록 조회 실패 상태코드:",
                result.status
            );

            postList.innerHTML = `
                <p class="empty-post-message">
                    게시글 목록을 불러오지 못했습니다.
                </p>
            `;
            return;
        }

        console.log(
            "게시글 목록 응답:",
            result.body
        );

        const postData =
            result.body?.data?.posts;

        if(!Array.isArray(postData)) {
            console.error(
                "게시글 목록 응답 형식 오류:",
                result.body
            );

            postList.innerHTML = `
                <p class="empty-post-message">
                    게시글 응답 데이터가 올바르지 않습니다.
                </p>
            `;
            return;
        }

        const posts = postData.map(function(post) {
            return normalizePost(post);
        });

        renderPosts(posts);

    } catch(error) {
        console.error(
            "게시글 목록 조회 중 오류:",
            error
        );

        postList.innerHTML = `
            <p class="empty-post-message">
                서버와 연결할 수 없습니다.
            </p>
        `;
    }
}


// 게시글 작성 페이지 이동
writePostButton.addEventListener("click", function() {
    if(!requireLogin()) {
        return;
    }

    window.location.href = "./post-create.html";
});


// 게시글 카드 클릭
postList.addEventListener("click", function(event) {
    const postCard =
        event.target.closest(".post-card");

    if(postCard === null) {
        return;
    }

    const postId =
        postCard.dataset.postId;

    window.location.href =
        `./post-detail.html?postId=${postId}`;
});


// 회원정보 페이지 이동
headerProfileButton.addEventListener(
    "click",
    function() {
        window.location.href = "./user-edit.html";
    }
);


// 최초 게시글 목록 조회
fetchPosts();