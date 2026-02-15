import Layout from "@/app/(protected)/layout";
import SignIn from "@/components/public/sign-in/sign-in";

export default function Page() {
    return (
        <div className="flex flex-col w-full h-full items-center overflow-auto">
            <div className="mt-50">
                <SignIn></SignIn>
            </div>
        </div>
    );
}