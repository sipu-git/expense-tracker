import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

if (!BASE_URL) {
    console.error("base url configuration issue!")
}

export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})