import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

export default function Home() {
  // 直接重定向到仪表板页面（带语言前缀）
  redirect(`/${defaultLocale}/dashboard/`);
}
