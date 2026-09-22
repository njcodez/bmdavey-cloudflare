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
    </footer>
  );
}
