import { api } from "@/utils/api";

const subUrl = "/accounts";

export const accountApis = {
  viewAccounts: () => api.get(subUrl),
  addAccount: (data: { name: string; description?: string }) => api.post(subUrl, data),
};
