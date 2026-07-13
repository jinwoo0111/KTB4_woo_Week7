import {
    showHelperText,
    hideHelperText
} from "./common/ui.js";

import {
    apiRequest
} from "./common/api.js";

import {
    requireLogin
} from "./common/auth.js";


// 1. HTML 요소
const titleInput =
    document.querySelector("#post-title");

const contentInput =
    document.querySelector("#post-content");

const imageInput =
    document.querySelector("#post-image");

const postHelperText =
    document.querySelector(".post-helper-text");

const postSubmitButton =
    document.querySelector(".post-submit-button");

const headerProfileButton =
    document.querySelector(".header-profile-button");


// 2. 메시지
const TITLE_N_CONTENT_NOT_VALID_MESSAGE =
    "제목, 내용을 모두 작성해주세요.";


// 3. 선택한 이미지
let selectedImageFile = null;


// 4. 제목 검사
function isTitleValid() {
    const title = titleInput.value.trim();

    return title !== "" && title.length <= 26;
}


// 5. 내용 검사
function isContentValid() {
    const content = contentInput.value.trim();

    return content !== "";
}


// 6. 게시글 작성 폼 검사
function isPostCreateFormValid() {
    return isTitleValid() && isContentValid();
}


// 7. 완료 버튼 스타일
function updateSubmitButtonStyle() {
    const isFormValid =
        isPostCreateFormValid();

    postSubmitButton.classList.toggle(
        "active",
        isFormValid
    );
}


// 8. 제목 입력 이벤트
titleInput.addEventListener("input", function() {
    updateSubmitButtonStyle();

    if(isPostCreateFormValid()) {
        hideHelperText(postHelperText);
    }
});


// 9. 내용 입력 이벤트
contentInput.addEventListener("input", function() {
    updateSubmitButtonStyle();

    if(isPostCreateFormValid()) {
        hideHelperText(postHelperText);
    }
});


// 10. 이미지 선택 이벤트
imageInput.addEventListener("change", function() {
    const file = imageInput.files[0];

    if(file === undefined) {
        selectedImageFile = null;

        console.log("이미지 선택 취소");
        return;
    }

    selectedImageFile = file;

    console.log(
        "선택된 이미지 파일:",
        selectedImageFile.name
    );
});


// 11. 게시글 작성 요청
postSubmitButton.addEventListener(
    "click",
    async function() {
        const isFormValid =
            isPostCreateFormValid();

        if(!isFormValid) {
            showHelperText(
                postHelperText,
                TITLE_N_CONTENT_NOT_VALID_MESSAGE
            );
            return;
        }

        if(!requireLogin()) {
            return;
        }

        const title =
            titleInput.value.trim();

        const content =
            contentInput.value.trim();

        let contentImage = null;

        if(selectedImageFile !== null) {
            contentImage =
                selectedImageFile.name;
        }

        postSubmitButton.disabled = true;

        try {
            const result = await apiRequest(
                "/posts",
                {
                    method: "POST",
                    body: JSON.stringify({
                        title: title,
                        content: content,
                        content_image: contentImage
                    })
                }
            );

            if(!result.ok) {
                console.log(
                    "게시글 작성 실패 상태코드:",
                    result.status
                );

                showHelperText(
                    postHelperText,
                    "게시글 작성에 실패했습니다."
                );
                return;
            }

            console.log(
                "게시글 작성 응답:",
                result.body
            );

            console.log("게시글 작성 성공");

            window.location.href = "./posts.html";

        } catch(error) {
            console.error(
                "게시글 작성 중 오류:",
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


// 12. 회원정보 페이지 이동
headerProfileButton.addEventListener(
    "click",
    function() {
        window.location.href = "./user-edit.html";
    }
);


// 13. 초기 버튼 스타일
updateSubmitButtonStyle();
