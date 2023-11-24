import ThreadCard from "@/components/cards/ThreadCard";
import Comment from "@/components/forms/Comment";
import { isMember } from "@/lib/actions/community.actions";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { json } from "stream/consumers";

const page = async ({ params } : { params : { id: string }}) => {
  
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");
  if(!(userInfo?.status === 'active')) redirect('/activate-account');
  
  const thread = await fetchThreadById(params.id);
  const isMemberOfCommunity = await isMember(user.id, thread.community.id);
  if (!(thread.author.etat === 'unbanned' && thread.author.status === 'active' && (thread.community == null || thread.community !== null && isMemberOfCommunity))) redirect('/'); 

  return (
    <section className='relative'>
         <div>
        <ThreadCard
          id={thread._id}
          currentUserId={user.id}
          parentId={thread.parentId}
          content={thread.text}
          author={thread.author}
          community={thread.community}
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      </div>

      <div className='mt-7'>
        <Comment
          threadId={JSON.stringify(thread._id)}
          currentUserImg={userInfo?.image}
          currentUserId={JSON.stringify(userInfo?._id)}
        />
      </div>

      <div className='mt-10'>
        {thread.children.map((childItem: any) => (
          <ThreadCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={user.id}
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            community={childItem.community}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            isComment
          />
        ))}
      </div>

    </section>
  )
}

export default page
