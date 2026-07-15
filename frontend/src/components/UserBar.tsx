import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { SignOutIcon } from './ui/Icons';

function getInitials(email: string) {
  const local = email.split('@')[0] ?? '';
  const parts = local.split(/[._-]/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }

  return local.slice(0, 2).toUpperCase();
}

export function UserBar() {
  const { email, logout } = useAuth();

  if (!email) {
    return null;
  }

  const initials = getInitials(email);

  return (
    <div className="mb-8 flex justify-end sm:mb-10">
      <div className="flex items-center gap-3 rounded-[32px] bg-clay-card px-3 py-2 shadow-clay-card backdrop-blur-xl sm:gap-4 sm:px-4 sm:py-2.5">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 font-nunito text-sm font-black text-white shadow-clay-button"
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="m-0 truncate text-sm font-bold text-clay-foreground">
            {email}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          aria-label="Sign out"
          className="!h-11 !w-11 !min-w-0 !px-0 text-clay-muted hover:text-clay-foreground"
        >
          <SignOutIcon />
        </Button>
      </div>
    </div>
  );
}
