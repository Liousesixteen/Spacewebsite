import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Terminal, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

const COMMANDS = [
  { label: '同步运载火箭', cmd: 'pnpm sync:rockets' },
  { label: '同步发射场', cmd: 'pnpm sync:launch-sites' },
  { label: '同步宇航员', cmd: 'pnpm sync:astronauts' },
  { label: '同步航天器', cmd: 'pnpm sync:spacecraft' },
  { label: '同步发射任务', cmd: 'pnpm sync:launches' },
  { label: '一次性全量同步', cmd: 'pnpm sync' },
];

export default function AdminSyncPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">数据同步</h1>
        <p className="text-sm text-star-dim mt-1">
          为避免在请求生命周期内执行长时间任务，同步任务通过 CLI 触发。
        </p>
      </div>

      <Card>
        <CardContent className="p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-cosmic-blue shrink-0 mt-0.5" />
          <div className="text-sm text-star-dim space-y-1">
            <p>
              同步脚本会从外部数据源（如 The Space Devs、SpaceX API）拉取数据并写入数据库。
            </p>
            <p>
              在服务器或本地工程目录下运行下列命令即可。完整脚本位于
              <code className="mx-1 px-1.5 py-0.5 rounded bg-space-700 text-white text-xs font-mono">
                scripts/sync/
              </code>
              目录。
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>可用命令</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {COMMANDS.map((c) => (
              <li
                key={c.cmd}
                className="flex items-center justify-between gap-4 p-3 rounded-lg border border-space-700 bg-space-900/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Terminal className="w-4 h-4 text-cosmic-blue shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-white">{c.label}</p>
                    <code className="text-xs font-mono text-star-dim truncate">{c.cmd}</code>
                  </div>
                </div>
                <code className="text-xs font-mono px-3 py-1.5 rounded-md border border-space-600 bg-space-800 text-white whitespace-nowrap">
                  {c.cmd}
                </code>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>建议</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-star-dim space-y-2">
          <p>· 在生产环境中，建议通过 cron 或调度服务（如 Vercel Cron、GitHub Actions）周期性运行同步任务。</p>
          <p>· 大批量同步可能需要数分钟到数十分钟，请在低峰期执行。</p>
          <p>· 同步前请确认 <code className="px-1 bg-space-700 text-white text-xs">.env</code> 中相关 API 凭据已配置。</p>
        </CardContent>
      </Card>
    </div>
  );
}
