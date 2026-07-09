import { useEffect, useMemo, useState } from "react";
import { fetchNews } from "../services/api";

const DEFAULT_FILTERS = {
  category: "",
  sort: "newest",
  dateRange: "",
  customMode: "single",
  startDate: "",
  endDate: ""
};

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 8,
  total: 0,
  totalPages: 1
};

const parsePositiveInt = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
};

const readInitialState = () => {
  const params = new URLSearchParams(window.location.search);

  return {
    search: params.get("search") || "",
    filters: {
      ...DEFAULT_FILTERS,
      category: params.get("category") || "",
      sort: params.get("sort") || DEFAULT_FILTERS.sort,
      dateRange: params.get("dateRange") || "",
      customMode: params.get("customMode") || DEFAULT_FILTERS.customMode,
      startDate: params.get("startDate") || "",
      endDate: params.get("endDate") || ""
    },
    page: parsePositiveInt(params.get("page"), DEFAULT_PAGINATION.page)
  };
};

function useNewsFeed() {
  const initialState = readInitialState();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState(initialState.search);
  const [filters, setFilters] = useState(initialState.filters);
  const [pagination, setPagination] = useState({
    ...DEFAULT_PAGINATION,
    page: initialState.page
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const queryParams = useMemo(
    () => ({
      search,
      category: filters.category,
      sort: filters.sort,
      startDate: filters.startDate,
      endDate: filters.endDate,
      page: pagination.page,
      limit: pagination.limit
    }),
    [
      filters.category,
      filters.sort,
      filters.endDate,
      filters.startDate,
      pagination.limit,
      pagination.page,
      search
    ]
  );

  useEffect(() => {
    let isActive = true;

    const loadNews = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await fetchNews(queryParams);

        if (!isActive) {
          return;
        }

        setItems(data.items);
        setPagination((current) => ({
          ...current,
          ...data.pagination
        }));
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(loadError.message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadNews();

    return () => {
      isActive = false;
    };
  }, [queryParams, reloadKey]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (search) {
      params.set("search", search);
    }

    if (filters.category) {
      params.set("category", filters.category);
    }

    if (filters.sort && filters.sort !== DEFAULT_FILTERS.sort) {
      params.set("sort", filters.sort);
    }

    if (filters.dateRange) {
      params.set("dateRange", filters.dateRange);
    }

    if (filters.customMode && filters.dateRange === "custom") {
      params.set("customMode", filters.customMode);
    }

    if (filters.startDate) {
      params.set("startDate", filters.startDate);
    }

    if (filters.endDate) {
      params.set("endDate", filters.endDate);
    }

    if (pagination.page > 1) {
      params.set("page", String(pagination.page));
    }

    const nextSearch = params.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;

    window.history.replaceState(null, "", nextUrl);
  }, [
    filters.category,
    filters.customMode,
    filters.dateRange,
    filters.endDate,
    filters.sort,
    filters.startDate,
    pagination.page,
    search
  ]);

  const resetToFirstPage = () => {
    setPagination((current) => ({
      ...current,
      page: 1
    }));
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    resetToFirstPage();
  };

  const handleCategoryChange = (value) => {
    setFilters((current) => ({
      ...current,
      category: value
    }));
    resetToFirstPage();
  };

  const handleSortChange = (value) => {
    setFilters((current) => ({
      ...current,
      sort: value || DEFAULT_FILTERS.sort
    }));
    resetToFirstPage();
  };

  const handleDateChange = (key, value) => {
    setFilters((current) => {
      const nextFilters = {
        ...current,
        dateRange: "custom",
        [key]: value
      };

      if (current.customMode === "single") {
        if (key === "startDate") {
          nextFilters.endDate = value;
        }

        if (key === "endDate") {
          nextFilters.startDate = value;
        }
      }

      return nextFilters;
    });
    resetToFirstPage();
  };

  const handleDateRangeChange = (value) => {
    if (!value) {
      setFilters(DEFAULT_FILTERS);
      resetToFirstPage();
      return;
    }

    const today = new Date();
    const endDate = today.toISOString().slice(0, 10);
    const startDate = new Date(today);

    if (value === "today") {
      startDate.setDate(today.getDate());
    } else if (value === "last7") {
      startDate.setDate(today.getDate() - 6);
    } else if (value === "last30") {
      startDate.setDate(today.getDate() - 29);
    } else if (value === "custom") {
      setFilters((current) => ({
        ...current,
        dateRange: "custom",
        customMode: current.customMode || "single"
      }));
      resetToFirstPage();
      return;
    }

    setFilters({
      ...DEFAULT_FILTERS,
      dateRange: value,
      startDate: startDate.toISOString().slice(0, 10),
      endDate
    });
    resetToFirstPage();
  };

  const handleCustomModeChange = (value) => {
    setFilters((current) => {
      if (value === "single") {
        const singleDate = current.startDate || current.endDate || "";

        return {
          ...current,
          dateRange: "custom",
          customMode: value,
          startDate: singleDate,
          endDate: singleDate
        };
      }

      return {
        ...current,
        dateRange: "custom",
        customMode: value
      };
    });
    resetToFirstPage();
  };

  const clearFilters = () => {
    setSearch("");
    setFilters(DEFAULT_FILTERS);
    resetToFirstPage();
  };

  const goToPreviousPage = () => {
    setPagination((current) => ({
      ...current,
      page: Math.max(current.page - 1, 1)
    }));
  };

  const goToNextPage = () => {
    setPagination((current) => ({
      ...current,
      page: Math.min(current.page + 1, current.totalPages || 1)
    }));
  };

  const refreshNews = async () => {
    setPagination((current) => ({
      ...current,
      page: 1
    }));
    setReloadKey((current) => current + 1);
  };

  return {
    error,
    filters,
    goToNextPage,
    goToPreviousPage,
    handleCategoryChange,
    handleSortChange,
    handleDateChange,
    handleCustomModeChange,
    handleDateRangeChange,
    handleSearchChange,
    isLoading,
    items,
    pagination,
    clearFilters,
    refreshNews,
    search
  };
}

export default useNewsFeed;
