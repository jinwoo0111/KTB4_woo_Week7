const API_BASE_URL = "http://localhost:8080";

const nicknameInput = document.querySelector("#nickname");
const profileImageInput = document.querySelector("#profile-image");
const emailText = document.querySelector(".user-email");

const headerProfileButton = document.querySelector(".header-profile-button");
const profileDropdown = document.querySelector(".profile-dropdown");

const userEditButton = document.querySelector(".user-edit-menu");
const passwordEditButton = document.querySelector(".password-edit-menu");
const logoutButton = document.querySelector(".logout-menu");

const profileImageButton = document.querySelector(".profile-image-button");
const userUpdateButton = document.querySelector(".user-update-button");
const userDeleteButton = document.querySelector(".user-delete-button");

const nicknameHelperText = document.querySelector(".nickname-helper-text");

const toastMessage = document.querySelector(".toast-message");

const userDeleteModal = document.querySelector(".user-delete-modal");
const userDeleteCancelButton = document.querySelector(".user-delete-cancel-button");
const userDeleteConfirmButton = document.querySelector(".user-delete-confirm-button");

const NICKNAME_EMPTY_MESSAGE = "닉네임을 입력해주세요.";
const NICKNAME_HAS_SPACING_MESSAGE = "띄어쓰기를 없애주세요.";
const NICKNAME_DUP_MESSAGE = "중복된 닉네임 입니다.";
const NICKNAME_INVALID_MESSAGE = "닉네임은 최대 10자 까지 작성 가능합니다.";

let selectedProfileImageFile = null;

function showHelperText(helperTextElement, message) {
    helperTextElement.textContent = message;
    helperTextElement.style.visibility = "visible";
}

function hideHelperText(helperTextElement) {
    helperTextElement.style.visibility = "hidden";
}

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

function updateUserUpdateButtonStyle() {
    const isNicknameValid = validateNickname();
    userUpdateButton.classList.toggle("active", isNicknameValid);
    return isNicknameValid;
}

// 기존 회원정보를 화면에 보여주기
function renderUserInfo(user) {
    if(emailText !== null) {
        emailText.textContent = user.email;
    }

    nicknameInput.value = user.nickname;

    if(user.profile_image !== null && user.profile_image !== "") {
        profileImageButton.style.backgroundImage = `url("../assets/${user.profile_image}")`;
        profileImageButton.style.backgroundSize = "cover";
        profileImageButton.style.backgroundPosition = "center";
    }

    updateUserUpdateButtonStyle();
}

// 기존 회원정보 조회
async function fetchUserInfo() {
    const userId = localStorage.getItem("userId");

    if(userId === null) {
        window.location.href = "./login.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);

        if(!response.ok) {
            console.log("회원정보 조회 실패 상태코드:", response.status);
            window.location.href = "./login.html";
            return;
        }

        const responseBody = await response.json();

        console.log("회원정보 조회 응답:", responseBody);

        const user = responseBody.data;

        renderUserInfo(user);

    } catch(error) {
        console.error("회원정보 조회 중 오류:", error);
    }
}

// 토스트 메세지 보이기
function showToastMessage() {
    toastMessage.classList.add("is-visible");

    setTimeout(function() {
        toastMessage.classList.remove("is-visible");
    }, 2000);
}

// 회원 탈퇴 모달 열기
function openUserDeleteModal() {
    userDeleteModal.classList.add("is-open");
}

// 회원 탈퇴 모달 닫기
function closeUserDeleteModal() {
    userDeleteModal.classList.remove("is-open");
}

// 프로필 드롭다운 열기 / 닫기
function toggleProfileDropdown() {
    profileDropdown.classList.toggle("is-open");
}

// 프로필 드롭다운 닫기
function closeProfileDropdown() {
    profileDropdown.classList.remove("is-open");
}

nicknameInput.addEventListener("input", function() {
    updateUserUpdateButtonStyle();
});

