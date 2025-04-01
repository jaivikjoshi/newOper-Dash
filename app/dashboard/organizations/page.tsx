"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Building, 
  MapPin, 
  Briefcase, 
  Search, 
  Edit, 
  Trash2, 
  Plus,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  Building2,
  User,
  Star,
  BookOpen,
  Download,
  ArrowUp,
  ArrowUpRight
} from "lucide-react";
import { useOrganization, OrganizationUnit, UnitType } from "@/app/utils/OrganizationContext";
import { useMember, Member, MemberRole } from "@/app/utils/MemberContext";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Organizations() {
  const { units, addUnit, updateUnit, deleteUnit, searchUnits, filterUnitsByType, isLoading: unitsLoading } = useOrganization();
  const { members, addMember, updateMember, deleteMember, searchMembers, loading: membersLoading } = useMember();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<UnitType | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);
  
  // Members state
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    email: '',
    roles: [] as MemberRole[],
    units: [] as string[],
    status: 'active' as 'active' | 'inactive'
  });

  // Progress state
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  // URL params handling
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const defaultTab = tabParam === 'progress' ? 'progress' : 'structure';

  // Get staff members (members with Staff role)
  const staffMembers = members.filter(member => member.roles.includes('Staff'));
  
  // Calculate progress statistics from actual members
  const progressStats = {
    totalStaff: members.length,
    staffInTraining: staffMembers.length,
    completionRate: members.length > 0 ? Math.round((staffMembers.length / members.length) * 100) : 0,
    averageScore: 88, // Placeholder, would be calculated from actual training data
    activeModules: units.length
  };
  
  // Get top performers (members with highest scores)
  const topPerformers = members
    .filter(member => member.roles.includes('Staff'))
    .slice(0, 3)
    .map(member => ({
      id: member.id,
      name: member.name,
      role: member.roles[0],
      score: 90 + Math.floor(Math.random() * 10), // Random score between 90-99 for demo
      modulesCompleted: Math.floor(Math.random() * 10) + 5, // Random between 5-14 for demo
      initial: member.name.charAt(0)
    }));
  
  // Get staff progress from actual members
  const staffProgress = members
    .filter(member => Array.isArray(member.roles) && 
      (member.roles.includes('Staff') || member.roles.includes('Manager')))
    .map(member => {
      // Ensure units is an array
      const memberUnits = Array.isArray(member.units) ? member.units : [];
      const unitNames = memberUnits.map(unitId => {
        const unit = units.find(u => u.id === unitId);
        return unit ? unit.name : 'Unknown';
      });
      
      const totalModules = Math.floor(Math.random() * 10) + 10; // Random between 10-19 for demo
      const completedModules = Math.floor(Math.random() * totalModules); // Random completed modules
      
      return {
        id: member.id,
        name: member.name,
        role: Array.isArray(member.roles) && member.roles.length > 0 ? member.roles[0] : 'Staff',
        location: unitNames.length > 0 ? unitNames[0] : 'Headquarters',
        department: Array.isArray(member.roles) && member.roles.includes('Manager') ? 'Management' : 'Staff',
        progress: completedModules,
        total: totalModules,
        score: 85 + Math.floor(Math.random() * 15), // Random score between 85-99
        currentModule: 'Module ' + (completedModules + 1),
        completion: Math.floor(Math.random() * 100), // Random completion percentage
        initial: member.name.charAt(0)
      };
    });

  const [formData, setFormData] = useState({
    name: '',
    type: 'team' as UnitType,
    description: ''
  });

  // Filter units based on search query and active filter
  const filteredUnits = useMemo(() => {
    let filtered = units;
    
    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filterUnitsByType(activeFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = searchUnits(searchQuery);
    }
    
    return filtered;
  }, [units, activeFilter, searchQuery, filterUnitsByType, searchUnits]);

  // Filter members based on search query
  const filteredMembersList = useMemo(() => {
    if (!memberSearchQuery) return members;
    return searchMembers(memberSearchQuery);
  }, [members, memberSearchQuery, searchMembers]);

  // Update filtered members when the list changes
  useEffect(() => {
    setFilteredMembers(filteredMembersList);
  }, [filteredMembersList]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'team',
      description: ''
    });
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addUnit(formData);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditUnit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUnitId) return;
    
    updateUnit(currentUnitId, formData);
    setIsEditModalOpen(false);
    setCurrentUnitId(null);
    resetForm();
  };

  const startEditingUnit = (unit: OrganizationUnit) => {
    setFormData({
      name: unit.name,
      type: unit.type,
      description: unit.description
    });
    setCurrentUnitId(unit.id);
    setIsEditModalOpen(true);
  };

  const handleMemberInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMemberFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: MemberRole) => {
    setMemberFormData(prev => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const handleUnitChange = (unitId: string) => {
    setMemberFormData(prev => {
      const units = prev.units.includes(unitId)
        ? prev.units.filter(id => id !== unitId)
        : [...prev.units, unitId];
      return { ...prev, units };
    });
  };

  const handleStatusChange = (status: 'active' | 'inactive') => {
    setMemberFormData(prev => ({ ...prev, status }));
  };

  const resetMemberForm = () => {
    setMemberFormData({
      name: '',
      email: '',
      roles: [] as MemberRole[],
      units: [] as string[],
      status: 'active' as 'active' | 'inactive'
    });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure roles and units are arrays
    const validatedData = {
      ...memberFormData,
      roles: Array.isArray(memberFormData.roles) ? memberFormData.roles : [],
      units: Array.isArray(memberFormData.units) ? memberFormData.units : []
    };
    
    addMember(validatedData);
    setIsAddMemberModalOpen(false);
    resetMemberForm();
  };

  const handleEditMember = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMemberId) return;
    
    // Ensure roles and units are arrays
    const validatedData = {
      ...memberFormData,
      roles: Array.isArray(memberFormData.roles) ? memberFormData.roles : [],
      units: Array.isArray(memberFormData.units) ? memberFormData.units : []
    };
    
    updateMember(currentMemberId, validatedData);
    setIsEditMemberModalOpen(false);
    setCurrentMemberId(null);
    resetMemberForm();
  };

  const startEditingMember = (member: Member) => {
    setMemberFormData({
      name: member.name,
      email: member.email,
      roles: member.roles,
      units: member.units,
      status: member.status
    });
    setCurrentMemberId(member.id);
    setIsEditMemberModalOpen(true);
  };

  const getUnitNameById = (unitId: string): string => {
    const unit = units.find(u => u.id === unitId);
    return unit ? unit.name : 'Unknown';
  };

  const getUnitTypeIcon = (type: UnitType) => {
    switch (type) {
      case 'team':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'location':
        return <MapPin className="h-5 w-5 text-green-500" />;
      case 'department':
        return <Building className="h-5 w-5 text-purple-500" />;
      case 'role':
        return <Briefcase className="h-5 w-5 text-orange-500" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  if (unitsLoading || membersLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <p>Loading organization data...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Tabs defaultValue={defaultTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="structure" className="px-4 py-2">
            STRUCTURE
          </TabsTrigger>
          <TabsTrigger value="members" className="px-4 py-2">
            MEMBERS
          </TabsTrigger>
          <TabsTrigger value="progress" className="px-4 py-2">
            PROGRESS
          </TabsTrigger>
          <TabsTrigger value="access" className="px-4 py-2">
            ACCESS CONTROL
          </TabsTrigger>
          <TabsTrigger value="activity" className="px-4 py-2">
            ACTIVITY LOG
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="mt-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-[#3a2a6d]">Organization Structure</h1>
            <Button 
              className="bg-[#00c7c7] hover:bg-[#00a7a7]"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              ADD UNIT
            </Button>
          </div>

          {/* Filters */}
          <div className="flex mb-6 space-x-2">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('all')}
              className={activeFilter === 'all' ? 'bg-[#3a2a6d]' : ''}
            >
              ALL
            </Button>
            <Button
              variant={activeFilter === 'team' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('team')}
              className={activeFilter === 'team' ? 'bg-[#3a2a6d]' : ''}
            >
              <Users className="h-4 w-4 mr-2" />
              TEAMS
            </Button>
            <Button
              variant={activeFilter === 'location' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('location')}
              className={activeFilter === 'location' ? 'bg-[#3a2a6d]' : ''}
            >
              <MapPin className="h-4 w-4 mr-2" />
              LOCATIONS
            </Button>
            <Button
              variant={activeFilter === 'department' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('department')}
              className={activeFilter === 'department' ? 'bg-[#3a2a6d]' : ''}
            >
              <Building className="h-4 w-4 mr-2" />
              DEPARTMENTS
            </Button>
            <Button
              variant={activeFilter === 'role' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('role')}
              className={activeFilter === 'role' ? 'bg-[#3a2a6d]' : ''}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              ROLES
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search units..."
                className="pl-10 p-2 border rounded-md w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Units Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUnits.length === 0 ? (
              <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No units found. Add your first unit to get started.</p>
              </div>
            ) : (
              filteredUnits.map((unit) => (
                <Card key={unit.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {getUnitTypeIcon(unit.type)}
                      <h3 className="text-lg font-medium ml-2">{unit.name}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => startEditingUnit(unit)}
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteUnit(unit.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2 text-sm">{unit.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(unit.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {unit.type}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-[#3a2a6d]">Members</h1>
            <Button 
              className="bg-[#00c7c7] hover:bg-[#00a7a7]"
              onClick={() => setIsAddMemberModalOpen(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              ADD MEMBER
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search members..."
                className="pl-10 p-2 border rounded-md w-full"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Members Table */}
          <Card className="bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No members found. Add your first member to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {(member.roles || []).map((role) => (
                              <span key={role} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {role}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(member.units) ? member.units : []).map((unitId) => (
                              <span key={unitId} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                {getUnitNameById(unitId)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            member.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => startEditingMember(member)}
                            >
                              <Edit className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-[#3a2a6d]">Training Progress</h1>
            <Button 
              className="bg-[#00c7c7] hover:bg-[#00a7a7]"
              onClick={() => {}}
            >
              <Download className="h-5 w-5 mr-2" />
              EXPORT TO CSV
            </Button>
          </div>
          <p className="text-gray-600 mb-6">Monitor and analyze staff training performance</p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <User className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{progressStats.totalStaff}</h2>
                <p className="text-sm text-gray-500">Total Staff</p>
                <p className="text-xs text-gray-400">{progressStats.staffInTraining} currently in training</p>
              </div>
            </Card>
            <Card className="p-6 flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <ArrowUpRight className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{progressStats.completionRate}%</h2>
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-xs text-gray-400">Across all modules</p>
              </div>
            </Card>
            <Card className="p-6 flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <Star className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{progressStats.averageScore}%</h2>
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-xs text-gray-400">Based on completed modules</p>
              </div>
            </Card>
            <Card className="p-6 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{progressStats.activeModules}</h2>
                <p className="text-sm text-gray-500">Active Modules</p>
                <p className="text-xs text-gray-400">Across all categories</p>
              </div>
            </Card>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Location</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option>All Locations</option>
                {units
                  .filter(unit => unit.type === 'location')
                  .map(unit => (
                    <option key={unit.id}>{unit.name}</option>
                  ))
                }
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Department</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option>All Departments</option>
                {units
                  .filter(unit => unit.type === 'department')
                  .map(unit => (
                    <option key={unit.id}>{unit.name}</option>
                  ))
                }
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Role</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option>All Roles</option>
                {['Administrator', 'Manager', 'Staff', 'Guest'].map(role => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Module Category</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option>All Categories</option>
                {units
                  .filter(unit => unit.type === 'team')
                  .map(unit => (
                    <option key={unit.id}>{unit.name}</option>
                  ))
                }
              </select>
            </div>
          </div>
          
          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search staff member..."
                className="pl-10 p-2 border rounded-md w-full"
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-2xl font-medium mb-4">Top Performers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topPerformers.map((performer) => (
                <Card key={performer.id} className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg mr-4`}>
                      {performer.initial}
                    </div>
                    <div>
                      <h3 className="font-medium">{performer.name}</h3>
                      <p className="text-sm text-gray-500">{performer.role}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Score: {performer.score}%</span>
                    <span>{performer.modulesCompleted} modules completed</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="mt-8 flex justify-between items-center mb-4">
            <h2 className="text-2xl font-medium">Staff Progress</h2>
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              EXPORT TO CSV
            </Button>
          </div>
          
          <Card className="bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Member <ArrowUp className="inline h-3 w-3 ml-1" />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Module
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staffProgress.map((staff) => (
                    <tr key={staff.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm mr-3`}>
                            {staff.initial}
                          </div>
                          <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{staff.role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{staff.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{staff.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-32">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{staff.progress}/{staff.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(staff.progress / staff.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {staff.score}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {staff.currentModule}
                          <div className="text-xs text-gray-500">{staff.completion}% complete</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-[#3a2a6d]">Access Control</h1>
          </div>
          <Card className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="text-xl font-medium mt-4">Access Control</h3>
            <p className="text-gray-500 mt-2">
              This feature will be available soon. Here you'll be able to manage permissions and access levels for your organization.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-[#3a2a6d]">Activity Log</h1>
          </div>
          <Card className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="text-xl font-medium mt-4">Activity Log</h3>
            <p className="text-gray-500 mt-2">
              This feature will be available soon. Here you'll be able to track all changes made to your organization.
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Unit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Create New Unit"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
              CANCEL
            </Button>
            <Button
              className="bg-[#00c7c7] hover:bg-[#00a7a7]"
              onClick={handleAddUnit}
            >
              CREATE
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddUnit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="team">Team</option>
              <option value="location">Location</option>
              <option value="department">Department</option>
              <option value="role">Role</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              rows={4}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Unit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setCurrentUnitId(null);
          resetForm();
        }}
        title="Edit Unit"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setCurrentUnitId(null);
                resetForm();
              }}
            >
              CANCEL
            </Button>
            <Button
              className="bg-[#00c7c7] hover:bg-[#00a7a7]"
              onClick={handleEditUnit}
            >
              UPDATE
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditUnit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="team">Team</option>
              <option value="location">Location</option>
              <option value="department">Department</option>
              <option value="role">Role</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              rows={4}
            />
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => {
          setIsAddMemberModalOpen(false);
          resetMemberForm();
        }}
        title="Create New Member"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddMemberModalOpen(false);
                resetMemberForm();
              }}
            >
              CANCEL
            </Button>
            <Button
              className="bg-[#00c7c7] hover:bg-[#00a7a7]"
              onClick={handleAddMember}
            >
              CREATE
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={memberFormData.name}
              onChange={handleMemberInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={memberFormData.email}
              onChange={handleMemberInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Roles</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Administrator', 'Manager', 'Staff', 'Guest'] as MemberRole[]).map((role) => (
                <div key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`role-${role}`}
                    checked={memberFormData.roles.includes(role)}
                    onChange={() => handleRoleChange(role)}
                    className="mr-2"
                  />
                  <label htmlFor={`role-${role}`} className="text-sm">{role}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Units</label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border p-2 rounded-md">
              {units.map((unit) => (
                <div key={unit.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`unit-${unit.id}`}
                    checked={memberFormData.units.includes(unit.id)}
                    onChange={() => handleUnitChange(unit.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`unit-${unit.id}`} className="text-sm">{unit.name} ({unit.type})</label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="status-active"
                  name="status"
                  checked={memberFormData.status === 'active'}
                  onChange={() => handleStatusChange('active')}
                  className="mr-2"
                />
                <label htmlFor="status-active" className="text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  Active
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="status-inactive"
                  name="status"
                  checked={memberFormData.status === 'inactive'}
                  onChange={() => handleStatusChange('inactive')}
                  className="mr-2"
                />
                <label htmlFor="status-inactive" className="text-sm flex items-center">
                  <XCircle className="h-4 w-4 text-red-500 mr-1" />
                  Inactive
                </label>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        isOpen={isEditMemberModalOpen}
        onClose={() => {
          setIsEditMemberModalOpen(false);
          setCurrentMemberId(null);
          resetMemberForm();
        }}
        title="Edit Member"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditMemberModalOpen(false);
                setCurrentMemberId(null);
                resetMemberForm();
              }}
            >
              CANCEL
            </Button>
            <Button
              className="bg-[#00c7c7] hover:bg-[#00a7a7]"
              onClick={handleEditMember}
            >
              UPDATE
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={memberFormData.name}
              onChange={handleMemberInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={memberFormData.email}
              onChange={handleMemberInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Roles</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Administrator', 'Manager', 'Staff', 'Guest'] as MemberRole[]).map((role) => (
                <div key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`edit-role-${role}`}
                    checked={memberFormData.roles.includes(role)}
                    onChange={() => handleRoleChange(role)}
                    className="mr-2"
                  />
                  <label htmlFor={`edit-role-${role}`} className="text-sm">{role}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Units</label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border p-2 rounded-md">
              {units.map((unit) => (
                <div key={unit.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`edit-unit-${unit.id}`}
                    checked={memberFormData.units.includes(unit.id)}
                    onChange={() => handleUnitChange(unit.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`edit-unit-${unit.id}`} className="text-sm">{unit.name} ({unit.type})</label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="edit-status-active"
                  name="status"
                  checked={memberFormData.status === 'active'}
                  onChange={() => handleStatusChange('active')}
                  className="mr-2"
                />
                <label htmlFor="edit-status-active" className="text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  Active
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="edit-status-inactive"
                  name="status"
                  checked={memberFormData.status === 'inactive'}
                  onChange={() => handleStatusChange('inactive')}
                  className="mr-2"
                />
                <label htmlFor="edit-status-inactive" className="text-sm flex items-center">
                  <XCircle className="h-4 w-4 text-red-500 mr-1" />
                  Inactive
                </label>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
