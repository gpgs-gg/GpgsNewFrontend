
import { useEffect } from "react";

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = `${title} | GPGS`;
  }, [title]);
};

export default usePageTitle;
