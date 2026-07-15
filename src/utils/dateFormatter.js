import { format } from "date-fns";

export const formatDate = (date) => {
  if (!date) return "-";

  try {
    return format(new Date(date), "dd MMM yyyy");
  } catch {
    return "-";
  }
};

export const formatDateAndTime = (date) => {
  if (!date) return "-";

  try {
    return format(new Date(date), "dd MMM yyyy hh:mm a")
      .replace("am", "AM")
      .replace("pm", "PM");
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

export const convertStringFormatDateTime = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${year}-${month}-${day} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
};