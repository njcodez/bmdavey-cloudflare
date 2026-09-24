# Changelog

## 1. Hide Admin Login Button for General Users
**File**: `src/components/store/Header.tsx`
- Modified the conditional rendering for the Admin and Logout buttons on both desktop and mobile navigation menus so that they are only visible if `isLoggedIn` is true. The "Admin Login" button for non-logged-in users was removed.

**Code Change (Desktop & Mobile Nav)**:
```tsx
// Before:
<Link
  href={isLoggedIn ? "/admin/products" : "/admin/login"}
  className="..."
>
  {isLoggedIn ? "Admin" : "Admin Login"}
</Link>

// After:
{isLoggedIn && (
  <Link
    href="/admin/products"
    className="..."
  >
    Admin
  </Link>
)}
```

## 2. Create Global Footer Component
**File**: `src/components/store/Footer.tsx` (New File)
- Created a global footer component with dynamic year for the copyright notice and links to the About and Contact pages.

**Code**:
```tsx
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
```

## 3. Standardize Headers and Inject Footer on Pages
**Files Modified**:
- `src/app/page.tsx`
- `src/app/about/page.tsx`
- `src/app/contact/page.tsx`

**Code Change**:
- Removed hardcoded `<header>` elements in the `about` and `contact` pages.
- Imported and implemented `<Header />` and `<Footer />` across all storefront pages.
- Adjusted container paddings (`pt-32 pb-16 flex-grow`) and layout wrappers (`flex flex-col min-h-dvh`) to accommodate the fixed header and sticky footer.

**Example Implementation (`src/app/about/page.tsx` and `src/app/contact/page.tsx`)**:
```tsx
import { Header } from "~/components/store/Header";
import { Footer } from "~/components/store/Footer";

export default function Page() {
  return (
    <main className="min-h-dvh bg-background flex flex-col relative">
      <Header />

      <div className="container mx-auto px-4 md:px-6 pt-32 pb-16 max-w-3xl flex-grow">
        {/* Page Content */}
      </div>
      
      <Footer />
    </main>
  );
}
```
