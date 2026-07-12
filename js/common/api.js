import {
    getAccessToken
} from "./auth.js";

const API_BASE_URL =
    "http://localhost:8080";

export async function apiRequest(
    path,
    options = {}
) {
    const headers = new Headers(
        options.headers || {}
    );

    const accessToken = getAccessToken();

    if(
        accessToken !== null &&
        !headers.has("Authorization")
    ) {
        headers.set(
            "Authorization",
            accessToken
        );
    }

    const hasBody =
        options.body !== undefined &&
        options.body !== null;

    const isFormData =
        options.body instanceof FormData;

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
            ...options,
            headers
        }
    );

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