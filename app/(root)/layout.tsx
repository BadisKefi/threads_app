import { ThemeProvider } from "@/components/theme-provider"
import { ClerkProvider, currentUser } from '@clerk/nextjs'
import { Providers } from "@/providers/providers";
import '../globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import TopBar from '@/components/shared/TopBar'
import LeftSideBar from '@/components/shared/LeftSideBar'
import RightSideBar from '@/components/shared/RightSideBar'
import BottomBar from '@/components/shared/BottomBar'
import { Component } from "lucide-react"
import { fetchUser } from "@/lib/actions/user.actions";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Threads',
  description: 'A Next.js 13 Threads Application',
}

export default async function RootLayout({ children, } : { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  return (
    <ClerkProvider>
      <html lang="en">
      <body className={inter.className}>
      <Providers>
          <TopBar />
          <main className='flex flex-row'>
            <LeftSideBar role={userInfo?.role}/>
            <section className='main-container'>
              <div className='w-full max-w-4xl'>{children}</div>
            </section>
            <RightSideBar />
          </main>
          <BottomBar />
        </Providers>
          </body>
      </html>
    </ClerkProvider>
    
  )
}
