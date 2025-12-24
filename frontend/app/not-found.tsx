import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#224034] flex flex-col items-center justify-center p-6 text-center">
            <h1 className="font-serif text-9xl text-[#8cd9b8] mb-4">404</h1>
            <h2 className="font-serif text-4xl text-white mb-6">Page not found</h2>
            <p className="text-white/60 text-lg max-w-md mb-8">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link href="/">
                <Button className="bg-[#8cd9b8] text-[#224034] hover:bg-[#7bcfa7] font-semibold h-12 px-8 text-lg">
                    Return Home
                </Button>
            </Link>
        </div>
    );
}
