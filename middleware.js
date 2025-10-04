import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const isAdmin = token?.role === "ADMIN"
        const isUser = token?.role === "USER" || token?.role === "ADMIN"

        // Admin routes protection
        if (req.nextUrl.pathname.startsWith("/admin")) {
            if (!isAdmin) {
                return NextResponse.redirect(new URL("/auth/signin", req.url))
            }
        }

        // User dashboard protection  
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
            if (!isUser) {
                return NextResponse.redirect(new URL("/auth/signin", req.url))
            }
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl

                // Always allow these routes
                if (pathname === "/" ||
                    pathname === "/blog" ||
                    pathname.startsWith("/api/public") ||
                    pathname.startsWith("/api/auth") ||
                    pathname.startsWith("/auth/") ||
                    pathname.startsWith("/_next") ||
                    pathname.startsWith("/favicon")) {
                    return true
                }

                // Admin routes require ADMIN role
                if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
                    return token?.role === "ADMIN"
                }

                // User routes require authentication
                if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/user")) {
                    return !!token && (token.role === "USER" || token.role === "ADMIN")
                }

                // Default to allow if no specific rule matches
                return true
            },
        },
    }
)

export const config = {
    matcher: [
        "/admin/:path*",
        "/dashboard/:path*",
        "/api/user/:path*",
        "/api/admin/:path*"
    ]
}