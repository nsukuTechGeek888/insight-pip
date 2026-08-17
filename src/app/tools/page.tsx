// app/tools/page.tsx - SEO ENHANCED
import { headers } from 'next/headers';
import { SEO } from '@/components/SEO';
import { BreadcrumbSchema } from '@/components/StructuredData';
import DesktopToolsPage from './DesktopToolsPage';
import MobileToolsPage from '@/components/tools/MobileToolsPage';

const breadcrumbItems = [
  { name: 'Home', url: '/' },
  { name: 'Tools', url: '/tools' },
];

export default async function ToolsPage() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  return (
    <>
      <SEO
        title="Trading Tools - Pip Calculator, Risk Manager, Economic Calendar"
        description="Free trading tools for forex and prop traders. Pip calculator, risk manager, economic calendar, and currency converter to enhance your trading."
        keywords="trading tools, pip calculator, risk management, economic calendar, currency converter, forex tools"
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      {isMobile ? <MobileToolsPage /> : <DesktopToolsPage />}
    </>
  );
}