import { requireAdmin } from '@/lib/auth/admin';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';

export const metadata = {
  title: '管理后台 | SpaceData',
  robots: { index: false, follow: false },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  const admin = await requireAdmin();

  return (
    // Overlay the public navbar/footer so admin is a full-viewport workspace.
    <div className="fixed inset-0 z-[60] bg-space-900 text-white flex overflow-hidden">
      <AdminSidebar locale={locale} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          locale={locale}
          name={admin.name}
          email={admin.email}
          image={admin.image}
        />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
