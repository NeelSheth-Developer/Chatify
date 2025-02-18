import jwt from 'jsonwebtoken';

export const generateToken = (userId,res) => {
    const token= jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 7*24*60*60*1000, // 7 days
        httpOnly: true, //prevent xss attack
        sameSite:"strict",// prevent CSRF attack
        secure: process.env.ENVIRONMENT === 'production' ? true : false,
    });
}