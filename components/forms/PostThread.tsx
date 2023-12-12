"use client";
import { ChangeEvent, useState } from 'react'
import { useUploadThing } from '@/lib/uploadthing';
import { isBase64Image } from '@/lib/utils';
import Image from 'next/image';
import { Input } from "@/components/ui/input"

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

  const [files, setFiles] = useState<File[]>([]);
  const { startUpload } = useUploadThing("media");
  const router = useRouter();
  const pathname = usePathname();
  const { organization } = useOrganization();

  const form = useForm({
      resolver: zodResolver(ThreadValidation),
      defaultValues: {
        thread: action === "edit" ? thread.text : " ",
        image:  action  ===  "edit"  ? thread.image : "",
      }
  })

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {

    const blob = values.image;
    
    const hasImageChanged = isBase64Image(blob);
    if (hasImageChanged) {
      const imgRes = await startUpload(files);

      if (imgRes && imgRes[0].fileUrl) {
        values.image = imgRes[0].fileUrl;
      }
    }
    
    if(action === "edit"){
    await updateThread({ threadId: thread._id, updatedImage: values.image,updatedText: values.thread, path: pathname})
    router.back();
    router.refresh();
    }else {
    await createThread({ 
      image: values.image,
      text: values.thread,
      author: JSON.parse(userId),
      communityId : organization ? organization.id : null ,
      path: pathname,
    });
    router.push("/");
    router.refresh();
  }
  };



  const handleImage = (
    e: ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    e.preventDefault();

    const fileReader = new FileReader();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles(Array.from(e.target.files));

      if (!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || "";
        fieldChange(imageDataUrl);
      };

      fileReader.readAsDataURL(file);
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
      name="image"
      render={({ field }) => (
        <FormItem className='flex items-center gap-4'>
          {field.value ? ( 
          <FormLabel>
            
            <Image
            src={field.value}
            alt="image"
            width={96}
            height={96}
            priority
            className="object-contain"
            /> 
          </FormLabel>
          ) : (
            <FormLabel className='account-form_image-label'>
            <Image
            src="/assets/profile.svg"
            alt="image"
            width={24}
            height={24}
            className="object-contain"
            />
            </FormLabel>

        )}
          <FormControl className='flex-1 text-base-semibold text-gray-200'>
            <Input
              type = 'file'
              accept='image/*'
              placeholder='Upload an image'
              className='account-form_image-input'
              onChange={(e) => {handleImage(e, field.onChange)}}
            />
          </FormControl>
        </FormItem>
        
      )}
    />


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