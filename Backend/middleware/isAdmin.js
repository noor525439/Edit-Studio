import { authorizeRole } from "./authorizeRole.js";

export const isAdmin = authorizeRole("admin");

export default isAdmin;
