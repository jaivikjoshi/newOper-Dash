"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  Plus,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useMember, Member, MemberRole } from "@/app/utils/MemberContext";
import { useOrganization, OrganizationUnit } from "@/app/utils/OrganizationContext";

export default function Members() {
  const { members, addMember, updateMember, deleteMember, loading: membersLoading } = useMember();
  const { units, isLoading: unitsLoading } = useOrganization();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roles: [] as MemberRole[],
    units: [] as string[],
    status: 'active' as 'active' | 'inactive'
  });

  // Filter and search members
  useEffect(() => {
    if (!searchQuery) {
      setFilteredMembers(members);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = members.filter(member => 
      member.name.toLowerCase().includes(query) || 
      member.email.toLowerCase().includes(query)
    );
    
    setFilteredMembers(filtered);
  }, [members, searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: MemberRole) => {
    setFormData(prev => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const handleUnitChange = (unitId: string) => {
    setFormData(prev => {
      const units = prev.units.includes(unitId)
        ? prev.units.filter(id => id !== unitId)
        : [...prev.units, unitId];
      return { ...prev, units };
    });
  };

  const handleStatusChange = (status: 'active' | 'inactive') => {
    setFormData(prev => ({ ...prev, status }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      roles: [],
      units: [],
      status: 'active'
    });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    
    addMember(formData);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditMember = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMemberId) return;
    
    updateMember(currentMemberId, formData);
    setIsEditModalOpen(false);
    setCurrentMemberId(null);
    resetForm();
  };

  const startEditingMember = (member: Member) => {
    setFormData({
      name: member.name,
      email: member.email,
      roles: member.roles,
      units: member.units,
      status: member.status
    });
    setCurrentMemberId(member.id);
    setIsEditModalOpen(true);
  };

  const getUnitNameById = (unitId: string): string => {
    const unit = units.find(u => u.id === unitId);
    return unit ? unit.name : 'Unknown';
  };

  if (membersLoading || unitsLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <p>Loading members data...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-[#3a2a6d]">Members</h1>
        <Button 
          className="bg-[#00c7c7] hover:bg-[#00a7a7]"
          onClick={() => setIsAddModalOpen(true)}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                        {member.roles.map((role) => (
                          <span key={role} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {member.units.map((unitId) => (
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

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Create New Member"
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
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Roles</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Administrator', 'Manager', 'User', 'Guest'] as MemberRole[]).map((role) => (
                <div key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`role-${role}`}
                    checked={formData.roles.includes(role)}
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
                    checked={formData.units.includes(unit.id)}
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
                  checked={formData.status === 'active'}
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
                  checked={formData.status === 'inactive'}
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
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setCurrentMemberId(null);
          resetForm();
        }}
        title="Edit Member"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setCurrentMemberId(null);
                resetForm();
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
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Roles</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Administrator', 'Manager', 'User', 'Guest'] as MemberRole[]).map((role) => (
                <div key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`edit-role-${role}`}
                    checked={formData.roles.includes(role)}
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
                    checked={formData.units.includes(unit.id)}
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
                  checked={formData.status === 'active'}
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
                  checked={formData.status === 'inactive'}
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
