import ThreadCard from "@/components/cards/ThreadCard";
import { isMember } from "@/lib/actions/community.actions";
import { fetchThreads } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import Thread from "@/lib/models/thread.model";
import { UserButton, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
 
export default async function Home() {
  
  // redirect to onboarding if user is not onboarded
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) {
    redirect("/onboarding");
  }
  if(!(userInfo?.status === 'active')) redirect('/activate-account');

  const result = await fetchThreads(1,10);


  return (
   <>
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {result.threads.length === 0 ? (
          <p className="no-result"> No threads found</p>
          ) : (
            <>
          {result.threads.map(async (thread) => 
            thread.author.etat === 'unbanned' && thread.author.status === 'active' && (thread.community == null || await isMember(user.id, thread.community.id)) &&(
              <ThreadCard
                key={thread._id}
                id={thread._id}
                currentUserId={user.id}
                parentId={thread.parentId}
                image={thread.image}
                content={thread.text}
                author={thread.author}
                community={thread.community}
                createdAt={thread.createdAt}
                comments={thread.children}
              />
              )
            )}
            </>
          )
        }

      </section>
   </>
  )
}