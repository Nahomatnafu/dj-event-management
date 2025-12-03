"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export default function LogHoursPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    date: '',
    serviceCategory: '',
    eventType: '',
    clientName: '',
    venue: '',
    startTime: '',
    endTime: '',
    notes: '',
    // DJ-specific fields
    equipmentPickupTime: '',
    mileage: '',
  });
  
  const [totalHours, setTotalHours] = useState(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'staff')) {
      router.push('/');
    } else if (user) {
      fetchRecentLogs();
      if (user.serviceCategory) {
        setFormData(prev => ({ ...prev, serviceCategory: user.serviceCategory || '' }));
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    calculateHours();
  }, [formData.startTime, formData.endTime]);

  const calculateHours = () => {
    if (formData.startTime && formData.endTime) {
      const [startHour, startMin] = formData.startTime.split(':').map(Number);
      const [endHour, endMin] = formData.endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      let diffMinutes = endMinutes - startMinutes;
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      
      const hours = diffMinutes / 60;
      setTotalHours(Math.round(hours * 10) / 10);
    } else {
      setTotalHours(0);
    }
  };

  const fetchRecentLogs = async () => {
    try {
      const response = await fetch('/api/hour-logs', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setRecentLogs(data.logs.slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/hour-logs', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...formData,
          totalHours,
          mileage: formData.mileage ? parseFloat(formData.mileage) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit hours');
      }

      setSuccess('Hours logged successfully!');
      setFormData({
        date: '',
        serviceCategory: user?.serviceCategory || '',
        eventType: '',
        clientName: '',
        venue: '',
        startTime: '',
        endTime: '',
        notes: '',
        equipmentPickupTime: '',
        mileage: '',
      });
      setTotalHours(0);
      fetchRecentLogs();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit hours');
    } finally {
      setLoading(false);
    }
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

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Log Your Hours</CardTitle>
              <CardDescription>Submit your event hours for approval</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceCategory">Service Category</Label>
                  <Select
                    value={formData.serviceCategory}
                    onValueChange={(value) => setFormData({ ...formData, serviceCategory: value })}
                    disabled={loading}
                  >
                    <SelectTrigger id="serviceCategory">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DJ">DJ</SelectItem>
                      <SelectItem value="Videographer">Videographer</SelectItem>
                      <SelectItem value="Photographer">Photographer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select
                    value={formData.eventType}
                    onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                    disabled={loading}
                  >
                    <SelectTrigger id="eventType">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wedding">Wedding</SelectItem>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                      <SelectItem value="Private Party">Private Party</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    placeholder="e.g., Smith Wedding"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    placeholder="e.g., Grand Ballroom"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="rounded-md bg-muted p-4">
                  <div className="text-sm font-medium">Total Hours: {totalHours}</div>
                </div>

                {formData.serviceCategory === 'DJ' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="equipmentPickupTime">Equipment Pickup Time</Label>
                      <Input
                        id="equipmentPickupTime"
                        type="time"
                        value={formData.equipmentPickupTime}
                        onChange={(e) => setFormData({ ...formData, equipmentPickupTime: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mileage">Mileage to Venue</Label>
                      <Input
                        id="mileage"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 25.5"
                        value={formData.mileage}
                        onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about the event..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    disabled={loading}
                    rows={3}
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
                    {success}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Hours'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Your last 10 hour log entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No submissions yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">{log.clientName}</TableCell>
                          <TableCell>{log.totalHours}h</TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}