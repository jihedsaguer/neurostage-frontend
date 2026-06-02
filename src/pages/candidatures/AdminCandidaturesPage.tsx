import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription  } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFetchSubjectsQuery } from '@/redux/features/subjects/subjectsApi';
import { useUpdateCandidatureStatusMutation, useLazyListSubjectCandidaturesQuery } from '@/redux/features/canditatures/canditaturesApi';
import CandidatureStatusBadge from '@/components/candidatures/CandidatureStatusBadge';
import CandidatureStatusActions from '@/components/candidatures/CandidatureStatusActions';
import type { CanditatureStatus, CanditatureResponse } from '@/types/canditatures';
import { Search, ArrowLeft, Filter, Download, Eye, CheckCircle2,XCircle } from 'lucide-react';

const AdminCandidaturesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const { data: subjectsResponse, isLoading: isSubjectsLoading } = useFetchSubjectsQuery({});
  const subjects = subjectsResponse?.data ?? [];

  const [allCandidatures, setAllCandidatures] = useState<CanditatureResponse[]>([]);
  const [isCandidaturesLoading, setIsCandidaturesLoading] = useState(false);

  const [updateCandidatureStatus, { isLoading: isUpdating }] = useUpdateCandidatureStatusMutation();
  const [triggerListCandidatures] = useLazyListSubjectCandidaturesQuery();

  // Fetch candidatures for all subjects when subjects change
  useEffect(() => {
    if (subjects.length === 0) {
      setAllCandidatures([]);
      return;
    }

    setIsCandidaturesLoading(true);
    const fetchAllCandidatures = async () => {
      try {
        const promises = subjects.map(async (subject) => {
          const result = await triggerListCandidatures(subject.id).unwrap();
          return result || [];
        });

        const results = await Promise.all(promises);
        const combined = results.flat();
        setAllCandidatures(combined);
      } catch (error) {
        console.error('Error fetching candidatures:', error);
        setAllCandidatures([]);
      } finally {
        setIsCandidaturesLoading(false);
      }
    };

    fetchAllCandidatures();
  }, [subjects, triggerListCandidatures]);

  const isLoading = isSubjectsLoading || isCandidaturesLoading;

  const filteredCandidatures = useMemo(() => {
    let filtered = allCandidatures;

    // Filter by search term
    if (searchTerm.trim()) {
      const normalizedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        item.student.firstName.toLowerCase().includes(normalizedSearch) ||
        item.student.lastName.toLowerCase().includes(normalizedSearch) ||
        item.student.email.toLowerCase().includes(normalizedSearch) ||
        item.subject.title.toLowerCase().includes(normalizedSearch) ||
        item.motivation.toLowerCase().includes(normalizedSearch)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Filter by subject
    if (subjectFilter !== 'all') {
      filtered = filtered.filter((item) => item.subject.id === subjectFilter);
    }

    return filtered;
  }, [allCandidatures, searchTerm, statusFilter, subjectFilter]);

  const stats = useMemo(() => {
    const total = allCandidatures.length;
    const pending = allCandidatures.filter((item) => item.status === 'pending').length;
    const accepted = allCandidatures.filter((item) => item.status === 'accepted').length;
    const rejected = allCandidatures.filter((item) => item.status === 'rejected').length;
    const shortlisted = allCandidatures.filter((item) => item.status === 'shortlisted').length;
    return { total, pending, accepted, rejected, shortlisted };
  }, [allCandidatures]);

  const handleStatusChange = async (id: string, status: CanditatureStatus) => {
    try {
      await updateCandidatureStatus({ id, status }).unwrap();
      // Refetch all candidatures
      if (subjects.length > 0) {
        setIsCandidaturesLoading(true);
        const promises = subjects.map(async (subject) => {
          const result = await triggerListCandidatures(subject.id).unwrap();
          return result || [];
        });
        const results = await Promise.all(promises);
        const combined = results.flat();
        setAllCandidatures(combined);
        setIsCandidaturesLoading(false);
      }
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  return (
    <DashboardLayout title="Candidatures Management" subtitle="Comprehensive view of all student applications across subjects" brandName="Admin Portal">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Admin Panel</p>
            <h1 className="text-3xl font-semibold text-slate-900">All Candidatures</h1>
            <p className="mt-1 text-sm text-slate-500">Manage and review all student applications in one professional dashboard.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to dashboard
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Applications</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700">Pending</p>
                  <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Search className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Shortlisted</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.shortlisted}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Filter className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Accepted</p>
                  <p className="text-2xl font-bold text-green-800">{stats.accepted}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700">Rejected</p>
                  <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Filters & Search</CardTitle>
            <CardDescription>Filter candidatures by status, subject, or search for specific applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by student name, email, or subject..."
                  className="pl-10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
              >
                <option value="all">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.title}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Applications Overview</CardTitle>
                <CardDescription>
                  {filteredCandidatures.length} of {stats.total} applications
                  {searchTerm && ` matching "${searchTerm}"`}
                  {statusFilter !== 'all' && ` with status "${statusFilter}"`}
                  {subjectFilter !== 'all' && ` for selected subject`}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (subjects.length > 0) {
                    setIsCandidaturesLoading(true);
                    try {
                      const promises = subjects.map(async (subject) => {
                        const result = await triggerListCandidatures(subject.id).unwrap();
                        return result || [];
                      });
                      const results = await Promise.all(promises);
                      const combined = results.flat();
                      setAllCandidatures(combined);
                    } catch (error) {
                      console.error('Error refreshing data:', error);
                    } finally {
                      setIsCandidaturesLoading(false);
                    }
                  }
                }}
                disabled={isLoading}
              >
                Refresh Data
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
                  <span className="text-sm text-slate-500">Loading applications...</span>
                </div>
              </div>
            ) : filteredCandidatures.length === 0 ? (
              <div className="p-12 text-center">
                <Eye className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No applications found</h3>
                <p className="text-slate-500">
                  {searchTerm || statusFilter !== 'all' || subjectFilter !== 'all'
                    ? 'Try adjusting your filters or search terms.'
                    : 'There are no applications yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Motivation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Applied Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredCandidatures.map((candidature) => (
                      <tr key={candidature.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-slate-700">
                                  {candidature.student.firstName[0]}{candidature.student.lastName[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">
                                {candidature.student.firstName} {candidature.student.lastName}
                              </div>
                              <div className="text-sm text-slate-500">{candidature.student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 font-medium">{candidature.subject.title}</div>
                          <div className="text-sm text-slate-500">{candidature.subject.level || 'No level'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-700 max-w-xs truncate" title={candidature.motivation}>
                            {candidature.motivation}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <CandidatureStatusBadge status={candidature.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(candidature.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <CandidatureStatusActions
                              currentStatus={candidature.status}
                              loading={isUpdating}
                              onChange={(status) => handleStatusChange(candidature.id, status)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/subjects/${candidature.subject.id}`)}
                              className="text-slate-600 hover:text-slate-900"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminCandidaturesPage;
