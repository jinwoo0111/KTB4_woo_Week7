import {
    getAccessToken,
    clearAuth,
    redirectToLogin
} from "./auth.js";

const API_BASE_URL =
    "http://localhost:8080";

export async function apiRequest(
    path,
    options = {}
) {
    const {
        skipAuth = false,
        ...fetchOptions
    } = options;

    const headers = new Headers(
        fetchOptions.headers || {}
    );

    const accessToken = getAccessToken();

    if(
        !skipAuth &&
        accessToken !== null &&
        !headers.has("Authorization")
    ) {
        headers.set(
            "Authorization",
            accessToken
        );
    }

    const hasBody =
        fetchOptions.body !== undefined &&
        fetchOptions.body !== null;

    const isFormData =
        fetchOptions.body instanceof FormData;

    if(
        hasBody &&
        !isFormData &&
        !headers.has("Content-Type")
    ) {
        headers.set(
            "Content-Type",
            "application/json"
        );
    }

    const response = await fetch(
        `${API_BASE_URL}${path}`,
        {
            ...fetchOptions,
            headers
        }
    );

    const hasAuthorization = headers.has("Authorization");

    if(response.status === 401 && !skipAuth && hasAuthorization) {
        clearAuth();
        redirectToLogin();

        return {
            response,
            body: null,
            ok: false,
            status: response.status,
            authExpired: true
        };
    }

    const contentType =
        response.headers.get("content-type") || "";

    let body = null;

    if(contentType.includes("application/json")) {
        body = await response.json();
    }

    return {
        response,
        body,
        ok: response.ok,
        status: response.status
    };
}
