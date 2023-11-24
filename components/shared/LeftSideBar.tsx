"use client";

import React from 'react'
import Image from "next/image";
import Link from "next/link";
import { redirect, usePathname, useRouter } from "next/navigation";
import { SignOutButton, SignedIn, useAuth, currentUser} from "@clerk/nextjs";

import { sidebarLinks } from "@/constants"
import { fetchUser } from '@/lib/actions/user.actions';

const LeftSideBar = ({ role } : { role : string}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuth();

  async function getUserRole() {
    const user = await currentUser();
    if (!user) return null;
    const userInfo = await fetchUser(user.id);
    return userInfo.role;
  }

  return (
    <section className='custom-scrollbar leftsidebar'>
        <div className='flex w-full flex-1 flex-col gap-6 px-6'>
    {sidebarLinks.map((link) => {
      const isActive = (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route;
      if (link.route === '/profile') {
        link.route = `/profile/${userId}`;
      }
      return (
        (link.route !== '/dashboard' || (link.route !== '/dashboard' && role === 'admin')) && (
          <Link
            href={link.route}
            key={link.label}
            className={`leftsidebar_link ${isActive && "bg-primary-500 "}`}
          >
            <Image
              src={link.imgURL}
              alt={link.label}
              width={24}
              height={24}
            />
            <p className='text-light-1 max-lg:hidden'>{link.label}</p>
          </Link>
        )
      );
    })}
  </div>
    <div className='mt-10 px-6'>
      <SignedIn>
        <SignOutButton signOutCallback={() => router.push("/sign-in")}>
          <div className='flex cursor-pointer gap-4 p-4'>
            <Image
              src='/assets/logout.svg'
              alt='logout'
              width={24}
              height={24}
            />
            <p className='text-light-2 max-lg:hidden'>Logout</p>
          </div>
        </SignOutButton>
      </SignedIn>
    </div>
  </section>
  )
}

export default LeftSideBar