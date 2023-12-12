"use client";
import { ChangeEvent, useState } from 'react'
import { useUploadThing } from '@/lib/uploadthing';
import { isBase64Image } from '@/lib/utils';

import { z } from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

import { Input } from "../ui/input";
import { Button } from "../ui/button";

import { CommentValidation } from "@/lib/validations/thread";
import { addCommentToThread } from "@/lib/actions/thread.actions";

interface Props {
    threadId: string;
    currentUserImg: string;
    currentUserId: string;
  }

const Comment = ({ threadId, currentUserImg, currentUserId }: Props) => {
  const [files, setFiles] = useState<File[]>([]);
  const { startUpload } = useUploadThing("media");
    const pathname = usePathname();

    const form = useForm<z.infer<typeof CommentValidation>>({
      resolver: zodResolver(CommentValidation),
      defaultValues: {
        thread: "",
        image: "",
      },
    });
  
    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {

      const blob = values.image;
    
      const hasImageChanged = isBase64Image(blob);
      if (hasImageChanged) {
        const imgRes = await startUpload(files);

        if (imgRes && imgRes[0].fileUrl) {
          values.image = imgRes[0].fileUrl;
        }
      }

      await addCommentToThread({
        threadId: JSON.parse(threadId),
        commentImage: values.image,
        commentText: values.thread,
        userId: JSON.parse(currentUserId),
        pathname: pathname
    });
      form.reset();
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
    <form className='comment-form' onSubmit={form.handleSubmit(onSubmit)}>
    
      <FormField
        control={form.control}
        name='thread'
        render={({ field }) => (
          <FormItem className='flex w-full items-center justify-around gap-3'>
            <FormLabel>
              <Image
                src={currentUserImg}
                alt='current_user'
                width={48}
                height={48}
                className='rounded-full object-cover'
              />
            </FormLabel>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className='flex items-center'>
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
                    <FormLabel>
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
                      placeholder='Upload img'
                      className='account-form_image-input'
                      onChange={(e) => {handleImage(e, field.onChange)}}
                    />
                  </FormControl>
                </FormItem>
                
              )}
            />
            <FormControl className='border-none bg-transparent'>
              <Input
                type='text'
                {...field}
                placeholder='Comment...'
                className='no-focus text-light-1 outline-none'
              />
            </FormControl>
          </FormItem>
        )}
      />

      <Button type='submit' className='comment-form_btn'>
        Reply
      </Button>
    </form>
  </Form>
  )
}

export default Comment