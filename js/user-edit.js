import {
    showHelperText,
    hideHelperText,
    showToastMessage
} from "./common/ui.js";

import {
    hasWhitespace
} from "./common/validation.js";

import {
    apiRequest
} from "./common/api.js";

import {
    requireUserId,
    clearAuth
} from "./common/auth.js";


const nicknameInput = document.querySelector("#nickname");
const profileImageInput = document.querySelector("#profile-image");
const emailText = document.querySelector(".user-email");
const emailCopyText =
    document.querySelector(".user-email-copy");

const profileDisplayName =
    document.querySelector(".profile-display-name");

const passwordEditButton =
    document.querySelector(".password-edit-menu");

const logoutButton =
    document.querySelector(".logout-menu");

const profileImageButton =
    document.querySelector(".profile-image-button");

const userUpdateButton =
    document.querySelector(".user-update-button");

const userDeleteButton =
    document.querySelector(".user-delete-button");

const nicknameHelperText =
    document.querySelector(".nickname-helper-text");

const toastMessage =
    document.querySelector(".toast-message");

const userDeleteModal =
    document.querySelector(".user-delete-modal");

const userDeleteCancelButton =
    document.querySelector(".user-delete-cancel-button");

const userDeleteConfirmButton =
    document.querySelector(".user-delete-confirm-button");


const NICKNAME_EMPTY_MESSAGE =
    "닉네임을 입력해주세요.";

const NICKNAME_HAS_SPACING_MESSAGE =
    "띄어쓰기를 없애주세요.";

const NICKNAME_DUP_MESSAGE =
    "중복된 닉네임 입니다.";

const NICKNAME_INVALID_MESSAGE =
    "닉네임은 최대 10자 까지 작성 가능합니다.";


const userId = requireUserId();

let selectedProfileImageFile = null;


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


function updateUserUpdateButtonStyle() {
    const isValid = validateNickname();

    userUpdateButton.disabled = !isValid;
    userUpdateButton.classList.toggle(
        "active",
        isValid
    );

    return isValid;
}


function renderUserInfo(user) {
    const email = user.email ?? "";
    const nickname = user.nickname ?? "";

    emailText.textContent = email;
    emailCopyText.textContent = email;
    profileDisplayName.textContent = nickname || "회원님";
    nicknameInput.value = nickname;

    const profileImage =
        user.profile_image ??
        user.profileImage ??
        null;

    if(profileImage) {
        profileImageButton.style.backgroundImage =
            `url("../assets/${profileImage}")`;

        profileImageButton.style.backgroundSize =
            "cover";

        profileImageButton.style.backgroundPosition =
            "center";
    }

    updateUserUpdateButtonStyle();
}


async function fetchUserInfo() {
    if(userId === null) {
        return;
    }

    try {
        const result = await apiRequest(
            `/users/${userId}`
        );

        if(!result.ok) {
            console.error(
                "회원정보 조회 실패:",
                result.status
            );

            clearAuth();
            window.location.href = "./login.html";
            return;
        }

        const user = result.body?.data;

        if(!user) {
            console.error(
                "회원정보 응답 형식 오류:",
                result.body
            );
            return;
        }

        renderUserInfo(user);

    } catch(error) {
        console.error(
            "회원정보 조회 중 오류:",
            error
        );
    }
}


function openUserDeleteModal() {
    userDeleteModal.classList.add("is-open");
}


function closeUserDeleteModal() {
    userDeleteModal.classList.remove("is-open");
}


nicknameInput.addEventListener("input", function() {
    updateUserUpdateButtonStyle();
});


userUpdateButton.addEventListener(
    "click",
    async function() {
        if(!validateNickname() || userId === null) {
            return;
        }

        const requestBody = {
            nickname: nicknameInput.value.trim()
        };

        if(selectedProfileImageFile !== null) {
            requestBody.profile_image =
                selectedProfileImageFile.name;
        }

        userUpdateButton.disabled = true;

        try {
            const result = await apiRequest(
                `/users/${userId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(requestBody)
                }
            );

            if(!result.ok) {
                if(result.status === 409) {
                    showHelperText(
                        nicknameHelperText,
                        NICKNAME_DUP_MESSAGE
                    );
                    return;
                }

                showHelperText(
                    nicknameHelperText,
                    "회원정보 수정에 실패했습니다."
                );
                return;
            }

            selectedProfileImageFile = null;

            showToastMessage(toastMessage);
            await fetchUserInfo();

        } catch(error) {
            console.error(
                "회원정보 수정 중 오류:",
                error
            );

            showHelperText(
                nicknameHelperText,
                "서버와 연결할 수 없습니다."
            );
        } finally {
            updateUserUpdateButtonStyle();
        }
    }
);


userDeleteButton.addEventListener(
    "click",
    openUserDeleteModal
);


userDeleteCancelButton.addEventListener(
    "click",
    closeUserDeleteModal
);


userDeleteConfirmButton.addEventListener(
    "click",
    async function() {
        if(userId === null) {
            return;
        }

        userDeleteConfirmButton.disabled = true;

        try {
            const result = await apiRequest(
                `/users/${userId}`,
                {
                    method: "DELETE"
                }
            );

            if(!result.ok) {
                console.error(
                    "회원 탈퇴 실패:",
                    result.status
                );

                closeUserDeleteModal();
                return;
            }

            clearAuth();
            closeUserDeleteModal();

            window.location.href = "./login.html";

        } catch(error) {
            console.error(
                "회원 탈퇴 중 오류:",
                error
            );

            closeUserDeleteModal();

        } finally {
            userDeleteConfirmButton.disabled =
                false;
        }
    }
);


userDeleteModal.addEventListener(
    "click",
    function(event) {
        if(event.target === userDeleteModal) {
            closeUserDeleteModal();
        }
    }
);


passwordEditButton.addEventListener(
    "click",
    function() {
        window.location.href =
            "./password-edit.html";
    }
);


logoutButton.addEventListener(
    "click",
    function() {
        clearAuth();
        window.location.href = "./login.html";
    }
);


profileImageButton.addEventListener(
    "click",
    function() {
        profileImageInput?.click();
    }
);


profileImageInput?.addEventListener(
    "change",
    function() {
        const file = profileImageInput.files[0];

        if(file === undefined) {
            selectedProfileImageFile = null;
            return;
        }

        selectedProfileImageFile = file;

        profileImageButton.style.backgroundImage =
            `url("${URL.createObjectURL(file)}")`;

        profileImageButton.style.backgroundSize =
            "cover";

        profileImageButton.style.backgroundPosition =
            "center";
    }
);


fetchUserInfo();
