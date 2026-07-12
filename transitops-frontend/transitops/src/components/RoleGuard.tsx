import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

interface RoleGuardProps {
  children: ReactNode;
  roles?: UserRole[];
  resource?: string;
  action?: 'view' | 'create' | 'edit' | 'delete';
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user roles/permissions
 * 
 * Usage:
 * <RoleGuard roles={['admin', 'fleet_manager']}>
 *   <Button>Add Vehicle</Button>
 * </RoleGuard>
 * 
 * Or:
 * <RoleGuard resource="vehicles" action="create">
 *   <Button>Add Vehicle</Button>
 * </RoleGuard>
 */
export function RoleGuard({ children, roles, resource, action, fallback = null }: RoleGuardProps) {
  const { hasRole, canAccess } = useAuth();

  let hasPermission = false;

  if (roles) {
    hasPermission = hasRole(roles);
  } else if (resource && action) {
    hasPermission = canAccess(resource, action);
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}
