import { usersApi } from "@/api/protected/users/usersApi";
import Header from "@/components/protected/header/header";
import Sidebar from "@/components/protected/sidebar/sidebar";
import { UserModel } from "@/components/protected/user/model";
import UserProvider from "@/components/protected/user/userContext/UserContext";
import { decodeJWT } from "@/utils/auth/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClientRefreshLoader from "./ClientRefreshLoader";

// Access_token when expired will disapear from browser, wont be sent and will redirect to sign-in
// If access_token is not there there must be refresh token check as well 
export default async function Layout({children}: {children: React.ReactNode}) {
    return (
        <div className="flex flex-col w-full h-full min-h-0 gap-3">
            <ClientRefreshLoader>
                {children}
            </ClientRefreshLoader>
        </div>

    );
}