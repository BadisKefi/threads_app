'use client';

import { LikeToggleThread} from "@/lib/actions/thread.actions";
import Image from "next/image";
import { usePathname } from "next/navigation";

const LikeImage = ({isLiked, threadId, userId, countedLikers} : {isLiked : boolean, threadId: string, userId: string, countedLikers: number} ) => {
    const path = usePathname();
  return (
    <div className="flex space-x-2 text-gray-1">
    <Image
    src={isLiked ? '/assets/heart-filled.svg' : '/assets/heart-gray.svg'}
    alt='heart'
    width={24}
    height={24}
    className='cursor-pointer object-contain'
    onClick={async () => {await LikeToggleThread(userId,threadId, path)}}
  />

  <p>{countedLikers}</p>
  </div>
  )
}

export default LikeImage;