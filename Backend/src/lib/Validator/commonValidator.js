export const validateEmail = (email) => {
    if (!email || email === undefined || email === null) {
        return { isValid: false, message: "Email is required" };
    }
    if (!email.trim()) {
        return { isValid: false, message: "Email cannot be empty" };
    }
    const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, message: "Invalid email format" };
    }
    return { isValid: true };
};

export const validatePassword = (password) => {
    if (!password || password === undefined || password === null) {
        return { isValid: false, message: "Password is required" };
    }
    if (!password.trim()) {
        return { isValid: false, message: "Password cannot be empty" };
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*_])[a-z0-9!@#$%^&*_]{6,12}$/;
    if (!passwordRegex.test(password)) {
        return { 
            isValid: false, 
            message: "Password must be 6-12 characters long and contain at least one number, one special character, and lowercase letters only" 
        };
    }
    return { isValid: true };
};

export const validateName = (name) => {
    if (!name || name === undefined || name === null) {
        return { isValid: false, message: "Name is required" };
    }
    if (!name.trim()) {
        return { isValid: false, message: "Name cannot be empty" };
    }
    if (name.trim().length < 3) {
        return { isValid: false, message: "Name must be at least 3 characters long" };
    }
    return { isValid: true };
};

export const validateRequestBody = (body) => {
    if (!body || Object.keys(body).length === 0) {
        return { isValid: false, message: "Request body cannot be empty" };
    }
    return { isValid: true };
};

export const validateSignup = (req, res, next) => {
    const { email, password, name } = req.body;

    const requestBodyValidation = validateRequestBody(req.body);
    if (!requestBodyValidation.isValid) {
        return res.status(400).json({ message: requestBodyValidation.message });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        return res.status(400).json({ message: emailValidation.message });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return res.status(400).json({ message: passwordValidation.message });
    }

    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
        return res.status(400).json({ message: nameValidation.message });
    }

    next();
};
