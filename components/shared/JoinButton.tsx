'use client';

import { useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { set } from "mongoose";
import { useToast } from "@chakra-ui/toast";
import { createRequest } from "@/lib/actions/requests.actions";
import { usePathname } from "next/navigation";

export default function JoinButton({userId, communityId, alreadyRequested, isMember}: {userId: string, communityId: string, alreadyRequested: boolean, isMember: boolean}) {
    const [isloading, setisloading] = useState(false)
    const toast = useToast();
    const path = usePathname();

  return (
    <Button
      type="submit"
      className="bg-primary-500 mt-15 w-40"
      disabled={isloading || alreadyRequested}
      onClick={async () => {
        setisloading(true);
        setTimeout(() => {
          setisloading(false);
          toast({
            position: 'top',
            title: 'Request sent.',
            description: "Your request has been sent to the community's admin.",
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
        }, 3000);
        console.log('USER :' + userId, "COMMUNITY :" + communityId);
        await createRequest({userId, communityId, path});
      }}
    >
      {isloading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Join"}
    </Button>

  )
}
