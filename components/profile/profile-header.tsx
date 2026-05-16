import { format } from 'date-fns';
import { User as UserIcon } from 'lucide-react';

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: Date;
  };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const displayName = user.name || user.email?.split('@')[0] || '用户';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-5 mb-8">
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cosmic-blue/40 shrink-0">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-cosmic-blue/20 flex items-center justify-center text-2xl text-cosmic-blue">
            {initial || <UserIcon className="w-8 h-8" />}
          </div>
        )}
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white">{displayName}</h1>
        {user.email && (
          <p className="text-sm text-star-dim mt-0.5">{user.email}</p>
        )}
        <p className="text-xs text-star-dim mt-1">
          加入于 {format(new Date(user.createdAt), 'yyyy-MM-dd')}
        </p>
      </div>
    </div>
  );
}
