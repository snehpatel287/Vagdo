// Minimal outline icon set (Heroicons-style paths), stroke-based so they inherit
// text color via currentColor. Keeps the app's iconography consistent without a
// dependency.

function Icon({ children, className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function LeafIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5 21c7-1 13-6 14-14 .1-1-.1-2-.5-3-1 .4-2 .6-3 .5C7 5 2 11 1 18c3 0 5.5-1 7.5-3" />
      <path d="M8 16c3-3 6-6 9-9" />
    </Icon>
  );
}

export function TreeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3l4 6h-2.5l3 5h-3l3 5H7.5l3-5h-3l3-5H8l4-6z" />
      <path d="M12 19v2" />
    </Icon>
  );
}

export function MapIcon(props) {
  return (
    <Icon {...props}>
      <path
        strokeLinejoin="round"
        d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437a1.125 1.125 0 00.622-1.006V4.82a1.125 1.125 0 00-1.628-1.006l-3.869 1.934a1.125 1.125 0 01-1.006 0L9.503 3.804a1.125 1.125 0 00-1.006 0L3.622 6.241A1.125 1.125 0 003 7.247v13.5a1.125 1.125 0 001.628 1.006l3.869-1.934a1.125 1.125 0 011.006 0l4.994 2.497a1.125 1.125 0 001.006 0z"
      />
    </Icon>
  );
}

export function PlusIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 4.5v15m7.5-7.5h-15" />
    </Icon>
  );
}

export function PencilIcon(props) {
  return (
    <Icon {...props}>
      <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
      <path d="M15.75 5.6l2.65 2.65" />
    </Icon>
  );
}

export function TrashIcon(props) {
  return (
    <Icon {...props}>
      <path d="M14.74 9l-.346 9m-4.788 0L9.26 9M19.228 5.79a48.108 48.108 0 00-3.478-.397m-7.5 0a48.11 48.11 0 00-3.478.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0M18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79h14.456z" />
    </Icon>
  );
}

export function CameraIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.823 1.316z" />
      <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </Icon>
  );
}

export function PhotoIcon(props) {
  return (
    <Icon {...props}>
      <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 19.5h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
      <path d="M15.75 8.25a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </Icon>
  );
}

export function XMarkIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6 18L18 6M6 6l12 12" />
    </Icon>
  );
}

export function ChevronDownIcon(props) {
  return (
    <Icon {...props}>
      <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </Icon>
  );
}

export function MapPinIcon(props) {
  return (
    <Icon {...props}>
      <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </Icon>
  );
}

export function SearchIcon(props) {
  return (
    <Icon {...props}>
      <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </Icon>
  );
}

export function SpinnerIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`${className} animate-spin`}
      aria-hidden="true"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 00-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DownloadIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 10.5L12 15m0 0l4.5-4.5M12 15V3" />
    </Icon>
  );
}

export function SunIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </Icon>
  );
}

export function MoonIcon(props) {
  return (
    <Icon {...props}>
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
    </Icon>
  );
}

export function ChevronLeftIcon(props) {
  return (
    <Icon {...props}>
      <path d="M15.75 19.5L8.25 12l7.5-7.5" />
    </Icon>
  );
}

export function ChevronRightIcon(props) {
  return (
    <Icon {...props}>
      <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </Icon>
  );
}

export function ArrowsUpDownIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 7.5L6.75 3.75M6.75 3.75L10.5 7.5M6.75 3.75v16.5" />
      <path d="M21 16.5l-3.75 3.75M17.25 20.25L13.5 16.5M17.25 20.25V3.75" />
    </Icon>
  );
}

export function FilterIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3.75 5.25h16.5M6.75 12h10.5M10.5 18.75h3" />
    </Icon>
  );
}

export function CalendarIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 5.25h15a.75.75 0 01.75.75v12.75a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V6a.75.75 0 01.75-.75z" />
    </Icon>
  );
}

export function ActivityIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 12h3.5l2-5 4 10 2-5H21" />
    </Icon>
  );
}

export function CheckCircleIcon(props) {
  return (
    <Icon {...props}>
      <path d="M9 12.75l2.25 2.25 4.5-4.5" />
      <circle cx="12" cy="12" r="9" />
    </Icon>
  );
}

export function ShieldIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </Icon>
  );
}

export function UserIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.2-3.5 4.2-5.5 7.5-5.5s6.3 2 7.5 5.5" />
    </Icon>
  );
}

export function LogoutIcon(props) {
  return (
    <Icon {...props}>
      <path d="M9 21H6a2 2 0 01-2-2V5a2 2 0 012-2h3" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Icon>
  );
}

export function UserPlusIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c1.1-3.3 3.9-5.2 6.5-5.2s5.4 1.9 6.5 5.2" />
      <path d="M18 8.5v5M15.5 11h5" />
    </Icon>
  );
}

export function LockIcon(props) {
  return (
    <Icon {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7.5a4 4 0 118 0V11" />
    </Icon>
  );
}

export function AlertTriangleIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.5L2.5 20h19L12 3.5z" />
      <path d="M12 9.5v4.5" />
      <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function UnlockIcon(props) {
  return (
    <Icon {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7.5a4 4 0 017.5-2" />
    </Icon>
  );
}

export function MailIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5L12 13l8.5-6.5" />
    </Icon>
  );
}

