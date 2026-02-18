import { NextResponse } from "next/server";

/** Return a JSON success response. */
export function successResponse(data: unknown, status = 200) {
    return NextResponse.json(data, { status });
}

/** Return a JSON error response. */
export function errorResponse(message: string, status = 400) {
    return NextResponse.json({ error: message }, { status });
}

/** Strip the password field from a user object before sending it to the client. */
export function sanitizeUser<T extends Record<string, unknown>>(
    user: T & { password?: unknown },
): Omit<T, "password"> {
    const { password: _, ...rest } = user;
    return rest;
}

/** Strip passwords from an array of user objects. */
export function sanitizeUsers<T extends Record<string, unknown>>(
    users: (T & { password?: unknown })[],
): Omit<T, "password">[] {
    return users.map(sanitizeUser);
}
