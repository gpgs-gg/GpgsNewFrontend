import { useEffect, useState } from "react";

const getInitialFilters = (storageKey, defaultFilters) => {
  try {
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      return { ...defaultFilters };
    }

    const parsed = JSON.parse(stored);

    return {
      ...defaultFilters,
      ...parsed,
    };
  } catch (error) {
    console.error(`Failed to load filters: ${storageKey}`, error);

    return { ...defaultFilters };
  }
};

const usePersistedFilters = (storageKey, defaultFilters = {}) => {
  const [filters, setFilters] = useState(() =>
    getInitialFilters(storageKey, defaultFilters),
  );

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(filters));
    } catch (error) {
      console.error(`Failed to save filters: ${storageKey}`, error);
    }
  }, [storageKey, filters]);

  const updateFilters = (updates) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const removeFilter = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  const resetFilters = () => {
    setFilters({ ...defaultFilters });
    localStorage.removeItem(storageKey);
  };

  return {
    filters,
    setFilters,
    updateFilters,
    removeFilter,
    resetFilters,
  };
};

export default usePersistedFilters;