userUpdateButton.addEventListener("click", async function() {
    const isNicknameValid = validateNickname();

    if(!isNicknameValid) {
        userUpdateButton.classList.remove("active");
        return;
    }

    const userId = localStorage.getItem("userId");

    if(userId === null) {
        window.location.href = "./login.html";
        return;
    }

    const nickname = nicknameInput.value.trim();

    const requestBody = {
        nickname: nickname
    };
    

    if(selectedProfileImageFile !== null) {
        requestBody.profile_image = selectedProfileImageFile.name;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if(!response.ok) {
            console.log("회원정보 수정 실패 상태코드:", response.status);

            if(response.status === 409) {
                showHelperText(nicknameHelperText, NICKNAME_DUP_MESSAGE);
                return;
            }

            showHelperText(nicknameHelperText, "회원정보 수정에 실패했습니다.");
            return;
        }

        const data = await response.json();

        console.log("회원정보 수정 응답:", data);
        console.log("회원정보 수정 성공");

        showToastMessage();

    } catch(error) {
        console.error("회원정보 수정 중 오류:", error);
        showHelperText(nicknameHelperText, "서버와 연결할 수 없습니다.");
    }
});

userDeleteButton.addEventListener("click", function() {
    openUserDeleteModal();
});

userDeleteCancelButton.addEventListener("click", function() {
    closeUserDeleteModal();
});

userDeleteConfirmButton.addEventListener("click", async function() {
    const userId = localStorage.getItem("userId");

    if(userId === null) {
        window.location.href = "./login.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: "DELETE"
        });

        if(!response.ok) {
            console.log("회원 탈퇴 실패 상태코드:", response.status);
            closeUserDeleteModal();
            return;
        }

        console.log("회원 탈퇴 성공");

        localStorage.removeItem("userId");

        closeUserDeleteModal();

        window.location.href = "./login.html";

    } catch(error) {
        console.error("회원 탈퇴 중 오류:", error);
        closeUserDeleteModal();
    }
});

userDeleteModal.addEventListener("click", function(event) {
    if(event.target === userDeleteModal) {
        closeUserDeleteModal();
    }
});

headerProfileButton.addEventListener("click", function(event) {
    event.stopPropagation();
    toggleProfileDropdown();
});

// 드롭다운 내부 클릭 시 이벤트 전파 막기
profileDropdown.addEventListener("click", function(event) {
    event.stopPropagation();
});


// 화면 다른 곳 클릭 시 드롭다운 닫기
document.addEventListener("click", function() {
    closeProfileDropdown();
});


// 드롭다운 - 회원정보수정 클릭
userEditButton.addEventListener("click", function() {
    window.location.href = "./user-edit.html";
});

// 드롭다운 - 비밀번호 수정
passwordEditButton.addEventListener("click", function() {
    window.location.href = "./password-edit.html";
});

// 드롭다운 - 로그아웃 클릭
logoutButton.addEventListener("click", function() {

    console.log("로그아웃");

    localStorage.removeItem("userId");

    window.location.href = "./login.html";
});

// 프로필 이미지 변경 버튼 클릭
profileImageButton.addEventListener("click", function() {
    if(profileImageInput === null) {
        console.log("profile-image input이 없습니다.");
        return;
    }

    profileImageInput.click();
});

if(profileImageInput !== null) {
    profileImageInput.addEventListener("change", function() {
        const file = profileImageInput.files[0];

        if(file === undefined) {
            selectedProfileImageFile = null;
            console.log("프로필 이미지 선택 취소");
            return;
        }

        selectedProfileImageFile = file;

        profileImageButton.style.backgroundImage = `url("${URL.createObjectURL(file)}")`;
        profileImageButton.style.backgroundSize = "cover";
        profileImageButton.style.backgroundPosition = "center";

        console.log("선택한 프로필 이미지:", selectedProfileImageFile.name);
    });
}


// 초기 버튼 상태 설정
fetchUserInfo();