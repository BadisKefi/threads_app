"use server";

import { Axios } from './../../node_modules/axios/index.d';
import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";

import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";
import { usePathname } from 'next/navigation';

const axios = require('axios');




interface Params {
  userId: string;
  username: string;
  name: string;
  email: string;
  bio: string;
  image: string;
  path: string;
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();
    return await User.findOne({ id: userId }).populate({
      path: "communities",
      model: Community,
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function updateUser({
  userId,
  bio,
  name,
  email,
  path,
  username,
  image,
}: Params): Promise<void> {
  try {
    connectToDB();
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        email,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUserThreads(userId: string) {
  try {
    connectToDB();
    // Find all threads authored by the user with the given userId
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "community",
          model: Community,
          select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id", // Select the "name" and "_id" fields from the "User" model
          },
        },
      ],
    });
    return threads;
  } catch (error) {
    console.error("Error fetching user threads:", error);
    throw error;
  }
}

// Almost similar to Thead (search + pagination) and Community (search + pagination)
export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();
    // Calculate the number of users to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter users.
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId }, // Exclude the current user from the results.
    };

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched users based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    // Count the total number of users that match the search criteria (without pagination).
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    // Check if there are more users beyond the current page.
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();
    // Find all threads created by the user
    const userThreads = await Thread.find({ author: userId });

    // Collect all the child thread ids (replies) from the 'children' field of each user thread
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    // Find and return the child threads (replies) excluding the ones created by the same user
    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId }, // Exclude threads authored by the same user
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;
  } catch (error) {
    console.error("Error fetching replies: ", error);
    throw error;
  }
}

export async function banUser(userId: string, path: string){
  connectToDB();
  try {
    const user = await User.findOne({id: userId}).exec();
    if(!user){
      throw new Error(`User not found`);
    }
    const response  = await axios.post(`https://api.clerk.com/v1/users/${userId}/ban`, {}, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': "application/json",
      }
    });
    await user.updateOne({etat: "banned"});
    revalidatePath(path);
    return response;
  } catch (error: any) {
    throw new Error(`Failed to ban user: ${error.message}`);
  }
}

export async function unbanUser(userId: string, path: string){
  connectToDB();
  try {
    const user = await User.findOne({id: userId}).exec();
    if(!user){
      throw new Error(`User not found`);
    }
    const response  = await axios.post(`https://api.clerk.com/v1/users/${userId}/unban`, {}, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': "application/json",
      }
    });
    await user.updateOne({etat: "unbanned"});
    revalidatePath(path);
    return response;
  } catch (error: any) {
    throw new Error(`Failed to unban user: ${error.message}`);
  }
}

export async function deleteAccount(userId: string){
  connectToDB();
  try {
    const user = await User.findOne({id: userId}).exec();
    if(!user){
      throw new Error(`User not found`);
    }
    const response  = await axios.delete(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': "application/json",
      }
    });
    await user.deleteOne();
    await Thread.deleteMany({author: user._id});
    return response;
  } catch (error: any) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}

export async function activateAccount(userId: string) {
  connectToDB();
  try {
    const user  = await User.findOneAndUpdate({id: userId}, {status: "active"});
    if(!user){
      throw new Error(`User not found`);
    }
  } catch (error: any) {
    throw new Error(`Failed to activate user: ${error.message}`);
  }
}

export async function deasctivateAccount(userId: string) {
  connectToDB();
  try {
    const user  = await User.findOneAndUpdate({id: userId}, {status: "inactive"});
    if(!user){
      throw new Error(`User not found`);
    }
  } catch (error: any) {
    throw new Error(`Failed to deactivate user: ${error.message}`);
  }
}

export async function getUsersCountByMonth(month: number) {
  try {
    await connectToDB();

    // Validate the month parameter
    if (isNaN(month) || month < 1 || month > 12) {
      throw new Error('Invalid month parameter');
    }

    // Calculate the start and end dates for the specified month
    const startOfMonth = new Date(Date.UTC(new Date().getFullYear(), month - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(new Date().getFullYear(), month, 1, 0, 0, 0, 0));

    // Count the number of users created in the specified month
    const userCount = await User.countDocuments({
      createdAt: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    });

    return userCount;
  } catch (error) {
    // Handle any errors
    console.error('Error fetching user count by month:', error);
    throw error;
  }
}

export async function getBannedUsersCount() {
  try {
    await connectToDB();

    // Count the number of users created in the specified month
    const userCount = await User.countDocuments({
      etat: "banned",
    });

    return userCount;
  } catch (error) {
    // Handle any errors
    console.error('Error fetching user count by month:', error);
    throw error;
  }
}

export async function getDesactivatedUsersCount() {
  try {
    await connectToDB();

    // Count the number of users created in the specified month
    const userCount = await User.countDocuments({
      status: "inactive",
    });

    return userCount;
  } catch (error) {
    // Handle any errors
    console.error('Error fetching user count by month:', error);
    throw error;
  }
}

export async function getUsersCount () {
  try {
    await connectToDB();

    // Count the number of users created in the specified month
    const userCount = await User.countDocuments();

    return userCount;
  } catch (error) {
    // Handle any errors
    console.error('Error fetching user count by month:', error);
    throw error;
  }
}

export async function getUserEmail(userId: string) {
  try {
    const user = await axios.get(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': "application/json",
      }
    });
    const email = await axios.get(`https://api.clerk.com/v1/email_addresses/${user.data.primary_email_address_id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': "application/json",
      }
    });
    return email.data;
  } catch (error: any) {
    throw new Error(`Failed to fetch user email: ${error.message}`);
  }
}

export async function getBannedUsers () {
  try {
    await connectToDB();

    const users = await User.find({etat: "banned"});

    return users;
  } catch (error) {
    // Handle any errors
    console.error('Error fetching user count by month:', error);
    throw error;
  }
}

