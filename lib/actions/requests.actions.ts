"use server";

import Request from "../models/request.model";
import { connectToDB } from "../mongoose"
import User from '../models/user.model';
import Community from '../models/community.model';
import axios from "axios";
import { revalidatePath } from "next/cache";

export async function createRequest({ userId, communityId, path }: {
    userId: string, communityId: string, path: string
}) {
    connectToDB();
    try {
        const communityObject = await Community.findOne({ id: communityId }).exec();

        const userObject = await User.findOne({ id: userId }).exec();

        const newRequest = new Request({
            user: userObject._id,
            community: communityObject._id,
        });
        const createdRequest = await newRequest.save();


        //Update community model
        if (communityObject) {
            const community = await Community.findById(communityObject._id);
            community.requests.push(createdRequest._id);
            await community.save();
        }
        revalidatePath(path);
        return createdRequest;
    } catch (error: any) {
        throw new Error(`Error creating request: ${error.message}`);
    }
}

export async function alreadyRequested( userId: string, communityId: string) {
    connectToDB();
    try {
        const userObject = await User.findOne({ id: userId }).exec();
        const communityObject = await Community.findOne({ id: communityId }).exec();
        const request = await Request.findOne({ user: userObject._id, community: communityObject._id, etat: "pending"}).exec();
        if (request) {
            return true;
        }
        return false;
    } catch (error: any) {
        throw new Error(`Error checking request: ${error.message}`);
    }
}

export async function requestAccepted( userId: string, communityId: string) {
    connectToDB();
    try {
        const userObject = await User.findOne({ id: userId }).exec();
        const communityObject = await Community.findOne({ id: communityId }).exec();
        const request = await Request.findOne({ user: userObject._id, community: communityObject._id, etat: "pending"}).exec();
        if (request) {
            return true;
        }
        return false;
    } catch (error: any) {
        throw new Error(`Error checking request: ${error.message}`);
    }
}

export async function getRequests(communityId:string) {
    connectToDB();
    try {
        const communityObject = await Community.findOne({ id: communityId }).exec();
        if (!communityObject) {
            throw new Error(`Community not found`);
        }
        const requests = await Request.find({ community: communityObject._id, etat: 'pending' }).populate('user').populate('community');
        return requests;
    } catch (error: any) {
        throw new Error(`Error getting requests: ${error.message}`);
    }
}

export async function acceptRequest(requestId: string, adminId: string, email: string, communityId: string, path: string) {
    connectToDB();
    try {
        console.log("requestId !!!!! " + requestId + "  adminId !!! " + adminId + "  email !!! " + email + "  communityId !!! " + communityId);
        const request = await Request.findById(requestId);
        if (!request) {
            throw new Error(`Request not found`);
        }
        const response = await axios.post(
            `https://api.clerk.com/v1/organizations/${communityId}/invitations`,
            {
              "email_address": `${email}`,
              "inviter_user_id": `${adminId}`,
              "role": "basic_member"
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json',
              }
            }
          );
          request.etat = "accepted";
          await request.save();
          revalidatePath(path);     
    }
    catch (error: any) {
        throw new Error(`Error accepting request: ${error.message}`);
    }

}

export async function rejectRequest(requestId:string, path: string) {
    connectToDB();
    try {
        const request = await Request.findById(requestId);
        if (!request) {
            throw new Error(`Request not found`);
        }
        request.etat = "rejected";
        await request.save();   
        revalidatePath(path);     
    }
    catch (error: any) {
        throw new Error(`Error rejecting request: ${error.message}`);
    }
}