// 공통 API 주소
const API_BASE_URL = "http://localhost:8080";

// 1. HTML 요소

const emailInput = document.querySelector("#email")
const passwordInput = document.querySelector("#password");

const emailHelperText = document.querySelector(".email-helper-text");
const passwordHelperText = document.querySelector(".password-helper-text");
const loginFailHelperText = document.querySelector(".login-fail-helper-text");

const loginButton = document.querySelector(".login-button");
const signupButton = document.querySelector(".signup-button");


// 2. 에러 문구
const EMAIL_EMPTY_MESSAGE = "이메일을 입력해주세요.";
const EMAIL_INVALID_MESSAGE = "올바른 이메일 주소 형식을 입력해주세요. (예: jw@naver.com)";

const PASSWORD_EMPTY_MESSAGE = "비밀번호를 입력해주세요.";
const PASSWORD_INVALID_MESSAGE = "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";

const LOGIN_FAIL_MESSAGE = "아이디 또는 비밀번호를 확인해주세요.";


// 3. 정규식

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;


// 4. helper text 제어 함수

function showHelperText(helperTextElement, message) {
    helperTextElement.textContent = message;
    helperTextElement.style.visibility = "visible";
}

function hideHelperText(helperTextElement) {
    helperTextElement.style.visibility = "hidden";
}

// 5. 이메일 검사 함수

function validateEmail() {
    const email = emailInput.value.trim();

    if (email === "") {
        showHelperText(emailHelperText, EMAIL_EMPTY_MESSAGE);
        return false;
    }

    if (!emailRegex.test(email)) {
        showHelperText(emailHelperText, EMAIL_INVALID_MESSAGE);
        return false;
    }

    hideHelperText(emailHelperText);
    return true;
}


// 6. 비밀번호 검사
function validatePassword() {
    const password = passwordInput.value.trim();

    if (password === "") {
        showHelperText(passwordHelperText, PASSWORD_EMPTY_MESSAGE);
        return false;
    }

    if (!passwordRegex.test(password)) {
        showHelperText(passwordHelperText, PASSWORD_INVALID_MESSAGE);
        return false;
    }
    hideHelperText(passwordHelperText);
    return true;
}


// 7. 전체 form 검사 + 버튼 상태 변경
function validateLoginForm() {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    const isFormValid = isEmailValid && isPasswordValid;

    loginButton.disabled = !isFormValid;
    loginButton.classList.toggle("active", isFormValid);
    return isFormValid;
}


// 8. input 이벤트 연결
emailInput.addEventListener("input", function () {
    hideHelperText(loginFailHelperText);
    validateLoginForm();
});

passwordInput.addEventListener("input", function () {
    hideHelperText(loginFailHelperText);
    validateLoginForm();
})

// 9. 로그인 버튼 클릭 이벤트

/*
loginButton.addEventListener("click", function() {
    hideHelperText(loginFailHelperText);

    const isFormValid = validateLoginForm();

    if(!isFormValid) {
        return ;
    }



    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    console.log("로그인 요청 가능");
    console.log("email:", email);
    console.log("password:", password);
});
*/

// login 버튼 클릭 이벤트(fetch 적용)
loginButton.addEventListener("click", async function () {
    hideHelperText(loginFailHelperText);
    const isFormValid = validateLoginForm();

    if (!isFormValid) {
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            showHelperText(loginFailHelperText, LOGIN_FAIL_MESSAGE);
            return;
        }

        const token = response.headers.get("Authorization");

        console.log("Authorization token:", token);

        if (!token) {
            showHelperText(loginFailHelperText, "로그인 토큰을 찾을 수 없습니다.");
            return;
        }

        localStorage.setItem("accessToken", token);

        console.log("localStorage accessToken:", localStorage.getItem("accessToken"));
        window.location.href = "./posts.html";
    } catch (error) {
        console.error("로그인 요청 중 오류: ", error);
        showHelperText(loginFailHelperText, "서버와 연결할 수 없습니다");
    }
});


// 10. 회원가입 버튼 클릭 이벤트
signupButton.addEventListener("click", function () {
    window.location.href = "./signup.html";
});


// 11. 초기 버튼 상태 설정
loginButton.disabled = true;