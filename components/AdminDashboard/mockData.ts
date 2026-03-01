export type TeamStatus = "Approved" | "Pending" | "Rejected";
export type AccessStatus = "Active" | "Blocked";
export type GameStatus = "Not Started" | "Running" | "Ended";

export interface Team {
  id: string;
  name: string;
  leaderEmail: string;
  size: number;
  approval: TeamStatus;
  access: AccessStatus;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Sub-admin";
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  timestamp: string;
}

export const teams: Team[] = [
  { id: "1", name: "CodeStorm", leaderEmail: "alice@college.edu", size: 3, approval: "Approved", access: "Active", createdAt: "2026-02-28 14:30" },
  { id: "2", name: "ByteForce", leaderEmail: "bob@college.edu", size: 2, approval: "Approved", access: "Active", createdAt: "2026-02-28 15:10" },
  { id: "3", name: "NullPointers", leaderEmail: "carol@college.edu", size: 3, approval: "Pending", access: "Active", createdAt: "2026-02-28 16:00" },
  { id: "4", name: "DeepLogic", leaderEmail: "dan@college.edu", size: 2, approval: "Rejected", access: "Blocked", createdAt: "2026-02-28 16:45" },
  { id: "5", name: "HexHunters", leaderEmail: "eve@college.edu", size: 3, approval: "Approved", access: "Active", createdAt: "2026-02-28 17:20" },
  { id: "6", name: "CipherSquad", leaderEmail: "frank@college.edu", size: 2, approval: "Pending", access: "Active", createdAt: "2026-03-01 09:00" },
  { id: "7", name: "StackOverflow", leaderEmail: "grace@college.edu", size: 3, approval: "Approved", access: "Blocked", createdAt: "2026-03-01 09:30" },
  { id: "8", name: "Recursion", leaderEmail: "hank@college.edu", size: 2, approval: "Approved", access: "Active", createdAt: "2026-03-01 10:15" },
];

export const adminUsers: AdminUser[] = [
  { id: "1", name: "Prof. Kumar", email: "kumar@college.edu", role: "Admin" },
  { id: "2", name: "Dr. Sharma", email: "sharma@college.edu", role: "Sub-admin" },
  { id: "3", name: "Ms. Patel", email: "patel@college.edu", role: "Sub-admin" },
];

export const eventSettings = {
  eventName: "AI × IoT Code Arena 2026",
  eventDescription: "A competitive technical event with four rounds testing coding, logic, and speed.",
  minTeamSize: 2,
  maxTeamSize: 3,
  registrationOpen: true,
};
