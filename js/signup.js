const API_BASE_URL = "http://localhost:8080";

// 1. HTML 요소
const profileImageInput = document.querySelector("#profile-image");
const profileHelperText = document.querySelector(".profile-helper-text");
const profilePreviewImage = document.querySelector(".profile-preview-image");
const profilePlusIcon = document.querySelector(".profile-plus-icon");

const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const passwordConfirmInput = document.querySelector("#password-confirm");
const nicknameInput = document.querySelector("#nickname");

const emailHelperText = document.querySelector(".email-helper-text");
const passwordHelperText = document.querySelector(".password-helper-text");
const passwordConfirmHelperText = document.querySelector(".password-confirm-helper-text");
const nicknameHelperText = document.querySelector(".nickname-helper-text");

const signupButton = document.querySelector(".signup-button");
const loginButton = document.querySelector(".login-link-button");
const backButton = document.querySelector(".back-button");

// 2. 에러 문구
const PROFILE_EMPTY_MESSAGE = "프로필 사진을 추가해주세요.";

const EMAIL_EMPTY_MESSAGE = "이메일을 입력해주세요.";
const EMAIL_INVALID_MESSAGE = "올바른 이메일 주소 형식을 입력해주세요. (예: jw@naver.com)";
const EMAIL_DUP_MESSAGE = "중복된 이메일 입니다.";

const PASSWORD_EMPTY_MESSAGE = "비밀번호를 입력해주세요.";
const PASSWORD_INVALID_MESSAGE = "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
const PASSWORD_NOT_EQUAL_MESSAGE = "비밀번호가 다릅니다.";
const PASSWORDCONFIRM_EMPTY_MESSAGE = "비밀번호를 한번 더 입력해주세요.";

const NICKNAME_EMPTY_MESSAGE = "닉네임을 입력해주세요.";
const NICKNAME_HAS_SPACING_MESSAGE = "띄어쓰기를 없애주세요.";
const NICKNAME_DUP_MESSAGE = "중복된 닉네임입니다.";
const NICKNAME_INVALID_MESSAGE = "닉네임은 최대 10자까지 작성 가능합니다.";

// 3. 정규식
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

// 4. 선택한 프로필 이미지 파일 저장 변수
let selectedProfileImageFile = null;

// 5. helper text 제어 함수
function showHelperText(helperTextElement, message) {
    helperTextElement.textContent = message;
    helperTextElement.style.visibility = "visible";
}

function hideHelperText(helperTextElement) {
    helperTextElement.style.visibility = "hidden";
}

// 6. 프로필 이미지 검사
function validateProfileImage() {
    if(selectedProfileImageFile === null) {
        showHelperText(profileHelperText, PROFILE_EMPTY_MESSAGE);
        return false;
    }

    hideHelperText(profileHelperText);
    return true;
}

// 7. 이메일 검사 함수
function validateEmail() {
    const email = emailInput.value.trim();

    if(email === "") {
        showHelperText(emailHelperText, EMAIL_EMPTY_MESSAGE);
        return false;
    }

    if(!emailRegex.test(email)) {
        showHelperText(emailHelperText, EMAIL_INVALID_MESSAGE);
        return false;
    }

    hideHelperText(emailHelperText);
    return true;
}

// 8. 비밀번호 검사 함수
function validatePassword() {
    const password = passwordInput.value.trim();

    if(password === "") {
        showHelperText(passwordHelperText, PASSWORD_EMPTY_MESSAGE);
        return false;
    }

    if(!passwordRegex.test(password)) {
        showHelperText(passwordHelperText, PASSWORD_INVALID_MESSAGE);
        return false;
    }

    hideHelperText(passwordHelperText);
    return true;
}

// 9. 비밀번호 확인 검사 함수
function validatePasswordConfirm() {
    const password = passwordInput.value.trim();
    const passwordConfirm = passwordConfirmInput.value.trim();

    if(passwordConfirm === "") {
        showHelperText(passwordConfirmHelperText, PASSWORDCONFIRM_EMPTY_MESSAGE);
        return false;
    }

    if(password !== passwordConfirm) {
        showHelperText(passwordConfirmHelperText, PASSWORD_NOT_EQUAL_MESSAGE);
        return false;
    }

    hideHelperText(passwordConfirmHelperText);
    return true;
}

