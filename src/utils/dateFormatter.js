import { format } from "date-fns";

export const formatDate = (date) => {
  if (!date) return "-";

  try {
    return format(new Date(date), "dd MMM yyyy");
  } catch {
    return "-";
  }
};


export const convertStringFormatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};