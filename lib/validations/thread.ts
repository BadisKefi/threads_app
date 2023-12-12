import * as z from 'zod';




export const ThreadValidation = z.object({
   image: z.string().nonempty().url(),
   thread: z.string().nonempty().min(3, { message: "Minimum 3 characters" }),
   //acountId: z.string(),
});

export const CommentValidation = z.object({
    image: z.string().nonempty().url(),
    thread: z.string().nonempty().min(3, { message: "Minimum 3 characters" }),
    //acountId: z.string(),
});
