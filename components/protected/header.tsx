
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
            { /* User Info */ }
            <div className="flex items-center h-full gap-4">
                <div className="flex items-center justify-center h-full aspect-square bg-white border border-black">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                    </svg>
                </div>
                <div className="flex flex-col items-start h-full justify-center bg-white border border-black px-2">
                    <p className="font-bold">DivovksiVrag@gmail.com</p>
                    <p className="text-gray-500">ADMIN</p>
                </div>
            </div>
        </div>
    );
} 