'use client';

import { createContext, useContext } from "react";
import { UserModel } from "../model";

const UserContext = createContext<UserModel | null>(null);

export default function UserProvider({ user, children }: { user: UserModel, children: React.ReactNode }) {
    return(
        <UserContext.Provider value={user}>
            {children}
        </UserContext.Provider>
    )
}

export const useUserContext = () => {
    const userContext = useContext(UserContext)
    if(!userContext) throw new Error("User context not defined")
    return userContext
}

