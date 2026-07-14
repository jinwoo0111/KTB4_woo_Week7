import {
    apiRequest
} from "./common/api.js";

import {
    requireLogin
} from "./common/auth.js";


const POST_PAGE_SIZE = 10;
const DEFAULT_VIEW_MODE = "list";
const VIEW_MODE_STORAGE_KEY = "communityPostViewMode";

const API_BASE_URL =
    "http://localhost:8080";

const DEFAULT_PROFILE_IMAGE_URL =
    "../assets/rescene-default-profile.jpg";

const writePostButton =
    document.querySelector(".write-post-button");

const postList =
    document.querySelector("#post-list");

const loadState =
    document.querySelector("#post-load-state");

const scrollSentinel =
    document.querySelector("#post-scroll-sentinel");

const scrollTopButton =
    document.querySelector(".scroll-top-button");

const viewButtons =
    document.querySelectorAll(".post-view-button");


let posts = [];
let currentViewMode =
    localStorage.getItem(VIEW_MODE_STORAGE_KEY) ??
    DEFAULT_VIEW_MODE;
let nextCursor = null;
let hasNext = true;
let isLoading = false;


function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}


function formatPostDate(createdAt) {
    if(createdAt === null || createdAt === undefined) {
        return "";
    }

    const normalizedDate = String(createdAt)
        .replace(" ", "T");

    const createdDate = new Date(normalizedDate);

    if(Number.isNaN(createdDate.getTime())) {
        return String(createdAt);
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

    return createdAt.slice(0, 10);
}


function hasImage(imageName) {
    return !(
        imageName === null ||
        imageName === undefined ||
        imageName === ""
    );
}


function createImageHTML(imageName, className) {
    if(imageName === null || imageName === undefined || imageName === "") {
        return "";
    }

    let imageSource =
        imageName;

    if(imageName.startsWith("/uploads/")) {
        imageSource =
            `${API_BASE_URL}${imageName}`;
    } else if(imageName.startsWith("uploads/")) {
        imageSource =
            `${API_BASE_URL}/${imageName}`;
    } else if(
        !imageName.startsWith("http") &&
        !imageName.startsWith("../")
    ) {
        imageSource =
            `../assets/${imageName}`;
    }

    imageSource =
        escapeHTML(imageSource);

    return `
        <div class="${className}">
            <img src="${imageSource}" alt="">
        </div>
    `;
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

function createAvatarHTML(profileImage) {
    const imageUrl =
        escapeHTML(getProfileImageUrl(profileImage));

    return `
        <div
            class="post-author-avatar"
            aria-hidden="true"
            style="background-image: url('${imageUrl}')"
        ></div>
    `;
}


function createListPostHTML(post) {
    return `
        <article class="post-item post-list-row ${hasImage(post.contentImage) ? "" : "has-no-image"}" data-post-id="${post.postId}">
            <div class="post-list-text">
                <h2 class="post-list-title">${escapeHTML(post.title)}</h2>
                <div class="post-list-meta">
                    <span>${escapeHTML(post.authorNickname)}</span>
                    <span aria-hidden="true">·</span>
                    <time>${escapeHTML(formatPostDate(post.createdAt))}</time>
                    <span aria-hidden="true">·</span>
                    <span>조회수 ${post.viewCount}</span>
                </div>
            </div>

            ${createImageHTML(post.contentImage, "post-list-thumb")}
        </article>
    `;
}


function createCardPostHTML(post) {
    return `
        <article class="post-item post-card-view ${hasImage(post.contentImage) ? "has-card-image" : "no-card-image"}" data-post-id="${post.postId}">
            <div class="post-card-author-row">
                ${createAvatarHTML(post.authorProfileImage)}
                <strong class="post-card-author">${escapeHTML(post.authorNickname)}</strong>
            </div>

            ${createImageHTML(post.contentImage, "post-card-image")}

            <h2 class="post-card-title">${escapeHTML(post.title)}</h2>

            <p class="post-card-body">${escapeHTML(post.content)}</p>

            <div class="post-card-meta">
                <time>${escapeHTML(formatPostDate(post.createdAt))}</time>
            </div>

            <div class="post-card-stats">
                <span>♥ ${post.likeCount}</span>
                <span aria-hidden="true">·</span>
                <span>댓글 ${post.commentCount}</span>
                <span aria-hidden="true">·</span>
                <span>조회수 ${post.viewCount}</span>
            </div>
        </article>
    `;
}


function updateViewModeClass() {
    postList.classList.toggle(
        "is-list-view",
        currentViewMode === "list"
    );

    postList.classList.toggle(
        "is-card-view",
        currentViewMode === "card"
    );

    viewButtons.forEach(function(button) {
        const isSelected =
            button.dataset.viewMode === currentViewMode;

        button.setAttribute(
            "aria-pressed",
            String(isSelected)
        );
    });
}


function renderPosts() {
    updateViewModeClass();

    if(posts.length === 0) {
        postList.innerHTML = `
            <p class="empty-post-message">
                아직 작성된 게시글이 없습니다.
            </p>
        `;
        return;
    }

    const postHTMLList = posts.map(function(post) {
        if(currentViewMode === "card") {
            return createCardPostHTML(post);
        }

        return createListPostHTML(post);
    });

    postList.innerHTML = postHTMLList.join("");
}


function normalizePost(post) {
    const title =
        post.title ?? "";

    return {
        postId: post.post_id,
        title: title,
        content: post.content ?? title,
        contentImage:
            post.content_image ??
            post.contentImage ??
            post.image_url ??
            post.imageUrl ??
            null,
        authorProfileImage:
            post.author_profile_image ??
            post.authorProfileImage ??
            post.profile_image ??
            post.profileImage ??
            null,
        likeCount: post.like_count ?? 0,
        commentCount: post.comment_count ?? 0,
        viewCount: post.view_count ?? 0,
        createdAt: post.created_at ?? "",
        authorNickname: post.author ?? "익명"
    };
}


function updateLoadState(message) {
    loadState.textContent = message;
}


async function fetchPosts() {
    if(isLoading || !hasNext) {
        return;
    }

    isLoading = true;
    updateLoadState("게시글을 불러오는 중입니다.");

    const searchParams =
        new URLSearchParams({
            size: String(POST_PAGE_SIZE)
        });

    if(nextCursor !== null) {
        searchParams.set(
            "cursor",
            String(nextCursor)
        );
    }

    try {
        const result = await apiRequest(
            `/posts?${searchParams.toString()}`,
            {
                skipAuth: true
            }
        );

        if(!result.ok) {
            console.log(
                "게시글 목록 조회 실패 상태코드:",
                result.status
            );

            updateLoadState(
                "게시글 목록을 불러오지 못했습니다."
            );
            return;
        }

        const postData =
            result.body?.data?.posts;

        if(!Array.isArray(postData)) {
            console.error(
                "게시글 목록 응답 형식 오류:",
                result.body
            );

            updateLoadState(
                "게시글 응답 데이터가 올바르지 않습니다."
            );
            return;
        }

        const nextPosts =
            postData.map(function(post) {
                return normalizePost(post);
            });

        posts = posts.concat(nextPosts);
        hasNext =
            result.body?.data?.has_next ?? false;
        nextCursor =
            result.body?.data?.next_cursor ?? null;

        renderPosts();

        if(posts.length === 0) {
            updateLoadState("");
            return;
        }

        updateLoadState(
            hasNext
                ? "스크롤하면 다음 게시글을 불러옵니다."
                : "마지막 게시글입니다."
        );

    } catch(error) {
        console.error(
            "게시글 목록 조회 중 오류:",
            error
        );

        updateLoadState("서버와 연결할 수 없습니다.");
    } finally {
        isLoading = false;
    }
}


writePostButton.addEventListener("click", function() {
    if(!requireLogin()) {
        return;
    }

    window.location.href = "./post-create.html";
});


viewButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        currentViewMode =
            button.dataset.viewMode ?? DEFAULT_VIEW_MODE;

        localStorage.setItem(
            VIEW_MODE_STORAGE_KEY,
            currentViewMode
        );

        renderPosts();
    });
});


postList.addEventListener("click", function(event) {
    const postItem =
        event.target.closest(".post-item");

    if(postItem === null) {
        return;
    }

    const postId =
        postItem.dataset.postId;

    window.location.href =
        `./post-detail.html?postId=${postId}`;
});


scrollTopButton.addEventListener("click", function() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


window.addEventListener("scroll", function() {
    const shouldShowButton =
        window.scrollY > 420;

    scrollTopButton.classList.toggle(
        "is-visible",
        shouldShowButton
    );
});


const observer =
    new IntersectionObserver(function(entries) {
        const firstEntry = entries[0];

        if(firstEntry.isIntersecting) {
            fetchPosts();
        }
    }, {
        rootMargin: "400px 0px"
    });

observer.observe(scrollSentinel);

updateViewModeClass();
fetchPosts();
