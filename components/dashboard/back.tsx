'use client'

import  Image  from "next/image"
import { useRouter } from "next/navigation";

export default function Back() {
    const router = useRouter();
  return (
    <Image
        src="/assets/fleche-gauche.png"
        width={50}
        height={50}
        alt="Back"
        className="cursor-pointer"
        onClick={() => router.back()}
    />
  )
}
