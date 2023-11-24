'use client'

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
import { getBannedUsers, getBannedUsersCount, unbanUser } from "@/lib/actions/user.actions";
import { Button } from "../ui/button";
import { Key } from "lucide-react";
import path from "path";
import { useToast } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
  
  export function RecentSales({bannedUsers} : {bannedUsers: any}) {

    const router = useRouter();
    const path = usePathname();
    const toast = useToast();
    return (
      <div className="space-y-8 max-h-[300px] overflow-auto custom-scrollbar">
        {bannedUsers.map((user:any) => (

                  <div className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.image} alt="Avatar" />
                    <AvatarFallback>IN</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{`${user.name}`}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div className="ml-auto">
                  <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='secondary' >Unban</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will unban this account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={async () => {
                            toast({
                              title: `${user.name} has been unbanned successfully}`,
                              status: 'success',
                              duration: 3000,
                              isClosable: true,
                            })
                    const result = await unbanUser(user.id, path);
                  }}>Unban</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
                  </div>
                </div>
        ))
        }
      </div>
    )
  }