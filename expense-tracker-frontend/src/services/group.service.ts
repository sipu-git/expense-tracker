import { CreateInvite, Group } from "../types/group.types";
import { api } from "../utils/api";

const subUrl = "/group";

export const groupApis ={
    createGroup:(data:any)=>api.post(`${subUrl}/create-group`,data),
    viewGroups:()=>api.get(`${subUrl}/view-groups`),
    viewGroup: (groupId:string)=>api.get(`${subUrl}/view-groupById/${groupId}`),
    updateGroup:(groupId:string,data:any)=>api.patch(`${subUrl}/update-group/${groupId}`,data),
    sendInvitation:(groupId:string,data:CreateInvite)=>api.post(`${subUrl}/send-invitation/${groupId}`,data),
    acceptInvitation:(token:string)=>api.post(`${subUrl}/accept-invitation/${token}`),
    declineInvitation:(groupId:string)=>api.post(`${subUrl}/decline-invitation/${groupId}`),
    viewInvitations:()=>api.get(`${subUrl}/view-group-invitations`),
    viewInvitation:(groupId:string)=>api.get(`${subUrl}/view-group-invitations/${groupId}`),
    searchMembers:()=>api.get(`${subUrl}/search-members`),
    // deleteGroup:(id:string)=>api.delete(`${subUrl}/delete-group/${id}`)
}