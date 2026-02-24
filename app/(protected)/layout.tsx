import { usersApi } from "@/api/protected/users/usersApi";
import Header from "@/components/protected/header/header";
import Sidebar from "@/components/protected/sidebar/sidebar";
import { UserModel } from "@/components/protected/user/model";
import UserProvider from "@/components/protected/user/userContext/UserContext";
import { decodeJWT } from "@/utils/auth/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout({children}: {children: React.ReactNode}) {

    const cookieHeaders = await cookies()
    const accessToken = cookieHeaders.get("access_token")?.value;
    if(!accessToken) 
        redirect('/sign-in') 
    
    const payload = decodeJWT(accessToken);
    if(!payload)
        redirect('/sign-in');

    /**
     * If there is more user data needed then that in a access token, uncomment api call and remove token data read 
     * const user = await usersApi.get(payload.sub, cookieHeaders.toString()) 
    */
    const user: UserModel = { 
        id: payload.sub,
        email: payload.email,
        role: payload.role
    }
    if(!user)
        redirect('/sign-in')

    return (
        <div className="flex flex-col w-full h-full min-h-0 gap-3">
            <Header email={user.email} role={user.role} />
            <div className="flex flex-row flex-1 min-h-0 gap-4">
                <Sidebar />
                <div className="flex flex-col w-full max-h-full p-2 overflow-y-auto">
                    <UserProvider user={user}>
                        {children}
                    </UserProvider>
                </div>
            </div>
        </div>

    );
}