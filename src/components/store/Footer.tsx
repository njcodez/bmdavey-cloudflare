import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-border/40 bg-black text-white py-8 md:py-12 mt-auto">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-sm text-white/60">
        <p>&copy; {year} B. M. Davey & Co. All rights reserved.</p>
        <div className="flex items-center gap-6 font-medium">
          <Link href="/about" className="hover:text-white transition-colors">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 mt-8 text-center text-xs sm:text-sm text-blue-400">
        Crafted by{" "}
        <a 
          href="https://neerajs.web.app" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="font-medium hover:text-blue-300 hover:underline transition-all inline-block py-1 md:py-0"
        >
          Neeraj
        </a>{" "}
        from{" "}
        <a 
          href="https://trelvion.web.app" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="font-medium hover:text-blue-300 hover:underline transition-all inline-block py-1 md:py-0"
        >
          Trelvion Solutions
        </a>
      </div>
    </footer>
  );
}
