const API_BASE_URL = "http://localhost:8080";

const passwordInput = document.querySelector("#password");
const passwordConfirmInput = document.querySelector("#password-confirm");

const passwordHelperText = document.querySelector(".password-helper-text");
const passwordConfirmHelperText = document.querySelector(".password-confirm-helper-text");

const passwordUpdateButton = document.querySelector(".password-update-button");
const headerProfileButton = document.querySelector(".header-profile-button");
const backButton = document.querySelector(".back-button");

const toastMessage = document.querySelector(".toast-message");


const PASSWORD_EMPTY_MESSAGE = "비밀번호를 입력해주세요";
const PASSWORD_INVALID_MESSAGE = "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";

const PASSWORDCONFIRM_EMPTY_MESSAGE = "비밀번호를 한번 더 입력해주세요.";
const PASSWORD_NOT_EQUAL_MESSAGE = "비밀번호와 다릅니다";

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;


function showHelperText(helperTextElement, message) {
    helperTextElement.textContent = message;
    helperTextElement.style.visibility = "visible";
}

function hideHelperText(helperTextElement) {
    helperTextElement.style.visibility = "hidden";
}

function showToastMessage() {
    toastMessage.classList.add("is-visible");

    setTimeout(function () {
        toastMessage.classList.remove("is-visible");
    }, 2000);
}

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

function validatePasswordConfirm() {
    const password = passwordInput.value.trim();
    const passwordConfirm = passwordConfirmInput.value.trim();

    if (passwordConfirm === "") {
        showHelperText(passwordConfirmHelperText, PASSWORDCONFIRM_EMPTY_MESSAGE);
        return false;
    }

    if (passwordConfirm !== password) {
        showHelperText(passwordConfirmHelperText, PASSWORD_NOT_EQUAL_MESSAGE);
        return false;
    }

    hideHelperText(passwordConfirmHelperText);
    return true;
}

function validateUpdatePasswordForm() {
    const isPasswordValid = validatePassword();
    const isPasswordConfirmValid = validatePasswordConfirm();

    const isFormValid = isPasswordValid && isPasswordConfirmValid;

    passwordUpdateButton.disabled = !isFormValid;
    passwordUpdateButton.classList.toggle("active", isFormValid);
    return isFormValid;
}

passwordInput.addEventListener("input", function () {
    validateUpdatePasswordForm();
});

passwordConfirmInput.addEventListener("input", function () {
    validateUpdatePasswordForm();
});

function resetPasswordForm() {
    passwordInput.value = "";
    passwordConfirmInput.value = "";

    hideHelperText(passwordHelperText);
    hideHelperText(passwordConfirmHelperText);

    passwordUpdateButton.disabled = true;
    passwordUpdateButton.classList.remove("active");
}

passwordUpdateButton.addEventListener("click", async function () {
    const isFormValid = validateUpdatePasswordForm();

    if (!isFormValid) {
        return;
    }

    const userId = localStorage.getItem("userId");

    if (userId === null) {
        window.location.href = "./login.html";
        return;
    }

    const password = passwordInput.value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                new_password: password
            })
        });

        if (!response.ok) {
            console.log("비밀번호 수정 실패 상태코드:", response.status);
            showHelperText(passwordHelperText, "비밀번호 수정에 실패했습니다.");
            return;
        }

        console.log("비밀번호 수정 성공");

        showToastMessage();

        resetPasswordForm();

    } catch (error) {
        console.error("비밀번호 수정 중 오류:", error);
        showHelperText(passwordHelperText, "서버와 연결할 수 없습니다.");
    }
});

backButton.addEventListener("click", function () {
    window.location.href = "./user-edit.html";
});

headerProfileButton.addEventListener("click", function () {
    window.location.href = "./user-edit.html";
});

passwordUpdateButton.disabled = true;