export function PlateUtensilsIllustration({ className = '', size = 84 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`editorial-illustration ${className}`}
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="36" fill="#FFFFFF" stroke="#2D1654" strokeWidth="2.2" />
      <circle
        cx="60"
        cy="60"
        r="25"
        stroke="#F59E0B"
        strokeWidth="1.6"
        strokeDasharray="4 3"
      />
      <path
        d="M52 54c4-4 12-4 16 0M48 64c6 5 18 5 24 0"
        stroke="#513B73"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Left Fork */}
      <path
        d="M14 30v18c0 3.5 2.5 6 6 6v36M14 40h12M20 30v24M26 30v18c0 3.5-2.5 6-6 6"
        stroke="#2D1654"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Knife */}
      <path
        d="M104 30c-4.5 0-7 6-7 16v12h7v32M104 30v28"
        stroke="#2D1654"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CoffeeCupIllustration({ className = '', size = 72 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`editorial-illustration ${className}`}
      aria-hidden="true"
    >
      {/* Warm Amber Steam lines */}
      <path
        d="M38 18c-2 4 3 7 1 12M50 15c-2 5 3 8 1 14M62 19c-2 4 3 7 1 11"
        stroke="#F59E0B"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Cup body */}
      <path
        d="M24 38h48v20c0 13.255-10.745 24-24 24S24 71.255 24 58V38Z"
        fill="#FFFFFF"
        stroke="#2D1654"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Rim detail */}
      <path d="M24 45h48" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* Handle */}
      <path
        d="M72 44h6c5.5 0 9 3.8 9 9s-3.5 9-9 9h-7"
        stroke="#2D1654"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Saucer */}
      <path
        d="M16 82h64M22 86h52"
        stroke="#2D1654"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FoodBowlIllustration({ className = '', size = 76 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 110 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`editorial-illustration ${className}`}
      aria-hidden="true"
    >
      {/* Chopsticks */}
      <path
        d="M28 24l62-8M34 32l58-10"
        stroke="#F59E0B"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Noodles / Garnish */}
      <path
        d="M28 48c7-6 16-6 23 0 7-6 17-6 24 0 5-4 11-4 15 0"
        stroke="#513B73"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Bowl body */}
      <path
        d="M18 48h74c0 21-15 36-37 36S18 69 18 48Z"
        fill="#FFFFFF"
        stroke="#2D1654"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M22 56h66" stroke="#F59E0B" strokeWidth="1.5" />
      {/* Foot ring */}
      <path
        d="M42 84h26v6H42v-6Z"
        fill="#EFEBF7"
        stroke="#2D1654"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StorefrontIllustration({ className = '', size = 84 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`editorial-illustration ${className}`}
      aria-hidden="true"
    >
      {/* Roofline & Signboard */}
      <rect x="20" y="20" width="80" height="14" fill="#FFFFFF" stroke="#2D1654" strokeWidth="2" />
      <path d="M28 27h64" stroke="#F59E0B" strokeWidth="1.8" strokeDasharray="4 3" />
      {/* Striped Awning */}
      <path
        d="M20 34l-6 16h92l-6-16H20Z"
        fill="#EFEBF7"
        stroke="#2D1654"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M36 34l-3 16M52 34l-1 16M68 34l1 16M84 34l3 16"
        stroke="#2D1654"
        strokeWidth="1.5"
      />
      <path
        d="M14 50c0 4 4 7 8.5 7S31 54 31 50c0 4 4 7 8.5 7S48 54 48 50c0 4 4 7 8.5 7S65 54 65 50c0 4 3.8 7 8.2 7S81.5 54 81.5 50c0 4 3.8 7 8.2 7s8.3-3 8.3-7"
        stroke="#2D1654"
        strokeWidth="1.7"
      />
      {/* Facade walls */}
      <path d="M22 57v41h76V57" fill="#FFFFFF" stroke="#2D1654" strokeWidth="2" />
      {/* Door */}
      <rect x="30" y="65" width="20" height="33" fill="#EFEBF7" stroke="#2D1654" strokeWidth="1.8" />
      <circle cx="46" cy="82" r="2" fill="#F59E0B" />
      {/* Window */}
      <rect x="58" y="65" width="32" height="22" fill="#EFEBF7" stroke="#2D1654" strokeWidth="1.8" />
      <path d="M64 81l10-10M72 82l6-6" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" />
      {/* Sidewalk line */}
      <path d="M12 98h96" stroke="#2D1654" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function LocationPinIllustration({ className = '', size = 72 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`editorial-illustration ${className}`}
      aria-hidden="true"
    >
      <ellipse
        cx="50"
        cy="82"
        rx="26"
        ry="7"
        stroke="#513B73"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <ellipse cx="50" cy="82" rx="12" ry="3.5" stroke="#F59E0B" strokeWidth="1.8" />
      <path
        d="M50 78C50 78 74 54.5 74 37C74 23.745 63.255 13 50 13C36.745 13 26 23.745 26 37C26 54.5 50 78 50 78Z"
        fill="#2D1654"
        stroke="#2D1654"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="37" r="10" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
      <circle cx="50" cy="37" r="4" fill="#F59E0B" />
    </svg>
  );
}

