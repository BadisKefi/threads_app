"use server";

import { FilterQuery, SortOrder, model } from "mongoose";
import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";
import axios from "axios";
import { any } from "zod";

export async function createCommunity(
  id: string,
  name: string,
  username: string,
  image: string,
  bio: string,
  createdById: string // Change the parameter name to reflect it's an id
) {
  try {
    connectToDB();

    // Find the user with the provided unique id
    const user = await User.findOne({ id: createdById }).exec();

    if (!user) {
      throw new Error("User not found"); // Handle the case if the user with the id is not found
    }

    const newCommunity = new Community({
      id,
      name,
      username,
      image,
      bio,
      createdBy: user._id, // Use the mongoose ID of the user
    });

    const createdCommunity = await newCommunity.save();

    // Update User model
    await User.updateOne(
      { _id: user._id },
      { $push: { communities: createdCommunity._id } }
    );


    return createdCommunity;
  } catch (error) {
    // Handle any errors
    console.error("Error creating community:", error);
    throw error;
  }
}

export async function fetchCommunityDetails(id: string) {
  try {
    connectToDB();

    const communityDetails = await Community.findOne({ id }).populate([
      {
        path: "createdBy",
        model: User
      },
      {
        path: "members",
        model: User,
        select: "name username image _id id",
      },
    ]);

    return communityDetails;
  } catch (error) {
    // Handle any errors
    console.error("Error fetching community details:", error);
    throw error;
  }
}

export async function fetchCommunityThreads(id: string) {
  try {
    connectToDB();

    const communityPosts = await Community.findById(id).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "author",
          model: User,
          select: "name image id", // Select the "name" and "_id" fields from the "User" model
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "image _id", // Select the "name" and "_id" fields from the "User" model
          },
        },
      ],
    });

    return communityPosts;
  } catch (error) {
    // Handle any errors
    console.error("Error fetching community posts:", error);
    throw error;
  }
}

export async function fetchCommunities({
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    // Calculate the number of communities to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter communities.
    const query: FilterQuery<typeof Community> = {};

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched communities based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    // Create a query to fetch the communities based on the search and sort criteria.
    const communitiesQuery = Community.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate("members");

    // Count the total number of communities that match the search criteria (without pagination).
    const totalCommunitiesCount = await Community.countDocuments(query);

    const communities = await communitiesQuery.exec();

    // Check if there are more communities beyond the current page.
    const isNext = totalCommunitiesCount > skipAmount + communities.length;

    return { communities, isNext };
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
}

export async function addMemberToCommunity(
  communityId: string,
  memberId: string
) {
  try {
    connectToDB();

    // Find the community by its unique id
    const community = await Community.findOne({ id: communityId });

    if (!community) {
      throw new Error("Community not found");
    }

    // Find the user by their unique id
    const user = await User.findOne({ id: memberId });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user is already a member of the community
    if (community.members.includes(user._id)) {
      throw new Error("User is already a member of the community");
    }

    // Add the user's _id to the members array in the community
    community.members.push(user._id);
    await community.save();

    // Add the community's _id to the communities array in the user
    user.communities.push(community._id);
    await user.save();

    return community;
  } catch (error) {
    // Handle any errors
    console.error("Error adding member to community:", error);
    throw error;
  }
}

export async function removeUserFromCommunity(
  userId: string,
  communityId: string
) {
  connectToDB();
  try {
    const userObject = await User.findOne({ id: userId }).exec();
    const communityObject = await Community.findOne({ id: communityId }).exec();

    if (!userObject) {
      throw new Error("User not found");
    }

    if (!communityObject) {
      throw new Error("Community not found");
    }       
    console.log("User : ", userObject._id, "Community : ", communityObject._id);

    // Delete all threads created by the user in the community
    await Thread.deleteMany({ community: communityObject._id, author: userObject._id });

    // Remove the user's _id from the members array in the community
    await Community.updateOne(
      { _id: communityObject._id },
      { $pull: { members: userObject._id } }
    );

    // Remove the community's _id from the communities array in the user
    await User.updateOne(
      { _id: userObject._id },
      { $pull: { communities: communityObject._id } }
    );

    return { success: true };
  } catch (error) {
    // Handle any errors
    console.error("Error removing user from community:", error);
    throw error;
  }
}

export async function updateCommunityInfo(
  communityId: string,
  name: string,
  username: string,
  image: string
) {
  try {
    connectToDB();

    // Find the community by its _id and update the information
    const updatedCommunity = await Community.findOneAndUpdate(
      { id: communityId },
      { name, username, image }
    );

    if (!updatedCommunity) {
      throw new Error("Community not found");
    }

    return updatedCommunity;
  } catch (error) {
    // Handle any errors
    console.error("Error updating community information:", error);
    throw error;
  }
}

export async function deleteCommunity(communityId: string) {
  try {
    connectToDB();
    // Find the community by its ID
    const communityObject = await Community.findOne({ id: communityId }).exec();
    if (!communityObject) {
      throw new Error("Community not found");
    }
    // Delete all threads associated with the community
     await Thread.deleteMany({ community: communityObject._id });

    // Find all users who are part of the community
    const communityUsers = await User.find({ communities: communityObject._id });

    // Remove the community from the 'communities' array for each user
    const updateUserPromises = communityUsers.map(async (user) => {
      user.communities.pull(communityObject._id);
      return await user.save();
    });

    await Promise.all(updateUserPromises);

  // Delete the community
  await communityObject.deleteOne();

    return communityObject;
  } catch (error) {
    console.error("Error deleting community: ", error);
    throw error;
  }
}

export async function getCommunitiesCount () {
  try {
    connectToDB();
    return await Community.countDocuments();
  } catch (error) {
    console.error("Error getting communities count: ", error);
    throw error;
  }
}

export async function isMember(userId: string, communityId: string){
  try {
    connectToDB();
    const response = await axios.get(`https://api.clerk.com/v1/organizations/${communityId}/memberships`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
    });
    const members = response.data.data;
    const userIds = members.map((member:any) => member.public_user_data.user_id);
    const isMember = userIds.includes(userId);
    return isMember;
  } catch (error: any) {
    console.error("Error checking if user is member of community: ", error);
    throw error;
  }
}

export async function isCommunityAdmin(userId: string, communityId: string){
  try {
    connectToDB();
    const response = await axios.get(`https://api.clerk.com/v1/organizations/${communityId}/memberships`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
    });
    const members = response.data.data;
    const userRoles = members.map((member:any) => ({userId: member.public_user_data.user_id, role: member.role}));
    const userRole = userRoles.find((userRole:any) => userRole.userId === userId);
    const isAdmin = userRole?.role === "admin";
    console.log("isAdmin : ", isAdmin);
    return isAdmin;
  } catch (error: any) {
    console.error("Error checking if user is admin of community: ", error);
    throw error;
  }
}

