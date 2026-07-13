import {
    getAccessToken
} from "./auth.js";

const profileButton =
    document.querySelector(".header-profile-button");

const profileDropdown =
    document.querySelector(".profile-dropdown");

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
