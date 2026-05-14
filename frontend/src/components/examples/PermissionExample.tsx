import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGuard } from '@/components/ui/permission-guard';
import { PermissionButton } from '@/components/ui/permission-button';
import { usePermissions } from '@/hooks/usePermissions';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

export const PermissionExample: React.FC = () => {
  const { hasPermission, canAdd, canEdit, canDelete, canView } = usePermissions();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Permission System Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Example 1: Using PermissionGuard component */}
          <div>
            <h3 className="font-semibold mb-2text-sm">1. Using PermissionGuard Component</h3>
            <div className="flex gap-2">
              <PermissionGuard module="sales" action="view">
                <Button variant="outline" size="sm">
                  <Eye size={16} className="mr-1" />
                  View Sales
                </Button>
              </PermissionGuard>
              
              <PermissionGuard module="sales" action="add">
                <Button variant="outline" size="sm">
                  <Plus size={16} className="mr-1" />
                  Add Sale
                </Button>
              </PermissionGuard>
              
              <PermissionGuard module="sales" action="edit">
                <Button variant="outline" size="sm">
                  <Edit size={16} className="mr-1" />
                  Edit Sale
                </Button>
              </PermissionGuard>
              
              <PermissionGuard module="sales" action="delete">
                <Button variant="destructive" size="sm">
                  <Trash2 size={16} className="mr-1" />
                  Delete Sale
                </Button>
              </PermissionGuard>
            </div>
          </div>

          {/* Example 2: Using PermissionButton component */}
          <div>
            <h3 className="font-semibold mb-2text-sm">2. Using PermissionButton Component</h3>
            <div className="flex gap-2">
              <PermissionButton module="purchases" action="add" variant="default" size="sm">
                <Plus size={16} className="mr-1" />
                Add Purchase
              </PermissionButton>
              
              <PermissionButton module="purchases" action="edit" variant="outline" size="sm">
                <Edit size={16} className="mr-1" />
                Edit Purchase
              </PermissionButton>
              
              <PermissionButton module="purchases" action="delete" variant="destructive" size="sm">
                <Trash2 size={16} className="mr-1" />
                Delete Purchase
              </PermissionButton>
            </div>
          </div>

          {/* Example 3: Using permission hooks */}
          <div>
            <h3 className="font-semibold mb-2text-sm">3. Using Permission Hooks</h3>
            <div className="space-y-2 text-base">
              <p>Can view users: <span className={canView('users') ? 'text-green-600' : 'text-red-600'}>{canView('users') ? 'Yes' : 'No'}</span></p>
              <p>Can add users: <span className={canAdd('users') ? 'text-green-600' : 'text-red-600'}>{canAdd('users') ? 'Yes' : 'No'}</span></p>
              <p>Can edit users: <span className={canEdit('users') ? 'text-green-600' : 'text-red-600'}>{canEdit('users') ? 'Yes' : 'No'}</span></p>
              <p>Can delete users: <span className={canDelete('users') ? 'text-green-600' : 'text-red-600'}>{canDelete('users') ? 'Yes' : 'No'}</span></p>
              <p>Has specific permission 'view_reports': <span className={hasPermission('view_reports') ? 'text-green-600' : 'text-red-600'}>{hasPermission('view_reports') ? 'Yes' : 'No'}</span></p>
            </div>
          </div>

          {/* Example 4: Conditional rendering */}
          <div>
            <h3 className="font-semibold mb-2text-sm">4. Conditional Rendering in Code</h3>
            <div className="flex gap-2">
              {canView('products') && (
                <Button variant="outline" size="sm">
                  <Eye size={16} className="mr-1" />
                  View Products
                </Button>
              )}
              
              {canAdd('products') && (
                <Button variant="default" size="sm">
                  <Plus size={16} className="mr-1" />
                  Add Product
                </Button>
              )}
              
              {canEdit('products') && (
                <Button variant="outline" size="sm">
                  <Edit size={16} className="mr-1" />
                  Edit Product
                </Button>
              )}
              
              {canDelete('products') && (
                <Button variant="destructive" size="sm">
                  <Trash2 size={16} className="mr-1" />
                  Delete Product
                </Button>
              )}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};