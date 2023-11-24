"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "../ui/button";
import { acceptRequest, rejectRequest } from "@/lib/actions/requests.actions";
import { useToast } from "@chakra-ui/react";


function RequestCard({requestId,adminId, userId, name, username, email, image, communityId} : {requestId:string, adminId:string, userId: string, name: string, email:string, username: string, image: string, communityId: string}) {
  const toast = useToast();
  const router = useRouter();
  const path = usePathname();

  return (
    <article className='user-card'>
      <div className='user-card_avatar'>
        <div className='relative h-12 w-12'>
          <Image
            src={image}
            alt='user_logo'
            fill
            className='rounded-full object-cover'
            onClick={() => {
                router.push(`/profile/${userId}`);
              }
            }
          />
        </div>

        <div className='flex-1 text-ellipsis'>
          <h4 className='text-base-semibold text-light-1'>{name}</h4>
          <p className='text-small-medium text-gray-1'>@{username}</p>
        </div>
      </div>

      <Button
      className="request-card_acceptBtn"
      onClick={async () => {
        const examplePromise = new Promise((resolve, reject) => {
            setTimeout(() => resolve(200), 5000);
          });

          toast.promise(examplePromise, {
            success: { title: 'Request approved', description: 'Done' },
            error: { title: 'Something went wrong', description: 'Something wrong' },
            loading: { title: 'Approving request...', description: 'Please wait' },
          });
        await acceptRequest(requestId, adminId, email, communityId, path); // Fixed the syntax issue here
      }}
      >
        Accept
      </Button>
      <Button
        className='request-card_rejectBtn'
        onClick={async() => {
            const examplePromise = new Promise((resolve, reject) => {
                setTimeout(() => resolve(200), 5000);
              });
    
              toast.promise(examplePromise, {
                success: { title: 'Request rejected', description: 'Done' },
                error: { title: 'Something went wrong', description: 'Something wrong' },
                loading: { title: 'Rejecting request...', description: 'Please wait' },
              });
            await rejectRequest(requestId, path)
        }}
      >
        Reject
      </Button>

    </article>
  );
}

export default RequestCard;