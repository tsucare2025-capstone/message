import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return token;
}

// Route validation utilities
const validateRouteParams = (params) => {
    const validated = {};
    for (const [key, value] of Object.entries(params)) {
        if (value && typeof value === 'string') {
            // Remove any potentially dangerous characters
            validated[key] = value.replace(/[^a-zA-Z0-9\-_]/g, '');
        } else {
            validated[key] = value;
        }
    }
    return validated;
};

export {
    generateToken,
    validateRouteParams
}