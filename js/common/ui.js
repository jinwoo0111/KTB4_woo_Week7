export function showHelperText(helperTextElement, message) {
    if(helperTextElement === null) {
        return ;
    }
    helperTextElement.textElement = message;
    helperTextElement.style.visibility = "visible";
}

export function hideHelperText(helperTextElement) {
    if(helperTextElement === null) {
        return;
    }
    helperTextElement.style.visibility = "hidden";
}

export function showToastMessage(
    toastElement,
    duration = 2000
) {
    if(toastElement === null) {
        return;
    }

    toastElement.classList.add("is-visible");

    setTimeout(function() {
        toastElement.classList.remove("is-visible");
    }, duration);
}