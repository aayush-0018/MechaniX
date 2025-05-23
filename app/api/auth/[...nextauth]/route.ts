import NextAuth from "next-auth";
import { authOptions } from "./options"; // adjust the path

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
