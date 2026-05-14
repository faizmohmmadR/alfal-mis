import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, MapPin, Edit, Save, X, Shield, Clock, Camera, Upload } from 'lucide-react';
import useUpdate from '@/api/useUpdate';
import useFetchObject from '@/api/useFetchObject';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: profileData, refetch: refetchProfile } = useFetchObject<any>({
    queryKey: ['profile'],
    endpoint: 'profile',
  });
  
  const currentUser = profileData || user;
  const [formData, setFormData] = useState({
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { handleUpdate, loading, isSuccess } = useUpdate({
    queryKey: ['profile'],
  });

  // Update form data when profile data changes
  React.useEffect(() => {
    if (currentUser) {
      setFormData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || ''
      });
      setImagePreview(null);
      setSelectedImage(null);
    }
  }, [currentUser]);

  React.useEffect(() => {
    if (isSuccess) {
      setIsEditing(false);
      refetchProfile();
      updateUser(formData);
    }
  }, [isSuccess, formData, updateUser, refetchProfile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to current user data
    if (currentUser) {
      setFormData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || ''
      });
    }
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    const updateData = new FormData();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        updateData.append(key, value);
      }
    });
    
    if (selectedImage) {
      updateData.append('profile_picture', selectedImage);
    }
    
    handleUpdate('', updateData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageSelect = () => {
    fileInputRef.current?.click();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'staff': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'employee': return 'bg-green-100 text-green-800 border-green-200';
      case 'customer': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'vendor': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };



  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-base font-bold text-slate-800text-sm">Profile</h1>
          <p className="text-slate-600 mt-1text-xs">Manage your personal information and preferences</p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handleCancel} variant="outline" disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <Card className="border border-slate-200">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Image Section */}
            <div className="lg:col-span-1 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-50">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : currentUser?.profile_picture ? (
                    <img src={currentUser.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-slate-400" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full p-0"
                    onClick={triggerImageSelect}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              
              <div className="text-center">
                <h2 className="text-base font-bold text-slate-800text-sm">
                  {currentUser?.first_name} {currentUser?.last_name}
                </h2>
                <p className="text-slate-600 text-base mt-1text-xs">{currentUser?.email}</p>
                <div className="flex flex-col gap-2 mt-3">
                  <Badge className={`px-3 py-1 text-base ${getRoleColor(currentUser?.role || '')}`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {currentUser?.role?.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 text-base">
                    <Clock className="w-3 h-3 mr-1" />
                    Joined {new Date(currentUser?.created_at || '').toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </div>
            {/* Information Sections */}
            <div className="lg:col-span-3 space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-base font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2text-sm">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-medium text-slate-600">First Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-slate-50 rounded border border-slate-200">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700text-xs">{currentUser?.first_name || 'Not provided'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-base font-medium text-slate-600">Last Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-slate-50 rounded border border-slate-200">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700text-xs">{currentUser?.last_name || 'Not provided'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-base font-medium text-slate-600">Email Address</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-slate-50 rounded border border-slate-200">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700text-xs">{currentUser?.email || 'Not provided'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-base font-medium text-slate-600">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-slate-50 rounded border border-slate-200">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700text-xs">{currentUser?.phone || 'Not provided'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div>
                <h3 className="text-base font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2text-sm">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-medium text-slate-600">Username</Label>
                    <div className="mt-1 p-3 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700text-xs">{currentUser?.username}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-base font-medium text-slate-600">Account Status</Label>
                    <div className="mt-1 p-3 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${currentUser?.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-slate-700text-xs">{currentUser?.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-base font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2text-sm">Address Information</h3>
                <div>
                  <Label className="text-base font-medium text-slate-600">Full Address</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={4}
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-3 bg-slate-50 rounded border border-slate-200 min-h-[100px]">
                      <div className="flex gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 whitespace-pre-wraptext-xs">{currentUser?.address || 'Not provided'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Permissions Section */}
              {(currentUser?.is_admin || currentUser?.is_staff || currentUser?.is_superuser) && (
                <div>
                  <h3 className="text-base font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2text-sm">Permissions & Access</h3>
                  <div className="flex flex-wrap gap-3">
                    {currentUser?.is_superuser && (
                      <Badge className="px-3 py-1 bg-red-100 text-red-800 border-red-200">
                        <Shield className="w-3 h-3 mr-1" />
                        Super Admin
                      </Badge>
                    )}
                    {currentUser?.is_admin && (
                      <Badge className="px-3 py-1 bg-blue-100 text-blue-800 border-blue-200">
                        <Shield className="w-3 h-3 mr-1" />
                        Administrator
                      </Badge>
                    )}
                    {currentUser?.is_staff && (
                      <Badge className="px-3 py-1 bg-green-100 text-green-800 border-green-200">
                        <Shield className="w-3 h-3 mr-1" />
                        Staff Member
                      </Badge>
                    )}
                    {currentUser?.is_buyer && (
                      <Badge variant="outline" className="px-3 py-1">
                        Buyer Access
                      </Badge>
                    )}
                    {currentUser?.is_seller && (
                      <Badge variant="outline" className="px-3 py-1">
                        Seller Access
                      </Badge>
                    )}
                    {currentUser?.is_finance && (
                      <Badge variant="outline" className="px-3 py-1">
                        Finance Access
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
