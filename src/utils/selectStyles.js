export const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "42px",
    borderRadius: "8px",
    borderColor: "#9CA3AF",
    boxShadow: "none",
    padding: "2px",
    "&:hover": {
      borderColor: "#9CA3AF",
    },
  }),

  valueContainer: (provided) => ({
    ...provided,
    padding: "0 8px",
  }),

  placeholder: (provided) => ({
    ...provided,
    color: "#6B7280", // gray-500
  }),

  singleValue: (provided) => ({
    ...provided,
    color: "#111827", // gray-900
  }),

  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),

  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#6B7280" // selected
      : state.isFocused
      ? "#E5E7EB" // hover
      : "#FFFFFF",
    color: state.isSelected ? "#FFFFFF" : "#111827",
    cursor: "pointer",
  }),
};