export function IngredientsIllustration({ className = '', size = 76 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 110 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`editorial-illustration ${className}`}
      aria-hidden="true"
    >
      <path
        d="M38 42c-10 4-16 14-14 25 2 9 11 15 22 15s20-6 22-15c2-11-4-21-14-25l-4-14h-8l-4 14Z"
        fill="#FFFFFF"
        stroke="#2D1654"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="M46 42c-4 10-4 28 0 40M46 42c4 10 4 28 0 40"
        stroke="#513B73"
        strokeWidth="1.3"
      />
      <circle cx="76" cy="68" r="16" fill="#FEF3C7" stroke="#2D1654" strokeWidth="1.9" />
      <circle cx="76" cy="68" r="12" stroke="#F59E0B" strokeWidth="1.4" />
      <path
        d="M76 56v24M64 68h24M67.5 59.5l17 17M84.5 59.5l-17 17"
        stroke="#F59E0B"
        strokeWidth="1.2"
      />
      <path
        d="M68 20c-4 12-10 22-16 30M64 26c6-2 11 1 11 6-6 2-11-1-11-6ZM59 35c7-1 11 2 11 7-6 1-11-2-11-7Z"
        stroke="#2D1654"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FoldedMapIllustration({ className = '', size = 84 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`editorial-illustration ${className}`}
      aria-hidden="true"
    >
      <path
        d="M16 28l28-10 32 10 28-10v66l-28 10-32-10-28 10V28Z"
        fill="#FFFFFF"
        stroke="#2D1654"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M44 18v66M76 28v66" stroke="#513B73" strokeWidth="1.5" />
      <path
        d="M26 68c10-12 18-8 28-20s18-12 36-16"
        stroke="#2D1654"
        strokeWidth="2.4"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <circle cx="26" cy="68" r="4.5" fill="#FFFFFF" stroke="#2D1654" strokeWidth="2" />
      <circle cx="90" cy="32" r="5.5" fill="#F59E0B" stroke="#2D1654" strokeWidth="1.8" />
    </svg>
  );
}

export function RestaurantMenuIllustration({ className = '', size = 84 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`editorial-illustration ${className}`}
      aria-hidden="true"
    >
      <path
        d="M60 24c-14-5-28-5-42 0v68c14-5 28-5 42 0 14-5 28-5 42 0V24c-14-5-28-5-42 0Z"
        fill="#FFFFFF"
        stroke="#2D1654"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M60 24v68" stroke="#2D1654" strokeWidth="1.8" />
      <path
        d="M26 38h24M26 48h18M48 48h4M26 58h16M48 58h4M26 68h20M48 68h4"
        stroke="#2D1654"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M70 38h24M70 48h18M92 48h4M70 58h16M92 58h4M70 68h20M92 68h4"
        stroke="#2D1654"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="38" cy="80" r="2.8" fill="#F59E0B" />
      <circle cx="82" cy="80" r="2.8" fill="#F59E0B" />
    </svg>
  );
}
