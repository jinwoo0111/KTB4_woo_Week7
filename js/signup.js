import {
    showHelperText,
    hideHelperText,
    showToastMessage
} from "./common/ui.js";

import {
    isValidEmail,
    isValidPassword,
    hasWhitespace
} from "./common/validation.js";

import {
    apiRequest
} from "./common/api.js";


// 1. HTML 요소
const profileImageInput =
    document.querySelector("#profile-image");

const profileHelperText =
    document.querySelector(".profile-helper-text");

const profilePreviewImage =
    document.querySelector(".profile-preview-image");

const profilePlusIcon =
    document.querySelector(".profile-plus-icon");

const emailInput =
    document.querySelector("#email");

const passwordInput =
    document.querySelector("#password");

const passwordConfirmInput =
    document.querySelector("#password-confirm");

const nicknameInput =
    document.querySelector("#nickname");

const emailHelperText =
    document.querySelector(".email-helper-text");

const passwordHelperText =
    document.querySelector(".password-helper-text");

const passwordConfirmHelperText =
    document.querySelector(
        ".password-confirm-helper-text"
    );

const nicknameHelperText =
    document.querySelector(".nickname-helper-text");

const signupButton =
    document.querySelector(".signup-button");

const loginButton =
    document.querySelector(".login-link-button");

const backButton =
    document.querySelector(".back-button");

const toastMessage =
    document.querySelector(".toast-message");


// 2. 에러 문구
const PROFILE_EMPTY_MESSAGE =
    "프로필 사진을 추가해주세요.";

const EMAIL_EMPTY_MESSAGE =
    "이메일을 입력해주세요.";

const EMAIL_INVALID_MESSAGE =
    "올바른 이메일 주소 형식을 입력해주세요. (예: jw@naver.com)";

const EMAIL_DUP_MESSAGE =
    "중복된 이메일 입니다.";

const PASSWORD_EMPTY_MESSAGE =
    "비밀번호를 입력해주세요.";

const PASSWORD_INVALID_MESSAGE =
    "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";

const PASSWORD_NOT_EQUAL_MESSAGE =
    "비밀번호가 다릅니다.";

const PASSWORD_CONFIRM_EMPTY_MESSAGE =
    "비밀번호를 한번 더 입력해주세요.";

const NICKNAME_EMPTY_MESSAGE =
    "닉네임을 입력해주세요.";

const NICKNAME_HAS_SPACING_MESSAGE =
    "띄어쓰기를 없애주세요.";

const NICKNAME_DUP_MESSAGE =
    "중복된 닉네임입니다.";

const NICKNAME_INVALID_MESSAGE =
    "닉네임은 최대 10자까지 작성 가능합니다.";

const SIGNUP_SUCCESS_TOAST_DURATION = 1200;

const SIGNUP_INVALID_TOAST_MESSAGE =
    "입력값을 확인해주세요.";

const SIGNUP_INVALID_TOAST_DURATION = 1600;


// 3. 선택한 프로필 이미지
let selectedProfileImageFile = null;


// 4. 프로필 이미지 검사
function validateProfileImage() {
    if(selectedProfileImageFile === null) {
        showHelperText(
            profileHelperText,
            PROFILE_EMPTY_MESSAGE
        );
        return false;
    }

    hideHelperText(profileHelperText);
    return true;
}


// 5. 이메일 검사
function validateEmail() {
    const email = emailInput.value.trim();

    if(email === "") {
        showHelperText(
            emailHelperText,
            EMAIL_EMPTY_MESSAGE
        );
        return false;
    }

    if(!isValidEmail(email)) {
        showHelperText(
            emailHelperText,
            EMAIL_INVALID_MESSAGE
        );
        return false;
    }

    hideHelperText(emailHelperText);
    return true;
}


// 6. 비밀번호 검사
function validatePassword() {
    const password = passwordInput.value.trim();

    if(password === "") {
        showHelperText(
            passwordHelperText,
            PASSWORD_EMPTY_MESSAGE
        );
        return false;
    }

    if(!isValidPassword(password)) {
        showHelperText(
            passwordHelperText,
            PASSWORD_INVALID_MESSAGE
        );
        return false;
    }

    hideHelperText(passwordHelperText);
    return true;
}


// 7. 비밀번호 확인 검사
function validatePasswordConfirm() {
    const password =
        passwordInput.value.trim();

    const passwordConfirm =
        passwordConfirmInput.value.trim();

    if(passwordConfirm === "") {
        showHelperText(
            passwordConfirmHelperText,
            PASSWORD_CONFIRM_EMPTY_MESSAGE
        );
        return false;
    }

    if(password !== passwordConfirm) {
        showHelperText(
            passwordConfirmHelperText,
            PASSWORD_NOT_EQUAL_MESSAGE
        );
        return false;
    }

    hideHelperText(passwordConfirmHelperText);
    return true;
}


