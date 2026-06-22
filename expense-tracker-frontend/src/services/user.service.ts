import { api } from "../utils/api";

const subUrl = '/users'
export const UserApis = {
    createUser: (data: any) => api.post(`${subUrl}/register`, data),
    login: (data: any) => api.post(`${subUrl}/login`, data),
    signOut: () => api.post(`${subUrl}/logout`),
    getUser: () => api.get(`${subUrl}/profile`),
    modifyUser: (data:any) => api.patch(`${subUrl}/modify-profile`,data),
    deleteAccount:()=>api.delete(`${subUrl}/drop-profile`)
}