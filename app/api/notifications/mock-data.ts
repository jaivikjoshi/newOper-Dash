import { Notification } from "@/app/utils/types";

export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Team Member Added",
    text: "John Doe has been added to the Marketing team.",
    by: "Admin",
    date: "2023-07-21",
    isRead: false,
  },
  {
    id: "2",
    title: "Upcoming Maintenance",
    text: "The system will be down for maintenance on Saturday from 2-4am.",
    by: "System",
    date: "2023-07-20",
    isRead: false,
  },
  {
    id: "3",
    title: "New Feature Released",
    text: "Check out our new dashboard with improved analytics!",
    by: "Product Team",
    date: "2023-07-19",
    isRead: true,
  },
  {
    id: "4",
    title: "Your Report is Ready",
    text: "The monthly sales report has been generated and is ready for review.",
    by: "Reports Bot",
    date: "2023-07-18",
    isRead: true,
  },
  {
    id: "5",
    title: "Meeting Reminder",
    text: "Don't forget about the team meeting tomorrow at 10am.",
    by: "Calendar",
    date: "2023-07-17",
    isRead: true,
  }
]; 