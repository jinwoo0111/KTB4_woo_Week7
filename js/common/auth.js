export function getAccessToken() {
    return localStorage.getItem("accessToken");
}

export function getUserId() {
    return localStorage.getItem("userId");
}

export function saveAuth(accessToken, userId = null) {
    localStorage.setItem("accessToken", accessToken);

    if(userId !== null && userId !== undefined) {
        localStorage.setItem(
            "userId",
            String(userId)
        );
    }
}

export function clearAuth() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
}

export function redirectToLogin() {
    window.location.href = "./login.html";
}

export function requireLogin() {
    const accessToken = getAccessToken();

    if(accessToken === null) {
        redirectToLogin();
        return false;
    }

    return true;
}

export function requireUserId() {
    const userId = getUserId();

    if(userId === null) {
        redirectToLogin();
        return null;
    }

    return userId;
}