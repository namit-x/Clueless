export const mockTeam = {
  name: "CodeStorm",
  status: "Active" as "Active" | "Eliminated" | "Completed",
  rank: 4,
  members: [
    { name: "Arjun Mehta", role: "Leader", email: "arjun@college.edu", department: "CSE" },
    { name: "Priya Sharma", role: "Member", email: "priya@college.edu", department: "IT" },
    { name: "Rohan Das", role: "Member", email: "rohan@college.edu", department: "ECE" },
  ],
};

export const mockEvent = {
  currentRound: 2,
  roundName: "Digit Manipulation",
  roundStatus: "Live" as "Waiting" | "Live" | "Locked" | "Completed",
  qualificationMessage: "Top 10 teams advance to next round",
};

export const mockPerformance = {
  roundsAttempted: 2,
  roundsCleared: 2,
  fastestTime: "01:42",
  averageTime: "02:08",
  rounds: [
    { name: "Treasure Hunt", status: "Completed" as const, time: "02:34", attempts: 3, qualified: true },
    { name: "Digit Manipulation", status: "Completed" as const, time: "01:42", attempts: 2, qualified: true },
    { name: "Jumbled ASCII", status: "Not Attempted" as const, time: "—", attempts: 0, qualified: false },
    { name: "Blind Code", status: "Not Attempted" as const, time: "—", attempts: 0, qualified: false },
  ],
};

export const mockRankHistory = [
  { round: "Round 1", rank: 6, movement: null },
  { round: "Round 2", rank: 4, movement: 2 },
];

export const mockAnnouncements = [
  { id: 1, title: "Round 2 Starts at 4:00 PM", message: "Make sure all team members are present. Late entries will not be allowed.", timestamp: "Today, 3:45 PM", isNew: true },
  { id: 2, title: "Final Instructions Released", message: "Read the updated rules document before Round 2 begins. Key changes in submission format.", timestamp: "Today, 2:30 PM", isNew: true },
  { id: 3, title: "Round 1 Results Published", message: "Congratulations to all qualifying teams! Check your rank in the Rank History tab.", timestamp: "Today, 1:00 PM", isNew: false },
  { id: 4, title: "Welcome to Code Arena 2026", message: "The event has officially begun. Good luck to all participants!", timestamp: "Today, 10:00 AM", isNew: false },
];
