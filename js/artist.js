const memberCards =
    document.querySelectorAll(".member-card");

const focusOverlay =
    document.querySelector(".artist-focus-overlay");

const focusPanel =
    document.querySelector(".artist-focus-panel");

const focusImage =
    document.querySelector(".artist-focus-image");

const focusRole =
    document.querySelector(".artist-focus-role");

const focusName =
    document.querySelector(".artist-focus-name");

const focusDetails =
    document.querySelector(".artist-focus-details");

let hideTimer = null;

function clearHideTimer() {
    if(hideTimer !== null) {
        window.clearTimeout(hideTimer);
        hideTimer = null;
    }
}

function showMemberProfile(memberCard) {
    clearHideTimer();

    const image =
        memberCard.querySelector(".member-image");

    const name =
        memberCard.querySelector(".member-name");

    const role =
        memberCard.querySelector(".member-role");

    const details =
        memberCard.querySelector(".member-detail");

    focusImage.src = image.src;
    focusImage.alt = image.alt;
    focusRole.textContent = role.textContent;
    focusName.textContent = name.textContent;
    focusDetails.innerHTML = details.outerHTML;

    focusOverlay.classList.add("is-visible");
    focusOverlay.setAttribute("aria-hidden", "false");
}

function hideMemberProfile() {
    clearHideTimer();
    focusOverlay.classList.remove("is-visible");
    focusOverlay.setAttribute("aria-hidden", "true");
}

function scheduleHide(event) {
    if(event.relatedTarget !== null &&
        focusPanel.contains(event.relatedTarget)) {
        return;
    }

    clearHideTimer();
    hideTimer = window.setTimeout(hideMemberProfile, 80);
}

memberCards.forEach(function(memberCard) {
    const image =
        memberCard.querySelector(".member-image");

    image.addEventListener("error", function() {
        image.src = "../assets/rescene-default-profile.jpg";
    }, { once: true });

    memberCard.addEventListener(
        "mouseenter",
        function() {
            showMemberProfile(memberCard);
        }
    );

    memberCard.addEventListener(
        "mouseleave",
        scheduleHide
    );
});

focusPanel.addEventListener("mouseenter", clearHideTimer);
focusPanel.addEventListener("mouseleave", hideMemberProfile);
