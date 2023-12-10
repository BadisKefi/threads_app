import { redirect } from "next/navigation";

import { fetchCommunityThreads, isMember } from "@/lib/actions/community.actions";
import { fetchUserThreads } from "@/lib/actions/user.actions";

import ThreadCard from "../cards/ThreadCard";
import { currentUser } from "@clerk/nextjs";

interface Result {
  name: string;
  image: string;
  id: string;
  threads: {
    _id: string;
    text: string;
    parentId: string | null;
    author: {
      name: string;
      image: string;
      id: string;
    };
    community: {
      id: string;
      name: string;
      image: string;
    } | null;
    createdAt: string;
    etat: string;
    status: string;
    children: {
      author: {
        image: string;
      };
    }[];
  }[];
}

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

async function ThreadsTab({ currentUserId, accountId, accountType }: Props) {
  let result: any;
  const user = await currentUser();
  if (!user) return null;

  if (accountType === "Community") {
    result = await fetchCommunityThreads(accountId);
  } else {
    result = await fetchUserThreads(accountId);
  }

  return (
    <section className='mt-9 flex flex-col gap-10'>
      {result.threads.map(async (thread: any) =>  thread.author.etat === 'unbanned' && thread.author.status === 'active' && (thread.community == null || await isMember(user.id, thread.community.id)) &&(
        <ThreadCard
          key={thread._id}
          id={thread._id}
          currentUserId={currentUserId}
          parentId={thread.parentId}
          content={thread.text}
          author={
            accountType === "User"
              ? { name: result.name, image: result.image, id: result.id }
              : {
                  name: thread.author.name,
                  image: thread.author.image,
                  id: thread.author.id,
                }
          }
          community={
            accountType === "Community"
              ? { name: result.name, id: result.id, image: result.image }
              : thread.community
          }
          createdAt={thread.createdAt}
          comments={thread.children}
        />
       )
      )}
    </section>
  );
}

export default ThreadsTab;