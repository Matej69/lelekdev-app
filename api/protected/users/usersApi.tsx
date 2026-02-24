import { UserModel, UserSchema } from "@/components/protected/user/model";

export const usersApi = {
    get: async (userId: string, cookies: string): Promise<UserModel | null> => {
        try {
            const res = await fetch(`http://localhost:8080/users/${userId}`, {
                credentials: 'include',
                headers: cookies ? { 'cookie': cookies } : undefined
            });
            if(!res.ok) return null;
            const json = await res.json()
            return UserSchema.parse(json);
        }
        catch(err: any) {
            return null;
        }
    }
}