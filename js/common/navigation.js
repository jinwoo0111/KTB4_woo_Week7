import {
    getAccessToken,
    getUserId
} from "./auth.js";

import {
    apiRequest
} from "./api.js";

const API_BASE_URL =
    "http://localhost:8080";

const DEFAULT_PROFILE_IMAGE_URL =
    "../assets/rescene-default-profile.jpg";

const profileButton =
    document.querySelector(".header-profile-button");

const profileDropdown =
    document.querySelector(".profile-dropdown");

function setProfileButtonImage(profileImagePath = null) {
    let imageUrl =
        DEFAULT_PROFILE_IMAGE_URL;

    if(profileImagePath !== null && profileImagePath !== "") {
        imageUrl = profileImagePath.startsWith("/")
            ? `${API_BASE_URL}${profileImagePath}`
            : `../assets/${profileImagePath}`;
    }

    profileButton.style.backgroundImage =
        `url("${imageUrl}")`;

    profileButton.style.backgroundSize =
        "cover";

    profileButton.style.backgroundPosition =
        "center";
}

async function loadProfileButtonImage() {
    if(profileButton === null) {
        return;
    }

    setProfileButtonImage();

    if(getAccessToken() === null) {
        return;
    }

    const userId = getUserId();

    if(userId === null) {
        return;
    }

    try {
        const result = await apiRequest(
            `/users/${userId}`
        );

        if(!result.ok) {
            return;
        }

        const user = result.body?.data;
        const profileImagePath =
            user?.profile_image ??
            user?.profileImage ??
            null;

        setProfileButtonImage(profileImagePath);
    } catch(error) {
        setProfileButtonImage();
    }
}

const navLinks =
    document.querySelectorAll(".global-nav-link");

const pageName =
    document.body.dataset.page ?? "";

navLinks.forEach(function(navLink) {
    const isActive =
        navLink.dataset.navPage === pageName;

    navLink.classList.toggle("is-active", isActive);

    if(isActive) {
        navLink.setAttribute("aria-current", "page");
    } else {
        navLink.removeAttribute("aria-current");
    }
});

loadProfileButtonImage();

if(profileButton !== null && profileDropdown === null) {
    profileButton.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if(getAccessToken() === null) {
            window.location.href = "./login.html";
            return;
        }

        window.location.href = "./user-edit.html";
    });
}
