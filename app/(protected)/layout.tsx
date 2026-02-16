import Header from "@/components/protected/header/header";
import Sidebar from "@/components/protected/sidebar/sidebar";
import { decodeJWT } from "@/utils/auth/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout({children}: {children: React.ReactNode}) {

    const accessToken = (await cookies()).get("access_token")?.value;
    if(!accessToken) 
        redirect('/sign-in') 
    
    const payload = decodeJWT(accessToken);
    if(!payload)
        redirect('/sign-in');

    const { email, role } = payload;

    return (
        <div className="flex flex-col w-full h-full min-h-0 gap-3">
            <Header email={email} role={role} />
            <div className="flex flex-row flex-1 min-h-0 gap-4">
                <Sidebar />
                <div className="flex flex-col w-full max-h-full p-2 overflow-y-auto border">
                    {children}
                </div>
            </div>
        </div>

    );
}