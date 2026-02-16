import SignOutButton from "./sign-out-button";

export default function Header() {
    return (
        <div className="flex items-center justify-between w-full h-16">
            { /* Search Bar */ }
            <div className="relative max-w-sm h-full grow">
                <span className="absolute flex items-center h-full left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-full pl-10 pr-4 py-2 bg-white border focus:outline-none focus:shadow-[4px_4px_0px_black]"
                />
            </div>
            <div className="flex items-center h-full gap-4">
                { /* Sign out */ }
                <SignOutButton />
                { /* User info */ }
                <div className="flex flex-col items-start h-full justify-center bg-white border border-black px-2">
                    <p className="font-bold">DivovksiVrag@gmail.com</p>
                    <p className="text-gray-500">ADMIN</p>
                </div>
            </div>
        </div>
    );
} 