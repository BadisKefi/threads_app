"use client";

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrganization } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import { ThreadValidation } from '@/lib/validations/thread';
import path from 'path'
import { create } from 'domain';
import { createThread, fetchThreadById, updateThread } from '@/lib/actions/thread.actions';
import Thread from '@/lib/models/thread.model';

type Props = {
  user:{
      id: string,
      objectId: string,
      username: string,
      name: string,
      bio: string,
      image: string,
  };
  btnTitle: string;
}


const PostThread = ({ userId , action, thread }: {userId: string, action: string, thread: any}) => {

  const router = useRouter();
  const pathname = usePathname();
  const { organization } = useOrganization();

  const form = useForm({
      resolver: zodResolver(ThreadValidation),
      defaultValues: {
        thread: action === "edit" ? thread.text : " ",
      }
  })

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    if(action === "edit"){
    await updateThread({ threadId: thread._id, updatedText: values.thread, path: pathname})
    router.back();
    }else {
    await createThread({ 
      text: values.thread,
      author: JSON.parse(userId),
      communityId : organization ? organization.id : null ,
      path: pathname,
    });
    router.push("/");
  }
  };

  return (
    <Form {...form}>
    <form 
    onSubmit={form.handleSubmit(onSubmit)}
    className="mt-10 flex flex-col justify-start gap-10"
  >
          <FormField
          control={form.control}
          name='thread'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                Content
              </FormLabel>
              <FormControl className='no-focus border border-dark-4 bg-dark-3 text-light-1'>
                <Textarea
                  rows={15}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='bg-primary-500'>
          {action === 'create' ? 'Post thread': 'Update thread'}
        </Button>      
  </form>
  </Form>
)
}

export default PostThread