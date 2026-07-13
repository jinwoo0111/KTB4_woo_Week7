export function getAccessToken() {
    return localStorage.getItem("accessToken");
}

export function getUserId() {
    const savedUserId =
        localStorage.getItem("userId");

    if(savedUserId !== null) {
        return savedUserId;
    }

    const accessToken =
        localStorage.getItem("accessToken");

    if(accessToken === null) {
        return null;
    }

    try {
        const payload =
            accessToken.split(".")[1];

        const normalizedPayload =
            payload
                .replaceAll("-", "+")
                .replaceAll("_", "/");

        const paddedPayload =
            normalizedPayload.padEnd(
                Math.ceil(normalizedPayload.length / 4) * 4,
                "="
            );

        const decodedPayload =
            atob(paddedPayload);

        const tokenData =
            JSON.parse(decodedPayload);

        const tokenUserId =
            tokenData.user_id ??
            tokenData.userId ??
            null;

        return tokenUserId === null
            ? null
            : String(tokenUserId);
    } catch(error) {
        return null;
    }
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
