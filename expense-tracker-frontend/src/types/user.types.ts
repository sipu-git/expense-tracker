export interface User {
    id:string;
    full_name: string;
    email: string;
    phone: string;
    password: string;
    created_at: string;
}

export interface UserState {
    user: User | null;
    loading: boolean;
    hydrating: boolean;
    error: string | null;
    success: boolean;
}