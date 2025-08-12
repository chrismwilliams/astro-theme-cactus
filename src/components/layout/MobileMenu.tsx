import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type MenuLink = { path: string; title: string };

interface MobileMenuProps {
  links: MenuLink[];
  currentPath: string;
}

export default function MobileMenu({ links, currentPath }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sm:hidden relative">
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={isOpen ? "Close main menu" : "Open main menu"}
        className="group relative ms-4 h-7 w-7"
        type="button"
        onClick={() => setIsOpen((v) => !v)}
      >
        {/* Burger icon */}
        <svg
          aria-hidden="true"
          className={`absolute start-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 transition-all ${
            isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
          }`}
          fill="none"
          focusable="false"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3.75 9h16.5m-16.5 6.75h16.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* Cross icon */}
        <svg
          aria-hidden="true"
          className={`absolute start-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 transition-all ${
            isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
          fill="none"
          focusable="false"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            key="mobile-menu"
            aria-label="Main menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -inset-x-4 top-14 z-50 flex flex-col items-end gap-y-4 rounded-md bg-bgColor/[.85] py-4 text-accent shadow backdrop-blur"
          >
            {links.map((link) => (
              <a
                key={link.path}
                aria-current={currentPath === link.path ? "page" : undefined}
                className="px-4 py-2 underline-offset-2 hover:underline bg-gradient-to-b from-[#39ff14] via-[#00ff90] to-[#00ffea] bg-clip-text text-transparent"
                data-astro-prefetch
                href={link.path}
                onClick={() => setIsOpen(false)}
              >
                {link.title}
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}


