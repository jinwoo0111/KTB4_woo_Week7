import {
    showHelperText,
    hideHelperText,
    showToastMessage
} from "./common/ui.js";

import {
    isValidPassword
} from "./common/validation.js";

import {
    apiRequest
} from "./common/api.js";

import {
    requireUserId
} from "./common/auth.js";


const passwordInput =
    document.querySelector("#password");

const passwordConfirmInput =
    document.querySelector("#password-confirm");

const passwordHelperText =
    document.querySelector(".password-helper-text");

const passwordConfirmHelperText =
    document.querySelector(
        ".password-confirm-helper-text"
    );

const passwordUpdateButton =
    document.querySelector(
        ".password-update-button"
    );

const headerProfileButton =
    document.querySelector(
        ".header-profile-button"
    );

const backButton =
    document.querySelector(".back-button");

const toastMessage =
    document.querySelector(".toast-message");


const PASSWORD_EMPTY_MESSAGE =
    "비밀번호를 입력해주세요";

const PASSWORD_INVALID_MESSAGE =
    "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";

const PASSWORD_CONFIRM_EMPTY_MESSAGE =
    "비밀번호를 한번 더 입력해주세요.";

const PASSWORD_NOT_EQUAL_MESSAGE =
    "비밀번호와 다릅니다";


const userId = requireUserId();


function resetPasswordForm() {
    passwordInput.value = "";
    passwordConfirmInput.value = "";

    hideHelperText(passwordHelperText);
    hideHelperText(passwordConfirmHelperText);

    passwordUpdateButton.disabled = true;
    passwordUpdateButton.classList.remove("active");
}


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


function validatePasswordConfirm() {
    const password = passwordInput.value.trim();

    const passwordConfirm =
        passwordConfirmInput.value.trim();

    if(passwordConfirm === "") {
        showHelperText(
            passwordConfirmHelperText,
            PASSWORD_CONFIRM_EMPTY_MESSAGE
        );
        return false;
    }

    if(passwordConfirm !== password) {
        showHelperText(
            passwordConfirmHelperText,
            PASSWORD_NOT_EQUAL_MESSAGE
        );
        return false;
    }

    hideHelperText(passwordConfirmHelperText);
    return true;
}


function validatePasswordForm() {
    const isPasswordValid =
        validatePassword();

    const isPasswordConfirmValid =
        validatePasswordConfirm();

    const isFormValid =
        isPasswordValid &&
        isPasswordConfirmValid;

    passwordUpdateButton.disabled =
        !isFormValid;

    passwordUpdateButton.classList.toggle(
        "active",
        isFormValid
    );

    return isFormValid;
}


passwordInput.addEventListener(
    "input",
    validatePasswordForm
);


passwordConfirmInput.addEventListener(
    "input",
    validatePasswordForm
);


passwordUpdateButton.addEventListener(
    "click",
    async function() {
        if(
            !validatePasswordForm() ||
            userId === null
        ) {
            return;
        }

        const password =
            passwordInput.value.trim();

        passwordUpdateButton.disabled = true;

        try {
            const result = await apiRequest(
                `/users/${userId}/password`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        new_password: password
                    })
                }
            );

            if(!result.ok) {
                showHelperText(
                    passwordHelperText,
                    "비밀번호 수정에 실패했습니다."
                );
                return;
            }

            showToastMessage(toastMessage);
            resetPasswordForm();

        } catch(error) {
            console.error(
                "비밀번호 수정 중 오류:",
                error
            );

            showHelperText(
                passwordHelperText,
                "서버와 연결할 수 없습니다."
            );
        } finally {
            if(passwordInput.value !== "") {
                validatePasswordForm();
            }
        }
    }
);


backButton.addEventListener(
    "click",
    function() {
        window.location.href = "./user-edit.html";
    }
);


headerProfileButton.addEventListener(
    "click",
    function() {
        window.location.href = "./user-edit.html";
    }
);


passwordUpdateButton.disabled = true;