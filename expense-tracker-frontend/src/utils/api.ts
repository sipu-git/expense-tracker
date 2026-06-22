import axios from "axios";
import { store } from "@/store";

// const BASE_URL = "http://localhost:3000/api";

export const api = axios.create({
    baseURL: "/api",
    // baseURL: BASE_URL,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const state = store.getState();
    const accountsState = state.accounts as any;

    const activeAccount = accountsState.accounts?.find(
        (a: any) => a.id === accountsState.activeAccountId
    );
console.log("All accounts:", JSON.stringify(accountsState.accounts?.map(
        (a: any) => ({ id: a.id, hasToken: !!a.token, tokenPreview: a.token?.slice(0, 20) })
    )));
    console.log("activeAccountId:", accountsState.activeAccountId);
    if (activeAccount?.token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>)["Authorization"] = `Bearer ${activeAccount.token}`;
    }

    // ← add these to bust the 304 cache
    config.headers["Cache-Control"] = "no-cache";
    config.headers["Pragma"] = "no-cache";

    return config;
});