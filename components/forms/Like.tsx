
import { LikeToggleThread, fetchThreadById } from "@/lib/actions/thread.actions";
import Image from "next/image";
import LikeImage from "./LikeImage";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";

const Like = async ({ threadId }: { threadId: string }) => {
  const user = await currentUser();
  if (!user) return null;

  const thread = await fetchThreadById(threadId);
  const userInfo = await fetchUser(user.id);
  const isLiked = thread.likers.includes(userInfo._id);
  return (
    <LikeImage
        isLiked={isLiked}
        threadId={JSON.stringify(threadId)}
        userId={user.id}
        countedLikers={thread.likers.length}
    />
  );
}

export default Like;
