import Image from "next/image";
import { currentUser } from "@clerk/nextjs";

import { communityTabs } from "@/constants";

import UserCard from "@/components/cards/UserCard";
import ThreadsTab from "@/components/shared/ThreadsTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fetchCommunityDetails, isCommunityAdmin, isMember } from "@/lib/actions/community.actions";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import JoinButton from "@/components/shared/JoinButton";
import { alreadyRequested, getRequests } from "@/lib/actions/requests.actions";
import RequestCard from "@/components/cards/RequestCard";

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");
  if(!(userInfo?.status === 'active')) redirect('/activate-account');

  const communityDetails = await fetchCommunityDetails(params.id);
  const requests = await getRequests(params.id);


  const isMemberOfCommunity = await isMember(user.id, params.id);
  const isComAdmin =    await isCommunityAdmin(user.id, params.id);
  const requestExist = await alreadyRequested(user.id, params.id);

  return (
    <section>
      <ProfileHeader
        accountId={communityDetails.createdBy.id}
        authUserId={user.id}
        role={userInfo.role}
        etat={userInfo.etat}
        name={communityDetails.name}
        username={communityDetails.username}
        imgUrl={communityDetails.image}
        bio={communityDetails.bio}
        type='Community'
      />

<div className='relative mt-9'>
  {isMemberOfCommunity ? (
    <Tabs defaultValue='threads' className='w-full'>
      <TabsList className='tab'>
        {communityTabs.map((tab) => (
          (tab.label === 'Requests' && isComAdmin) || tab.label !== 'Requests' ? (
            <TabsTrigger key={tab.label} value={tab.value} className='tab'>
              <Image
                src={tab.icon}
                alt={tab.label}
                width={24}
                height={24}
                className='object-contain'
              />
              <p className='max-sm:hidden'>{tab.label}</p>
            </TabsTrigger>
          ) : null
        ))}
      </TabsList>

          <TabsContent value='threads' className='w-full text-light-1'>
            {/* @ts-ignore */}
            <ThreadsTab
              currentUserId={user.id}
              accountId={communityDetails._id}
              accountType='Community'
            />
          </TabsContent>

          <TabsContent value='members' className='mt-9 w-full text-light-1'>
            <section className='mt-9 flex flex-col gap-10'>
              {communityDetails.members.map((member: any) => (
                <UserCard
                  key={member.id}
                  id={member.id}
                  name={member.name}
                  username={member.username}
                  imgUrl={member.image}
                  personType='User'
                />
              ))}
            </section>
          </TabsContent>

          {isComAdmin && (<TabsContent value='requests' className='w-full text-light-1'>
            <section className='mt-9 flex flex-col gap-10'>
            {requests.map((request: any, index: number) => (
                <RequestCard
                  key={index}
                  requestId={request._id}
                  adminId={user.id}
                  userId={request.user.id}
                  name={request.user.name}
                  username={request.user.username}
                  email={request.user.email}
                  image={request.user.image}
                  communityId={params.id}
                />
              ))}
            </section>
          </TabsContent>)}
        </Tabs>) : (
          <div className='flex flex-col items-center justify-center gap-5'>
            <Image
              className="object-contain ml-7"
              src='/assets/private2.png'
              alt='lock'
              width={275}
              height={275}
            />
            <JoinButton userId={user.id} communityId={communityDetails.id} alreadyRequested={requestExist} isMember={isMemberOfCommunity}/>
          </div>
        )
        }
      </div>
    </section>
  );
}

export default Page;