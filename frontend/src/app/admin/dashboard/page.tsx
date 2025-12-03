"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Download, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [logs, setLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    staffId: '',
    category: '',
    eventType: '',
    status: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchData = async () => {
    try {
      const [logsRes, usersRes] = await Promise.all([
        fetch('/api/hour-logs', { headers: getAuthHeaders() }),
        fetch('/api/users', { headers: getAuthHeaders() }),
      ]);

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users.filter((u: any) => u.role === 'staff'));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (filters.startDate) {
      filtered = filtered.filter(log => log.date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(log => log.date <= filters.endDate);
    }
    if (filters.staffId) {
      filtered = filtered.filter(log => log.userId === parseInt(filters.staffId));
    }
    if (filters.category) {
      filtered = filtered.filter(log => log.serviceCategory === filters.category);
    }
    if (filters.eventType) {
      filtered = filtered.filter(log => log.eventType === filters.eventType);
    }
    if (filters.status) {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    setFilteredLogs(filtered);
  };

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const handleApprove = async (logId: number) => {
    try {
      const response = await fetch(`/api/hour-logs/${logId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'approved' }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (logId: number) => {
    try {
      const response = await fetch(`/api/hour-logs/${logId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Staff', 'Service', 'Event Type', 'Client', 'Venue', 'Start Time', 'End Time', 'Hours', 'Status', 'Notes'];
    const rows = filteredLogs.map(log => [
      log.date,
      log.user?.name || 'Unknown',
      log.serviceCategory,
      log.eventType,
      log.clientName,
      log.venue,
      log.startTime,
      log.endTime,
      log.totalHours,
      log.status,
      log.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hour-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'approved') {
      return <Badge className="bg-green-600 text-white border-transparent">{status}</Badge>;
    }
    if (status === 'pending') {
      return <Badge className="bg-yellow-500 text-black border-transparent">{status}</Badge>;
    }
    if (status === 'rejected') {
      return <Badge variant="destructive">{status}</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

  const pendingCount = logs.filter(log => log.status === 'pending').length;
  const totalHours = filteredLogs.reduce((sum, log) => sum + log.totalHours, 0);
  const approvedHours = filteredLogs
    .filter(log => log.status === 'approved')
    .reduce((sum, log) => sum + log.totalHours, 0);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Approvals</CardDescription>
              <CardTitle className="text-3xl">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Staff</CardDescription>
              <CardTitle className="text-3xl">{users.filter(u => u.status === 'active').length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Hours</CardDescription>
              <CardTitle className="text-3xl">{totalHours.toFixed(1)}h</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Approved Hours</CardDescription>
              <CardTitle className="text-3xl">{approvedHours.toFixed(1)}h</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hour Logs Management</CardTitle>
                <CardDescription>Review and approve staff hour submissions</CardDescription>
              </div>
              <Button onClick={exportToCSV} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff">Staff Member</Label>
                <Select
                  value={filters.staffId}
                  onValueChange={(value) => setFilters({ ...filters, staffId: value })}
                >
                  <SelectTrigger id="staff">
                    <SelectValue placeholder="All staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters({ ...filters, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="DJ">DJ</SelectItem>
                    <SelectItem value="Videographer">Videographer</SelectItem>
                    <SelectItem value="Photographer">Photographer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Select
                  value={filters.eventType}
                  onValueChange={(value) => setFilters({ ...filters, eventType: value })}
                >
                  <SelectTrigger id="eventType">
                    <SelectValue placeholder="All events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="Wedding">Wedding</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="Private Party">Private Party</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground">
                        No hour logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(log.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">{log.user?.name || 'Unknown'}</TableCell>
                        <TableCell>{log.serviceCategory}</TableCell>
                        <TableCell>{log.eventType}</TableCell>
                        <TableCell>{log.clientName}</TableCell>
                        <TableCell>{log.venue}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {log.startTime} - {log.endTime}
                        </TableCell>
                        <TableCell className="font-medium">{log.totalHours}h</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(log)}
                              className="gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              Details
                            </Button>
                            {log.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprove(log.id)}
                                  className="gap-1"
                                >
                                  <Check className="h-3 w-3" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(log.id)}
                                  className="gap-1"
                                >
                                  <X className="h-3 w-3" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail View Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Hour Log Details</DialogTitle>
            <DialogDescription>Complete information for this submission</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{new Date(selectedLog.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Staff Member</Label>
                  <p className="font-medium">{selectedLog.user?.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{selectedLog.user?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Service Category</Label>
                  <p className="font-medium">{selectedLog.serviceCategory}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Event Type</Label>
                  <p className="font-medium">{selectedLog.eventType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Hours</Label>
                  <p className="font-medium text-lg">{selectedLog.totalHours}h</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Client Name</Label>
                <p className="font-medium">{selectedLog.clientName}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Venue</Label>
                <p className="font-medium">{selectedLog.venue}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Start Time</Label>
                  <p className="font-medium">{selectedLog.startTime}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">End Time</Label>
                  <p className="font-medium">{selectedLog.endTime}</p>
                </div>
              </div>

              {selectedLog.serviceCategory === 'DJ' && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label className="text-muted-foreground">Equipment Pickup Time</Label>
                    <p className="font-medium">{selectedLog.equipmentPickupTime || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Mileage to Venue</Label>
                    <p className="font-medium">{selectedLog.mileage ? `${selectedLog.mileage} miles` : '-'}</p>
                  </div>
                </div>
              )}

              {selectedLog.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-1 rounded-md border bg-muted/50 p-3 text-sm">
                    {selectedLog.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground">Submitted</Label>
                  <p className="text-sm">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p className="text-sm">{new Date(selectedLog.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedLog.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => {
                      handleApprove(selectedLog.id);
                      setDetailDialogOpen(false);
                    }}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    onClick={() => {
                      handleReject(selectedLog.id);
                      setDetailDialogOpen(false);
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}