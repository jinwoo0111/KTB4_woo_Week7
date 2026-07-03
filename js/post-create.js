const API_BASE_URL = "http://localhost:8080";
// 1. HTML 요소
const titleInput = document.querySelector("#post-title");
const contentInput = document.querySelector("#post-content");
const imageInput = document.querySelector("#post-image");

const postHelperText = document.querySelector(".post-helper-text");

const postSubmitButton = document.querySelector(".post-submit-button");
const backButton = document.querySelector(".back-button");
const headerProfileButton = document.querySelector(".header-profile-button");


// 2. 메시지
const TITLE_N_CONTENT_NOT_VALID_MESSAGE = "제목, 내용을 모두 작성해주세요.";


// 3. 이미지 파일을 임시로 저장할 변수
let selectedImageFile = null;


// 4. helper text 제어 함수
function showHelperText(helperTextElement, message) {
    helperTextElement.textContent = message;
    helperTextElement.style.visibility = "visible";
}

function hideHelperText(helperTextElement) {
    helperTextElement.style.visibility = "hidden";
}


// 5. 제목 입력 여부 확인
function isTitleValid() {
    const title = titleInput.value.trim();

    return title !== "" && title.length <= 26;
}


// 6. 내용 입력 여부 확인
function isContentValid() {
    const content = contentInput.value.trim();

    return content !== "";
}


// 7. 제목 + 내용 전체 확인
function isPostCreateFormValid() {
    return isTitleValid() && isContentValid();
}


// 8. 버튼 색상 변경
function updateSubmitButtonStyle() {
    const isFormValid = isPostCreateFormValid();

    postSubmitButton.classList.toggle("active", isFormValid);
}


// 9. 제목 입력 이벤트
titleInput.addEventListener("input", function() {
    updateSubmitButtonStyle();

    if(isPostCreateFormValid()) {
        hideHelperText(postHelperText);
    }
});


// 10. 내용 입력 이벤트
contentInput.addEventListener("input", function() {
    updateSubmitButtonStyle();

    if(isPostCreateFormValid()) {
        hideHelperText(postHelperText);
    }
});


// 11. 이미지 선택 이벤트
imageInput.addEventListener("change", function() {
    const file = imageInput.files[0];

    if(file === undefined) {
        selectedImageFile = null;
        console.log("이미지 선택 취소");
        return;
    }

    selectedImageFile = file;

    console.log("선택된 이미지 파일:", selectedImageFile.name);
});


// 12. 완료 버튼 클릭 이벤트 -> Fetch 적용
postSubmitButton.addEventListener("click", async function() {
    const isFormValid = isPostCreateFormValid();

    if(!isFormValid) {
        showHelperText(postHelperText, TITLE_N_CONTENT_NOT_VALID_MESSAGE);
        return;
    }

    const userId = localStorage.getItem("userId");

    if(userId === null) {
        window.location.href = "./login.html";
        return;
    }

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    let contentImage = null;

    if(selectedImageFile !== null) {
        contentImage = selectedImageFile.name;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                content: content,
                content_image: contentImage,
                author_id: Number(userId)
            })
        });

        if(!response.ok) {
            console.log("게시글 작성 실패 상태코드:", response.status);
            showHelperText(postHelperText, "게시글 작성에 실패했습니다.");
            return;
        }


        console.log("게시글 작성 성공");

        window.location.href = "./posts.html";

    } catch(error) {
        console.error("게시글 작성 중 에러:", error);
        showHelperText(postHelperText, "서버와 연결할 수 없습니다.");
    }
});

// 13. 뒤로가기 버튼 클릭 이벤트
backButton.addEventListener("click", function() {
    window.location.href = "./posts.html";
});


// 14. 상단 프로필 버튼 클릭 이벤트
headerProfileButton.addEventListener("click", function() {
    window.location.href = "./user-edit.html";
});


// 15. 초기 버튼 스타일 설정
updateSubmitButtonStyle();