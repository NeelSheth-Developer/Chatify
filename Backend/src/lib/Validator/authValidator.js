import { validateEmail, validatePassword, validateName, validateRequestBody } from './commonValidator.js';

export const validateSignup = (req, res, next) => {
    const bodyCheck = validateRequestBody(req.body);
    if (!bodyCheck.isValid) {
        return res.status(400).json({ message: bodyCheck.message });
    }

    const { email, password, name } = req.body;
    
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
        return res.status(400).json({ message: emailCheck.message });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
        return res.status(400).json({ message: passwordCheck.message });
    }

    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
        return res.status(400).json({ message: nameCheck.message });
    }

    next();
};

export const validateLogin = (req, res, next) => {
    const bodyCheck = validateRequestBody(req.body);
    if (!bodyCheck.isValid) {
        return res.status(400).json({ message: bodyCheck.message });
    }

    const { email, password } = req.body;
    
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
        return res.status(400).json({ message: emailCheck.message });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
        return res.status(400).json({ message: passwordCheck.message });
    }

    next();
};
