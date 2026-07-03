import axios from "axios";
import { store } from "@/store";

export const api = axios.create({
     baseURL: "/api",
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const state = store.getState();
    const accountsState = state.accounts as any;

    const activeAccount = accountsState.accounts?.find(
        (a: any) => a.id === accountsState.activeAccountId
    );

    config.headers = config.headers ?? {};

    // Don't overwrite if Authorization was already manually set (e.g. password reset token)
    const alreadyHasAuth = !!(config.headers as Record<string, string>)["Authorization"];

    if (!alreadyHasAuth && activeAccount?.token) {
        (config.headers as Record<string, string>)["Authorization"] = `Bearer ${activeAccount.token}`;
    }

    config.headers["Cache-Control"] = "no-cache";
    config.headers["Pragma"] = "no-cache";

    return config;
});
