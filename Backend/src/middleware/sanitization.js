export const sanitizeRequest = (req, res, next) => {
    try {
        const sanitized = {};
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                sanitized[key] = req.body[key].trim();
            } else {
                sanitized[key] = req.body[key];
            }
        }
        req.body = sanitized;
        next();
    } catch (error) {
        return res.status(400).json({ message: "Invalid request data" });
    }
};
