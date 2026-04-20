"use client";
import { useEffect, useState } from "react";
import { decodeJWT } from "@/utils/auth/jwt";
import Header from "@/components/protected/header/header";
import Sidebar from "@/components/protected/sidebar/sidebar";
import UserProvider from "@/components/protected/user/userContext/UserContext";
import { UserModel, UserSchema } from "@/components/protected/user/model";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/api/api";
import ContentLoadingSkeleton from "@/components/common/Skeleton/content-loading-skeleton";

const Loading = () => {
  return(
    <div className="flex flex-col gap-4">
      <ContentLoadingSkeleton/>
      <ContentLoadingSkeleton/>
      <ContentLoadingSkeleton/>
    </div>
  )
}

export default function ClientRefreshLoader({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserModel | null>(null);

  useEffect(() => {
    async function userData() {
        try {
            const res = await api.get("/users/caller");
            const user = UserSchema.parse(res.data)
            setUser({ id: user.id, email: user.email, role: user.role });
        } catch {}
    }
    userData();
  }, []);

  if (!user) return <Loading></Loading>;

  return<>
    <Header email={user.email} role={user.role} />
       <div className="flex flex-col sm:flex-row flex-1 min-h-0 gap-4">
           <Sidebar />
           <div className="flex flex-col w-full max-h-full overflow-y-auto">
               <div className="p-1">
                   <UserProvider user={user}>
                       {children}
                   </UserProvider>
               </div>
           </div>
       </div>
  </>; 
}