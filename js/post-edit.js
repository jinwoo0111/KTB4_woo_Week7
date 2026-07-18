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
    requireLogin
} from "./common/auth.js";


// URL 파라미터
const params =
    new URLSearchParams(window.location.search);

const postId =
    parsePositiveIntegerParam(
        params,
        "postId"
    );


// HTML 요소
const titleInput =
    document.querySelector("#post-title");

const contentInput =
    document.querySelector("#post-content");

const imageInput =
    document.querySelector("#post-image");

const postHelperText =
    document.querySelector(".post-helper-text");

const existingFileName =
    document.querySelector(".existing-file-name");

const imageRemoveButton =
    document.querySelector(".image-remove-button");

const headerProfileButton =
    document.querySelector(".header-profile-button");

const postSubmitButton =
    document.querySelector(".post-submit-button");


// 메시지
const TITLE_EMPTY_MESSAGE =
    "제목을 입력해주세요.";

const TITLE_INVALID_MESSAGE =
    "제목은 최대 26자까지 입니다.";

const CONTENT_EMPTY_MESSAGE =
    "내용을 입력해주세요.";

const TITLE_N_CONTENT_NOT_VALID_MESSAGE =
    "제목, 내용을 모두 작성해주세요.";


// 이미지 상태
let selectedImageFile = null;
let currentContentImage = null;
let isImageRemoved = false;


// 제목 검사
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


// 내용 검사
function validateContent() {
    const content = contentInput.value.trim();

    return content !== "";
}


// 게시글 수정 폼 검사
function validatePostEditForm() {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if(title === "" && content === "") {
        showHelperText(
            postHelperText,
            TITLE_N_CONTENT_NOT_VALID_MESSAGE
        );
        return false;
    }

    if(title === "") {
        showHelperText(
            postHelperText,
            TITLE_EMPTY_MESSAGE
        );
        return false;
    }

    if(title.length > 26) {
        showHelperText(
            postHelperText,
            TITLE_INVALID_MESSAGE
        );
        return false;
    }

    if(content === "") {
        showHelperText(
            postHelperText,
            CONTENT_EMPTY_MESSAGE
        );
        return false;
    }

    hideHelperText(postHelperText);
    return true;
}


// 완료 버튼 스타일
function updatePostSubmitButtonStyle() {
    const isFormValid =
        validateTitle() &&
        validateContent();

    postSubmitButton.classList.toggle(
        "active",
        isFormValid
    );

    if(isFormValid) {
        hideHelperText(postHelperText);
    }

    return isFormValid;
}


// 게시글 상세 데이터 변환
function normalizePostDetail(post) {
    return {
        postId:
            post.post_id ??
            post.postId ??
            post.id,

        title:
            post.title ?? "",

        content:
            post.content ?? "",

        contentImage:
            post.content_image ??
            post.contentImage ??
            null
    };
}


// 수정 폼에 기존 데이터 표시
function renderPostEditForm(post) {
    if(post === null || post === undefined) {
        alert("게시글을 찾을 수 없습니다.");
        window.location.href = "./posts.html";
        return;
    }

    titleInput.value = post.title;
    contentInput.value = post.content;

    currentContentImage = post.contentImage;
    isImageRemoved = false;

    if(existingFileName !== null) {
        if(
            post.contentImage === null ||
            post.contentImage === ""
        ) {
            existingFileName.textContent =
                "기존 이미지 없음";
        } else {
            existingFileName.textContent =
                post.contentImage;
        }
    }

    updatePostSubmitButtonStyle();
}


// 기존 게시글 상세 조회
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

        const postData = result.body?.data;

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
            window.location.href = "./posts.html";
            return;
        }

        const post =
            normalizePostDetail(postData);

        renderPostEditForm(post);

    } catch(error) {
        console.error(
            "게시글 상세 조회 중 오류:",
            error
        );

        alert("서버와 연결할 수 없습니다.");
        window.location.href = "./posts.html";
    }
}


// 제목 입력
titleInput.addEventListener("input", function() {
    updatePostSubmitButtonStyle();
});


// 내용 입력
contentInput.addEventListener("input", function() {
    updatePostSubmitButtonStyle();
});


// 새 이미지 선택
imageInput.addEventListener("change", function() {
    const file = imageInput.files[0];

    if(file === undefined) {
        selectedImageFile = null;

        if(existingFileName !== null) {
            existingFileName.textContent =
                currentContentImage ?? "기존 이미지 없음";
        }

        console.log("이미지 선택 취소");
        return;
    }

    selectedImageFile = file;
    isImageRemoved = false;

    if(existingFileName !== null) {
        existingFileName.textContent = file.name;
    }

    console.log(
        "새로 선택한 이미지 파일:",
        selectedImageFile.name
    );
});


// 기존 또는 새 이미지 삭제
imageRemoveButton.addEventListener(
    "click",
    function() {
        selectedImageFile = null;
        currentContentImage = null;
        isImageRemoved = true;
        imageInput.value = "";

        if(existingFileName !== null) {
            existingFileName.textContent =
                "이미지 없음";
        }
    }
);


// 게시글 수정 요청
postSubmitButton.addEventListener(
    "click",
    async function() {
        const isFormValid =
            validatePostEditForm();

        if(!isFormValid) {
            postSubmitButton.classList.remove(
                "active"
            );
            return;
        }

        const title =
            titleInput.value.trim();

        const content =
            contentInput.value.trim();

        let contentImage =
            isImageRemoved
                ? ""
                : currentContentImage;

        postSubmitButton.disabled = true;

        try {
            if(selectedImageFile !== null) {
                const imageFormData =
                    new FormData();

                imageFormData.append(
                    "file",
                    selectedImageFile
                );

                const uploadResult = await apiRequest(
                    "/uploads/post",
                    {
                        method: "POST",
                        body: imageFormData
                    }
                );

                if(
                    !uploadResult.ok ||
                    uploadResult.body?.data?.path === undefined
                ) {
                    if(uploadResult.authExpired) {
                        return;
                    }

                    showHelperText(
                        postHelperText,
                        "이미지 업로드에 실패했습니다."
                    );
                    return;
                }

                contentImage =
                    uploadResult.body.data.path;
            }

            const result = await apiRequest(
                `/posts/${postId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        title: title,
                        content: content,
                        content_image: contentImage
                    })
                }
            );

            if(!result.ok) {
                console.error(
                    "게시글 수정 실패:",
                    result.status,
                    result.body
                );

                if(result.authExpired) {
                    return;
                }

                if(result.errorType === "forbidden") {
                    showHelperText(
                        postHelperText,
                        "게시글을 수정할 권한이 없습니다."
                    );
                    return;
                }

                showHelperText(
                    postHelperText,
                    "게시글 수정에 실패했습니다."
                );
                return;
            }

            console.log(
                "게시글 수정 응답:",
                result.body
            );

            console.log("게시글 수정 성공");

            window.location.href =
                `./post-detail.html?postId=${postId}`;

        } catch(error) {
            console.error(
                "게시글 수정 중 오류:",
                error
            );

            showHelperText(
                postHelperText,
                "서버와 연결할 수 없습니다."
            );
        } finally {
            postSubmitButton.disabled = false;
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
async function initializePostEditPage() {
    if(!requireLogin()) {
        return;
    }

    if(postId === null) {
        alert("잘못된 게시글 주소입니다.");
        window.location.replace("./posts.html");
        return;
    }

    await fetchPostDetail();
}


initializePostEditPage();
