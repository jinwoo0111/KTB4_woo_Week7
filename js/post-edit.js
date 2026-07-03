const API_BASE_URL = "http://localhost:8080";

const params = new URLSearchParams(window.location.search);
const postId = Number(params.get("postId")) || 1;


const titleInput = document.querySelector("#post-title");
const contentInput = document.querySelector("#post-content");
const imageInput = document.querySelector("#post-image");

const postHelperText = document.querySelector(".post-helper-text");
const existingFileName = document.querySelector(".existing-file-name");

const headerProfileButton = document.querySelector(".header-profile-button");
const postSubmitButton = document.querySelector(".post-submit-button");
const backButton = document.querySelector(".back-button");

const TITLE_EMPTY_MESSAGE = "제목을 입력해주세요.";
const TITLE_INVALID_MESSAGE = "제목은 최대 26자까지 입니다.";
const CONTENT_EMPTY_MESSAGE = "내용을 입력해주세요.";
const TITLE_N_CONTENT_NOT_VALID_MESSAGE = "제목, 내용을 모두 작성해주세요.";

// 새로 선택한 이미지 파일을 저장할 변수
let selectedImageFile = null;

// 기존 게시글 이미지 파일명을 저장할 변수
let currentContentImage = null;

function showHelperText(helperTextElement, message) {
    helperTextElement.textContent = message;
    helperTextElement.style.visibility = "visible";
}

function hideHelperText(helperTextElement) {
    helperTextElement.style.visibility = "hidden";
}

function validateTitle() {
    const title = titleInput.value.trim();

    if(title === "") {
        return false;
    }

    if(title.length > 26) {
        return false;
    }

    return true;
}

function validateContent() {
    const content = contentInput.value.trim();

    if(content === "") {
        return false;
    }

    return true;
}

function normalizePostDetail(post) {
    return {
        postId: post.post_id ?? post.postId ?? post.id,
        title: post.title,
        content: post.content,
        contentImage: post.content_image ?? post.contentImage ?? null
    };
}

function renderPostEditForm(post) {
    if(post === undefined || post === null) {
        alert("게시글을 찾을 수 없습니다.");
        window.location.href = "./posts.html";
        return;
    }

    titleInput.value = post.title;
    contentInput.value = post.content;

    currentContentImage = post.contentImage;

    if(post.contentImage === null || post.contentImage === "") {
        existingFileName.textContent = "기존 이미지 없음";
    }
    else {
        existingFileName.textContent = post.contentImage;
    }
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

        const post = normalizePostDetail(responseBody.data);

        renderPostEditForm(post);

        // 기존 데이터가 들어간 상태에서 버튼 active 상태를 한 번 계산함
        updatePostSubmitButtonStyle();

    } catch(error) {
        console.error("게시글 상세 조회 중 오류:", error);
        alert("서버와 연결할 수 없습니다.");
        window.location.href = "./posts.html";
    }
}

function validatePostEditForm() {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if(title === "" && content === "") {
        showHelperText(postHelperText, TITLE_N_CONTENT_NOT_VALID_MESSAGE);
        return false;
    }

    if(title === "") {
        showHelperText(postHelperText, TITLE_EMPTY_MESSAGE);
        return false;
    }

    if(title.length > 26) {
        showHelperText(postHelperText, TITLE_INVALID_MESSAGE);
        return false;
    }

    if(content === "") {
        showHelperText(postHelperText, CONTENT_EMPTY_MESSAGE);
        return false;
    }

    hideHelperText(postHelperText);
    return true;
}


// 수정하기 버튼 active 처리
function updatePostSubmitButtonStyle() {
    const isFormValid = validatePostEditForm();

    postSubmitButton.classList.toggle("active", isFormValid);

    return isFormValid;
}


// 제목을 수정할 때마다 유효성 검사와 버튼 스타일을 다시 처리
titleInput.addEventListener("input", function() {
    updatePostSubmitButtonStyle();
});


// 내용을 수정할 때마다 유효성 검사와 버튼 스타일을 다시 처리
contentInput.addEventListener("input", function() {
    updatePostSubmitButtonStyle();
});


// 이미지 변경 이벤트 처리
imageInput.addEventListener("change", function() {
    const file = imageInput.files[0];

    if(file === undefined) {
        selectedImageFile = null;
        console.log("이미지 선택 취소");
        return;
    }

    selectedImageFile = file;
    existingFileName.textContent = file.name;

    console.log("새로 선택한 이미지 파일:", selectedImageFile.name);
});


// 수정하기 버튼 클릭 이벤트
postSubmitButton.addEventListener("click", async function() {
    const isFormValid = validatePostEditForm();

    if(!isFormValid) {
        postSubmitButton.classList.remove("active");
        return;
    }

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    let contentImage = currentContentImage;

    if(selectedImageFile !== null) {
        contentImage = selectedImageFile.name;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                content: content,
                content_image: contentImage
            })
        });

        if(!response.ok) {
            console.log("게시글 수정 실패 상태코드:", response.status);
            showHelperText(postHelperText, "게시글 수정에 실패했습니다.");
            return;
        }

        const responseBody = await response.json();

        console.log("게시글 수정 응답:", responseBody);
        console.log("게시글 수정 성공");

        window.location.href = `./post-detail.html?postId=${postId}`;

    } catch(error) {
        console.error("게시글 수정 중 오류:", error);
        showHelperText(postHelperText, "서버와 연결할 수 없습니다.");
    }
});


// 뒤로가기 버튼 클릭 이벤트
backButton.addEventListener("click", function() {
    window.location.href = `./post-detail.html?postId=${postId}`;
});


// 상단 프로필 버튼 클릭 이벤트
headerProfileButton.addEventListener("click", function() {
    window.location.href = "./user-edit.html";
});


// 페이지가 처음 열렸을 때 기존 게시글 데이터를 화면에 보여줌
fetchPostDetail();