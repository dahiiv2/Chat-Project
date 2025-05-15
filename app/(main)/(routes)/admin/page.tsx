/**
 * Admin Dashboard Page
 * 
 * Protected page for global administrators to manage users and monitor activity:
 * - View all users in the system
 * - Track message activity across servers
 * - Toggle user suspension status
 * - Monitor overall platform usage
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, AlertTriangle, Shield, User, MessageSquare, Server, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Message, DirectMessage } from "@prisma/client";

// Type definitions for our admin data
interface ProfileWithActivity {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  isAdmin: boolean;
  isSuspended: boolean;
  createdAt: string;
  messageCount: number;
  serverCount: number;
}

// Type for user messages in the message viewer modal
interface UserMessage {
  id: string;
  content: string;
  createdAt: string;
  channelName?: string;
  serverName?: string;
  recipientName?: string;
  type: 'channel' | 'direct';
}

/**
 * Admin Dashboard Component
 * Only accessible to users with isAdmin=true
 */
const AdminPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ProfileWithActivity[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ProfileWithActivity | null>(null);
  const [userMessages, setUserMessages] = useState<UserMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  // Load the admin data
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        // Fetch from our API endpoint we'll create next
        const response = await axios.get("/api/admin/users");
        setUsers(response.data);
        setIsAuthorized(true);
      } catch (error: any) {
        console.error(error);
        // Handle unauthorized access
        if (error?.response?.status === 401) {
          setIsAuthorized(false);
          setError("You don't have permission to access the admin area.");
        } else {
          setError("Something went wrong loading the admin dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  /**
   * Toggles a user's suspension status
   */
  const toggleSuspension = async (userId: string, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/admin/users/${userId}`, {
        isSuspended: !currentStatus
      });
      
      // Update local state after successful API call
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isSuspended: !currentStatus }
          : user
      ));
    } catch (error) {
      console.error("Failed to update user:", error);
      setError("Failed to update user status. Please try again.");
    }
  };
  
  /**
   * Fetches a user's messages and opens the message viewer modal
   */
  const viewUserMessages = async (user: ProfileWithActivity) => {
    try {
      setSelectedUser(user);
      setMessagesLoading(true);
      setMessageModalOpen(true);
      
      // This would be an API endpoint you'd need to create
      const response = await axios.get(`/api/admin/users/${user.id}/messages`);
      setUserMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch user messages:", error);
      setUserMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
        <p className="text-base text-zinc-400 animate-pulse">
          <span className="font-semibold text-amber-500/90">Loading admin dashboard...</span>
        </p>
      </div>
    );
  }

  // Show unauthorized state
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <AlertTriangle className="h-16 w-16 text-rose-500" />
        <h1 className="text-2xl font-bold text-center">Access Denied</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-center max-w-md">
          {error || "You don't have permission to access this area."}
        </p>
        <button 
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-white transition"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with gold accent */}
      <div className="relative mb-8">
        <div className="flex items-center gap-4">
          <Shield className="h-8 w-8 text-amber-500" />
          <h1 className="text-3xl font-bold text-zinc-700 dark:text-white relative inline-flex">
            <span className="relative z-10">Admin Dashboard</span>
            <span className="absolute inset-0 bg-white/20 dark:bg-white/10 blur-md rounded-lg -z-0"></span>
          </h1>
        </div>
        {/* Gold gradient line */}
        <div className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 shadow-[0_0_15px_0_rgba(251,191,36,0.7)] dark:shadow-[0_0_10px_0_rgba(217,119,6,0.7)]"></div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 rounded-md p-4 mb-6">
          <p className="text-rose-500">{error}</p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard 
          icon={<User className="h-5 w-5" />}
          title="Total Users"
          value={users.length.toString()}
          color="amber"
        />
        <StatCard 
          icon={<MessageSquare className="h-5 w-5" />}
          title="Total Messages"
          value={users.reduce((acc, user) => acc + user.messageCount, 0).toString()}
          color="emerald"
        />
        <StatCard 
          icon={<Server className="h-5 w-5" />}
          title="Total Servers"
          value={users.reduce((acc, user) => acc + user.serverCount, 0).toString()}
          color="blue"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-zinc-800/50 rounded-md shadow-sm overflow-hidden border border-zinc-200 dark:border-zinc-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-100 dark:bg-zinc-900/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Messages</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Servers</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img 
                          className="h-10 w-10 rounded-full" 
                          src={user.imageUrl} 
                          alt={user.name} 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-zinc-900 dark:text-white flex items-center gap-1">
                          {user.name}
                          {user.isAdmin && (
                            <span title="Admin" className="inline-flex items-center justify-center ml-1.5">
                              <Shield className="h-3.5 w-3.5 text-amber-500" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    <div className="group relative cursor-help">
                      <span className="underline decoration-dotted">hidden</span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    <button 
                      onClick={() => viewUserMessages(user)}
                      className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition"
                    >
                      {user.messageCount}
                      <Eye className="h-3.5 w-3.5 ml-1 opacity-70" />
                    </button>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    {user.serverCount}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      user.isSuspended
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                    )}>
                      {user.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => toggleSuspension(user.id, user.isSuspended)}
                      className={cn(
                        "px-3 py-1 rounded text-white text-xs transition-colors",
                        user.isSuspended
                          ? "bg-emerald-500 hover:bg-emerald-600"
                          : "bg-rose-500 hover:bg-rose-600"
                      )}
                    >
                      {user.isSuspended ? "Activate" : "Suspend"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Messages Modal */}
      <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                {selectedUser && (
                  <img src={selectedUser.imageUrl} alt={selectedUser.name} className="h-full w-full object-cover" />
                )}
              </div>
              <span className="text-lg">
                Messages from {selectedUser?.name}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {messagesLoading ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                <p className="text-zinc-500 dark:text-zinc-400">Loading messages...</p>
              </div>
            ) : userMessages.length === 0 ? (
              <div className="text-center py-8 px-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-md">
                <p className="text-zinc-500 dark:text-zinc-400">No messages found for this user</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userMessages.map((message) => (
                  <div key={message.id} className="p-4 bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">
                          {message.type === 'channel' ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              #{message.channelName} in {message.serverName}
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400">
                              DM to {message.recipientName}
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
                      {message.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper component for stats cards
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: "amber" | "emerald" | "blue" | "rose";
}

const StatCard = ({ icon, title, value, color }: StatCardProps) => {
  const colorClasses = {
    amber: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30 text-blue-600 dark:text-blue-400",
    rose: "bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800/30 text-rose-600 dark:text-rose-400",
  };

  return (
    <div className={cn(
      "rounded-lg border p-6 flex items-center justify-between",
      colorClasses[color]
    )}>
      <div>
        <p className="text-sm font-medium opacity-80">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className={cn(
        "p-3 rounded-full",
        `bg-${color}-100 dark:bg-${color}-900/40`
      )}>
        {icon}
      </div>
    </div>
  );
};

export default AdminPage;
