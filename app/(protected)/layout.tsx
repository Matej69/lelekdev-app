import Header from "@/components/protected/header";
import Sidebar from "@/components/protected/sidebar";

export default function Layout({children}: {children: React.ReactNode}) {

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