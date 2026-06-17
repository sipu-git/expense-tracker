export type ExpenseFilter =
    | "day"
    | "month"
    | "year";

export const getExpenseDateRange = (
    filter: ExpenseFilter
) => {

    const today = new Date();

    let startDate: Date;
    let endDate: Date;

    switch (filter) {

        case "day":
            startDate = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );

            endDate = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() + 1
            );

            break;

        case "month":

            startDate = new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );

            endDate = new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                1
            );

            break;
        case "year":

            startDate = new Date(today.getFullYear(), 0, 1);

            endDate = new Date(today.getFullYear() + 1, 0, 1);
            break;
        default:
            throw new Error("Invalid filter");
    }

    return {
        startDate,
        endDate
    };
};