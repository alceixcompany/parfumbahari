'use client';
import ReduxProvider from '@/components/ReduxProvider';
import AdminAuth from '@/components/AdminAuth';
import AdminLayoutContent from '@/components/AdminLayoutContent';
export default function CloudAdmin({ children }: { children: React.ReactNode }) { return <ReduxProvider><AdminAuth><AdminLayoutContent>{children}</AdminLayoutContent></AdminAuth></ReduxProvider>; }
