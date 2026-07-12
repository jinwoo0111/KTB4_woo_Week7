const EMAIL_REGEX =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_REGEX =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

export function isValidEmail(email) {
    return EMAIL_REGEX.test(email);
}

export function isValidPassword(password) {
    return PASSWORD_REGEX.test(password);
}

export function hasWhitespace(value) {
    return /\s/.test(value);
}

export function parsePositiveIntegerParam(
    searchParams,
    parameterName
) {
    const parameter = searchParams.get(parameterName);

    if(parameter === null || parameter.trim() === "") {
        return null;
    }

    const normalizedParameter = parameter.trim();

    if(!/^[1-9]\d*$/.test(normalizedParameter)) {
        return null;
    }

    const parsedParameter = Number(normalizedParameter);

    if(!Number.isSafeInteger(parsedParameter)) {
        return null;
    }

    return parsedParameter;
}