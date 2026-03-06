export function validateAdmin(user: any) {
    if (user.role !== "admin") {
        throw new Error("Forbidden");
    }
}