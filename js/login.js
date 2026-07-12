import {
    showHelperText,
    hideHelperText
} from "./common/ui.js";

import {
    isValidEmail,
    isValidPassword
} from "./common/validation.js";

import {
    saveAuth
} from "./common/auth.js";

import {
    apiRequest
} from "./common/api.js";


// 1. HTML 요소
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");

const emailHelperText =
    document.querySelector(".email-helper-text");

const passwordHelperText =
    document.querySelector(".password-helper-text");

const loginFailHelperText =
    document.querySelector(".login-fail-helper-text");

const loginButton =
    document.querySelector(".login-button");

const signupButton =
    document.querySelector(".signup-button");


// 2. 에러 문구
const EMAIL_EMPTY_MESSAGE =
    "이메일을 입력해주세요.";

const EMAIL_INVALID_MESSAGE =
    "올바른 이메일 주소 형식을 입력해주세요. (예: jw@naver.com)";

const PASSWORD_EMPTY_MESSAGE =
    "비밀번호를 입력해주세요.";

const PASSWORD_INVALID_MESSAGE =
    "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";

const LOGIN_FAIL_MESSAGE =
    "아이디 또는 비밀번호를 확인해주세요.";


// 3. 이메일 검사
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


// 4. 비밀번호 검사
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


// 5. 전체 로그인 폼 검사
function validateLoginForm() {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    const isFormValid =
        isEmailValid && isPasswordValid;

    loginButton.disabled = !isFormValid;
    loginButton.classList.toggle(
        "active",
        isFormValid
    );

    return isFormValid;
}


// 6. 입력 이벤트
emailInput.addEventListener("input", function() {
    hideHelperText(loginFailHelperText);
    validateLoginForm();
});

passwordInput.addEventListener("input", function() {
    hideHelperText(loginFailHelperText);
    validateLoginForm();
});


// 7. 로그인 요청
loginButton.addEventListener("click", async function() {
    hideHelperText(loginFailHelperText);

    const isFormValid = validateLoginForm();

    if(!isFormValid) {
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    loginButton.disabled = true;

    try {
        const result = await apiRequest(
            "/users/login",
            {
                method: "POST",
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        if(!result.ok) {
            console.log(
                "로그인 실패 상태코드:",
                result.status
            );

            showHelperText(
                loginFailHelperText,
                LOGIN_FAIL_MESSAGE
            );
            return;
        }

        const token =
            result.response.headers.get(
                "Authorization"
            );

        if(!token) {
            showHelperText(
                loginFailHelperText,
                "로그인 토큰을 찾을 수 없습니다."
            );
            return;
        }

        const userId =
            result.body?.data?.user_id ?? null;

        saveAuth(token, userId);

        console.log("로그인 성공");

        window.location.href = "./posts.html";

    } catch(error) {
        console.error(
            "로그인 요청 중 오류:",
            error
        );

        showHelperText(
            loginFailHelperText,
            "서버와 연결할 수 없습니다."
        );
    } finally {
        validateLoginForm();
    }
});


// 8. 회원가입 페이지 이동
signupButton.addEventListener("click", function() {
    window.location.href = "./signup.html";
});


// 9. 초기 버튼 상태
loginButton.disabled = true;