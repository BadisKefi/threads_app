"use client";

import Link from "next/link";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import {
  TriangleDownIcon,
  DeleteIcon,
  EditIcon,
  MinusIcon,
  LockIcon,
  UnlockIcon,
} from '@chakra-ui/icons';
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
import {
  banUser,
  deasctivateAccount,
  deleteAccount,
  unbanUser,
} from "@/lib/actions/user.actions";
import { SignOutButton } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";

export default function ProfileMenu({
  accountId,
  authUserId,
  role,
  etat,
  type,
}: {
  accountId: string;
  authUserId: string;
  role: string;
  etat: string;
  type: string;
}) {
  const router = useRouter();
  const path = usePathname();
  const toast = useToast();

  return (
    <div>
      <Menu placement='bottom-end'>
        <MenuButton
          as={IconButton}
          aria-label='Options'
          icon={<TriangleDownIcon color="white"/>}
          variant='outline'
          bg='transparent'
        />
        <MenuList
          style={{ maxHeight: '128px', overflowY: 'auto', minWidth: '120px', maxWidth: '190px'}}
          className='custom-scrollbar'
        >
          {accountId === authUserId && type !== "Community" && (
            <Link href='/profile/edit'>
              <MenuItem icon={<EditIcon />}>Edit Profile</MenuItem>
            </Link>
          )}

          {accountId === authUserId && type !== "Community" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <MenuItem icon={<DeleteIcon />}>Delete Account</MenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will delete this account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={async () => {
                    const result = await deleteAccount(accountId);
                  }}>
                    <SignOutButton signOutCallback={() => {
                      router.push("/sign-in");
                    }}>
                      Delete
                    </SignOutButton>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {accountId === authUserId && type !== "Community" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <MenuItem icon={<MinusIcon />}>Deactivate Account</MenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will deactivate this account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={async () => {
                    const result = await deasctivateAccount(accountId);
                  }}>
                    <SignOutButton signOutCallback={() => {
                      router.push("/sign-in");
                    }}>
                      Deactivate
                    </SignOutButton>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {(accountId !== authUserId && role === 'admin' && etat === 'unbanned') && type !== "Community" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <MenuItem icon={<LockIcon />}>Ban Account</MenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will ban this account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={async () => {
                    const examplePromise = new Promise((resolve, reject) => {
                      setTimeout(() => resolve(200), 5000);
                    });

                    toast.promise(examplePromise, {
                      success: { title: 'Account banned successfully', description: 'Done' },
                      error: { title: 'Something went wrong', description: 'Something wrong' },
                      loading: { title: 'Banning account...', description: 'Please wait' },
                    });

                    const result = await banUser(accountId, path);
                  }}>Ban</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {(accountId !== authUserId && role === 'admin' && etat === 'banned') && type !== "Community" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <MenuItem icon={<UnlockIcon />}>Unban Account</MenuItem>
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
                    const unbanPromise = new Promise((resolve, reject) => {
                      setTimeout(() => resolve(200), 5000);
                    });

                    toast.promise(unbanPromise, {
                      success: { title: 'Account unbanned successfully', description: 'Done' },
                      error: { title: 'Something went wrong', description: 'Unable to unban account' },
                      loading: { title: 'Unbanning account...', description: 'Please wait' },
                    });

                    const result = await unbanUser(accountId, path);
                  }}>Unban</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </MenuList>
      </Menu>
    </div>
  );
}