// 8. 닉네임 검사
function validateNickname() {
    const nickname = nicknameInput.value;

    if(nickname.trim() === "") {
        showHelperText(
            nicknameHelperText,
            NICKNAME_EMPTY_MESSAGE
        );
        return false;
    }

    if(hasWhitespace(nickname)) {
        showHelperText(
            nicknameHelperText,
            NICKNAME_HAS_SPACING_MESSAGE
        );
        return false;
    }

    if(nickname.length > 10) {
        showHelperText(
            nicknameHelperText,
            NICKNAME_INVALID_MESSAGE
        );
        return false;
    }

    hideHelperText(nicknameHelperText);
    return true;
}


// 9. 회원가입 폼 전체 검사
function validateSignupForm() {
    const isProfileImageValid =
        validateProfileImage();

    const isEmailValid =
        validateEmail();

    const isPasswordValid =
        validatePassword();

    const isPasswordConfirmValid =
        validatePasswordConfirm();

    const isNicknameValid =
        validateNickname();

    const isFormValid =
        isProfileImageValid &&
        isEmailValid &&
        isPasswordValid &&
        isPasswordConfirmValid &&
        isNicknameValid;

    signupButton.classList.toggle(
        "active",
        isFormValid
    );

    return isFormValid;
}


function showInvalidSignupFeedback() {
    toastMessage.textContent =
        SIGNUP_INVALID_TOAST_MESSAGE;

    showToastMessage(
        toastMessage,
        SIGNUP_INVALID_TOAST_DURATION
    );

    const firstVisibleHelperText =
        document.querySelector(
            ".helper-text[style*='visible']"
        );

    if(firstVisibleHelperText !== null) {
        const invalidField =
            firstVisibleHelperText.closest(
                ".profile-section, .form-group"
            );

        if(invalidField !== null) {
            invalidField.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }
}


// 10. 프로필 이미지 선택
profileImageInput.addEventListener(
    "change",
    function() {
        const file =
            profileImageInput.files[0];

        if(file === undefined) {
            selectedProfileImageFile = null;

            profilePreviewImage.src = "";
            profilePreviewImage.style.display = "none";
            profilePlusIcon.style.display = "block";

            validateSignupForm();
            return;
        }

        selectedProfileImageFile = file;

        const imageUrl =
            URL.createObjectURL(file);

        profilePreviewImage.src = imageUrl;
        profilePreviewImage.style.display = "block";
        profilePlusIcon.style.display = "none";

        hideHelperText(profileHelperText);
        validateSignupForm();

        console.log(
            "선택한 프로필 이미지:",
            selectedProfileImageFile.name
        );
    }
);


// 11. 입력 이벤트
emailInput.addEventListener("input", function() {
    validateSignupForm();
});

passwordInput.addEventListener("input", function() {
    validateSignupForm();
});

passwordConfirmInput.addEventListener(
    "input",
    function() {
        validateSignupForm();
    }
);

nicknameInput.addEventListener("input", function() {
    validateSignupForm();
});


// 12. 회원가입 요청
signupButton.addEventListener("click", async function() {
    const isFormValid = validateSignupForm();

    if(!isFormValid) {
        showInvalidSignupFeedback();
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const nickname = nicknameInput.value.trim();
    const profileImage =
        selectedProfileImageFile.name;

    signupButton.disabled = true;

    try {
        const result = await apiRequest(
            "/users/signup",
            {
                method: "POST",
                body: JSON.stringify({
                    email: email,
                    password: password,
                    nickname: nickname,
                    profile_image: profileImage
                })
            }
        );

        if(!result.ok) {
            console.log(
                "회원가입 실패 상태코드:",
                result.status
            );

            if(result.status === 409) {
                showHelperText(
                    emailHelperText,
                    EMAIL_DUP_MESSAGE
                );

                showHelperText(
                    nicknameHelperText,
                    NICKNAME_DUP_MESSAGE
                );
                return;
            }

            showHelperText(
                emailHelperText,
                "회원가입에 실패했습니다."
            );
            return;
        }

        console.log(
            "회원가입 응답:",
            result.body
        );

        console.log("회원가입 성공");

        toastMessage.textContent =
            "회원가입 성공";

        showToastMessage(
            toastMessage,
            SIGNUP_SUCCESS_TOAST_DURATION
        );

        await new Promise(function(resolve) {
            setTimeout(
                resolve,
                SIGNUP_SUCCESS_TOAST_DURATION
            );
        });

        window.location.href = "./home.html";

    } catch(error) {
        console.error(
            "회원가입 요청 중 오류:",
            error
        );

        showHelperText(
            emailHelperText,
            "서버와 연결할 수 없습니다."
        );
    } finally {
        signupButton.disabled = false;
        validateSignupForm();
    }
});


// 13. 로그인 페이지 이동
loginButton.addEventListener("click", function() {
    window.location.href = "./login.html";
});


// 14. 뒤로가기
backButton.addEventListener("click", function() {
    window.location.href = "./login.html";
});


// 15. 초기 버튼 상태
signupButton.disabled = false;
