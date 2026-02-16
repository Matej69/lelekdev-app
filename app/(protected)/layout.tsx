import Header from "@/components/protected/header/header";
import Sidebar from "@/components/protected/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout({children}: {children: React.ReactNode}) {

    const accessToken = (await cookies()).get("access_token")?.value;
    if(!accessToken) { 
        redirect('/sign-in') 
    }

    return (
        <div className="flex flex-col w-full h-full min-h-0 gap-3">
            <div>
                <Header />

            </div>
            <div className="flex flex-row flex-1 min-h-0 gap-4">
                <Sidebar />
                <div className="flex flex-col w-full max-h-full p-2 overflow-y-auto border shadow-[8px_8px_0_black]">
                    {children}
                </div>
            </div>
        </div>

    );
}