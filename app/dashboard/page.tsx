"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Users, 
  BarChart2, 
  Clock,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "../utils/UserContext";

export default function Dashboard() {
  const { userProfile, announcements, loading } = useUser();
  const [stats, setStats] = useState({
    activeAnnouncements: 0,
    peopleReached: 0,
    engagementRate: "0%",
    upcomingAnnouncements: 0
  });

  useEffect(() => {
    if (!loading && announcements) {
      // Calculate stats based on actual announcements
      const active = announcements.filter(a => a.isActive).length;
      const upcoming = announcements.filter(a => a.scheduledFor && new Date(a.scheduledFor) > new Date()).length;
      
      // For demo purposes, calculate some engagement metrics
      const peopleReached = active * 128; // Simulate 128 people reached per active announcement
      const engagementRate = active > 0 ? Math.min(85, Math.round(Math.random() * 30 + 55)) + "%" : "0%";
      
      setStats({
        activeAnnouncements: active,
        peopleReached,
        engagementRate,
        upcomingAnnouncements: upcoming
      });
    }
  }, [loading, announcements]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-full">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {userProfile?.name || 'User'}</h1>
        <p className="text-gray-600">Here's what's happening with your announcements today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Announcements</p>
              <h3 className="text-3xl font-bold mt-2">{stats.activeAnnouncements}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/announcements" className="text-sm text-blue-600 flex items-center">
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">People Reached</p>
              <h3 className="text-3xl font-bold mt-2">{stats.peopleReached}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/organizations/members" className="text-sm text-green-600 flex items-center">
              View members <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Engagement Rate</p>
              <h3 className="text-3xl font-bold mt-2">{stats.engagementRate}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <BarChart2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Based on active announcements</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Upcoming</p>
              <h3 className="text-3xl font-bold mt-2">{stats.upcomingAnnouncements}</h3>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/announcements" className="text-sm text-amber-600 flex items-center">
              View scheduled <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Announcements */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Announcements</h2>
        {announcements && announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.slice(0, 3).map(announcement => (
              <Card key={announcement.id} className="p-4">
                <div>
                  <h3 className="font-medium">{announcement.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      announcement.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {announcement.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {announcement.createdAt && new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
            <div className="text-center mt-4">
              <Button asChild variant="outline">
                <Link href="/dashboard/announcements">View All Announcements</Link>
              </Button>
            </div>
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-500 mb-4">No announcements yet</p>
            <Button asChild>
              <Link href="/dashboard/announcements">Create Your First Announcement</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
