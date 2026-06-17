export const handleApiError = (error: any) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Something went wrong"
    );
}