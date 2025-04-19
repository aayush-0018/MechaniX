import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    "/plumber/:path*", 
    "/electrician/:path*",
    "/mason/:path*",
    "/book",
    "/map",
    "/booking-success",
    "/work-status"
  ],
};