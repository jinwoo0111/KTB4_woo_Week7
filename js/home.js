import {
    getAccessToken
} from "./common/auth.js";

const guestActions =
    document.querySelector(".guest-actions");

const userActions =
    document.querySelector(".user-actions");

const isLoggedIn =
    getAccessToken() !== null;

if(guestActions !== null && userActions !== null) {
    guestActions.classList.toggle(
        "is-hidden",
        isLoggedIn
    );

    userActions.classList.toggle(
        "is-hidden",
        !isLoggedIn
    );
}
