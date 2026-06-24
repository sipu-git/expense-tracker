import { api } from "../utils/api";

const subUrl = '/users'
export const UserApis = {
    createUser: (data: any) => api.post(`${subUrl}/register`, data),
    login: (data: any) => api.post(`${subUrl}/login`, data),
    signOut: () => api.post(`${subUrl}/logout`),
    getUser: () => api.get(`${subUrl}/profile`),
    getProfile: () => api.get(`${subUrl}/profile-picture`),
    modifyUser: (data:any) => api.patch(`${subUrl}/modify-profile`,data,{
        headers:{
            "Content-Type":"multipart/form-data"
        }
    }),
    deleteAccount:()=>api.delete(`${subUrl}/drop-profile`)
}