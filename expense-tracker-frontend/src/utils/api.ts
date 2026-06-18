import axios from "axios";

const BASE_URL = "https://expense-tracker-1-6m9p.onrender.com/api";

if (!BASE_URL) {
    console.error("base url configuration issue!")
}

export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})