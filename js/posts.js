const API_BASE_URL = "http://localhost:8080";

const writePostButton = document.querySelector(".write-post-button");

const postList = document.querySelector("#post-list");

const headerProfileButton = document.querySelector(".header-profile-button");


// 객체 받아서 게시글 카드(요약?) HTML 문자열 만드는 함수
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
            <p class = "empty-post-message">
                아직 작성된 게시글이 없습니다.
            </p>
        `;
        return ;
    }

    posts.forEach(function (post) {
        const postCardHTML = createPostCardHTML(post);

        postList.insertAdjacentHTML("beforeend", postCardHTML);
    });

}

// 백엔드 응답 데이터 형식 변경
// 백엔드 snack_case -> camelCase로 (post_id -> postId)
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


// 게시글 목록 Fetch 요청 함수
async function fetchPosts() {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`);

        if(!response.ok) {
            console.log("게시글 목록 조회 실패 : ", response.status);

            postList.innerHTML = `
                <p class="empty-post-message">
                    게시글 목록을 불러오지 못했습니다.
                </p>
            `;
            return;
        }

        const responseBody = await response.json();

        //확인용코드
        console.log("게시글 목록 응답: ", responseBody);

        const postData = responseBody.data.posts || [];

        const posts = postData.map(function(post) {
            return normalizePost(post);
        });

        renderPosts(posts);
    } catch (error) {
        console.error("게시글 목록 조회 중 오류 : ", error);

        postList.innerHTML = `
            <p class="empty-post-message">
                서버와 연결할 수 없습니다.
            </p>
        `;
    }
}

writePostButton.addEventListener("click", function() {
    const userId = localStorage.getItem("userId");

    if(userId === null) {
        window.location.href = "./login.html";
        return;
    }

    window.location.href = "./post-create.html";
});

postList.addEventListener("click", function(event) {
    // 클릭에서 가장 가까운 Post-card
    const postCard = event.target.closest(".post-card");

    if (postCard === null) {
        return ;
    }

    const postId = postCard.dataset.postId;

    window.location.href = `./post-detail.html?postId=${postId}`;
});

headerProfileButton.addEventListener("click", function () {
    window.location.href = "./user-edit.html";
});

fetchPosts();