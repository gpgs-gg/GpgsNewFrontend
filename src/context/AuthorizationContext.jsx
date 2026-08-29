import { createContext, useContext, useMemo } from "react";

import { useAuth } from "./authContext";

import { useMyPermissionsData } from "../components/RolePermission/services/index";

import { useModulesData } from "../components/moduleSidebar/services/index";

const AuthorizationContext = createContext(null);

export const AuthorizationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // =====================================================
  // ROLE
  // =====================================================

  const role = user?.role?.trim().toLowerCase();

  const isAdmin = role === "admin";
  const isEmployee = role === "employee";
  const isClient = role === "client";

  // Admin has full access
  const hasFullAccess = isAdmin;

  // =====================================================
  // MODULES
  // =====================================================

  const { data: modulesResponse, isLoading: modulesLoading } = useModulesData({
    page: 1,
    limit: 1000,
    moduleType: "MENU",
    isActive: true,
    enabled: isAuthenticated && !isClient,
  });

  // =====================================================
  // EMPLOYEE PERMISSIONS
  // =====================================================

  // IMPORTANT:
  // Admin does NOT call permissions API.
  // Only Employee needs permission data.
  const shouldFetchPermissions = isAuthenticated && isEmployee;

  const { data: permissionsResponse, isLoading: permissionsLoading } =
    useMyPermissionsData(shouldFetchPermissions);

  // =====================================================
  // NORMALIZE MODULES
  // =====================================================

  const modules = useMemo(() => {
    return modulesResponse?.data || [];
  }, [modulesResponse]);

  // =====================================================
  // NORMALIZE PERMISSIONS
  // =====================================================

  const permissions = useMemo(() => {
    return (
      permissionsResponse?.data?.permissions ||
      permissionsResponse?.permissions ||
      []
    );
  }, [permissionsResponse]);

  // =====================================================
  // PERMISSION MAP
  // =====================================================

  const permissionMap = useMemo(() => {
    const map = {};

    permissions.forEach((permission) => {
      const moduleKey = permission?.moduleId?.key;

      if (!moduleKey) return;

      map[moduleKey] = permission.actions || {};
    });

    return map;
  }, [permissions]);

  // =====================================================
  // AUTHORIZED SIDEBAR MODULES
  // =====================================================

  const authorizedModules = useMemo(() => {
    if (!isAuthenticated) {
      return [];
    }

    // =================================================
    // ADMIN
    // =================================================
    // Admin gets every active module.
    // No permission API is required.
    if (isAdmin) {
      return modules
        .filter((module) => module.isActive === true)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }

    // =================================================
    // EMPLOYEE
    // =================================================

    if (isEmployee) {
      return modules
        .filter((module) => {
          const permission = permissionMap[module.key];

          return module.isActive === true && permission?.view === true;
        })
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }

    // Client does not use dynamic modules
    return [];
  }, [modules, permissionMap, isAdmin, isEmployee, isAuthenticated]);

  // =====================================================
  // CENTRAL AUTHORIZATION
  // =====================================================

  const can = (moduleKey, action) => {
    // Admin can do everything
    if (isAdmin) {
      return true;
    }

    // Employee uses assigned permissions
    if (isEmployee) {
      return permissionMap?.[moduleKey]?.[action] === true;
    }

    return false;
  };

  // =====================================================
  // SHORTCUTS
  // =====================================================

  const canView = (moduleKey) => can(moduleKey, "view");

  const canAdd = (moduleKey) => can(moduleKey, "add");

  const canEdit = (moduleKey) => can(moduleKey, "edit");

  const canDelete = (moduleKey) => can(moduleKey, "delete");

  const canSingleView = (moduleKey) => can(moduleKey, "singleView");

  // =====================================================
  // LOADING
  // =====================================================

  const loading = modulesLoading || (isEmployee && permissionsLoading);

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value = {
    user,

    isAdmin,
    isEmployee,
    isClient,
    hasFullAccess,

    permissions,
    permissionMap,

    modules,
    authorizedModules,

    can,
    canView,
    canAdd,
    canEdit,
    canDelete,
    canSingleView,

    loading,
  };

  return (
    <AuthorizationContext.Provider value={value}>
      {children}
    </AuthorizationContext.Provider>
  );
};

export const useAuthorization = () => {
  const context = useContext(AuthorizationContext);

  if (!context) {
    throw new Error(
      "useAuthorization must be used within AuthorizationProvider",
    );
  }

  return context;
};