// 10. 닉네임 검사 함수
function validateNickname() {
    const nickname = nicknameInput.value;

    if(nickname.trim() === "") {
        showHelperText(nicknameHelperText, NICKNAME_EMPTY_MESSAGE);
        return false;
    }

    if(/\s/.test(nickname)) {
        showHelperText(nicknameHelperText, NICKNAME_HAS_SPACING_MESSAGE);
        return false;
    }

    if(nickname.length > 10) {
        showHelperText(nicknameHelperText, NICKNAME_INVALID_MESSAGE);
        return false;
    }

    hideHelperText(nicknameHelperText);
    return true;
}

// 11. 전체 form 검사 + 버튼 상태 변경
function validateSignupForm() {
    const isProfileImageValid = validateProfileImage();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isPasswordConfirmValid = validatePasswordConfirm();
    const isNicknameValid = validateNickname();

    const isFormValid =
        isProfileImageValid &&
        isEmailValid &&
        isPasswordValid &&
        isPasswordConfirmValid &&
        isNicknameValid;

    signupButton.disabled = !isFormValid;
    signupButton.classList.toggle("active", isFormValid);

    return isFormValid;
}

// 12. 프로필 이미지 선택 이벤트
profileImageInput.addEventListener("change", function() {
    const file = profileImageInput.files[0];

    if(file === undefined) {
        selectedProfileImageFile = null;

        profilePreviewImage.src = "";
        profilePreviewImage.style.display = "none";
        profilePlusIcon.style.display = "block";

        validateSignupForm();
        return;
    }

    selectedProfileImageFile = file;

    const imageUrl = URL.createObjectURL(file);

    profilePreviewImage.src = imageUrl;
    profilePreviewImage.style.display = "block";
    profilePlusIcon.style.display = "none";

    hideHelperText(profileHelperText);
    validateSignupForm();

    console.log("선택한 프로필 이미지 파일:", selectedProfileImageFile);
    console.log("서버로 보낼 프로필 이미지 파일명:", selectedProfileImageFile.name);
});

// 13. input 이벤트 연결
emailInput.addEventListener("input", function() {
    validateSignupForm();
});

passwordInput.addEventListener("input", function() {
    validateSignupForm();
});

passwordConfirmInput.addEventListener("input", function() {
    validateSignupForm();
});

nicknameInput.addEventListener("input", function() {
    validateSignupForm();
});

// 14. 회원가입 버튼 클릭 이벤트 - Fetch 적용
signupButton.addEventListener("click", async function() {
    const isFormValid = validateSignupForm();

    if(!isFormValid) {
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const nickname = nicknameInput.value.trim();
    const profileImage = selectedProfileImageFile.name;

    try {
        const response = await fetch(`${API_BASE_URL}/users/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password,
                nickname: nickname,
                profile_image: profileImage
            })
        });

        if(!response.ok) {
            console.log("회원가입 실패 상태코드:", response.status);

            if(response.status === 409) {
                showHelperText(emailHelperText, EMAIL_DUP_MESSAGE);
                showHelperText(nicknameHelperText, NICKNAME_DUP_MESSAGE);
                return;
            }

            showHelperText(emailHelperText, "회원가입에 실패했습니다.");
            return;
        }

        const data = await response.json();

        console.log("회원가입 응답:", data);
        console.log("회원가입 성공");

        window.location.href = "./login.html";
    } catch(error) {
        console.error("회원가입 요청 중 오류:", error);
        showHelperText(emailHelperText, "서버와 연결할 수 없습니다.");
    }
});

// 15. 로그인 하러 가기 버튼 클릭 이벤트
loginButton.addEventListener("click", function() {
    window.location.href = "./login.html";
});

// 16. back 버튼 클릭 이벤트
backButton.addEventListener("click", function() {
    window.location.href = "./login.html";
});

// 17. 초기 버튼 상태 설정
signupButton.disabled = true;