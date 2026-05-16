import Link from 'next/link';
import { Button } from '@/components/ui';
import { Home, Rocket } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="text-9xl font-bold text-gradient mb-6">404</div>
        <Rocket className="w-16 h-16 text-cosmic-blue mx-auto mb-6 animate-float" />
        <h1 className="text-4xl font-bold text-white mb-4">页面在太空中迷失了</h1>
        <p className="text-star-dim mb-8 text-lg">
          您访问的页面似乎飞出了我们的轨道。让我们带您回到地球。
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          <Link href="/zh-CN/launches">
            <Button variant="outline">浏览发射数据</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
