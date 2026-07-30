const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = Object.freeze({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
});

export const accessTokenCookieOptions = Object.freeze({
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000
});

export const refreshTokenCookieOptions = Object.freeze({
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000
});

export const clearCookieOptions = baseCookieOptions;
