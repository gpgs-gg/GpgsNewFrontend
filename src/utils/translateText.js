const API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

export const translateToHindi = async (text) => {
  if (!text?.trim()) return "";

  if (!API_KEY) {
    throw new Error("Google Translation API key is missing.");
  }

  try {
    const response = await fetch(
      "https://translation.googleapis.com/language/translate/v2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
        },
        body: JSON.stringify({
          q: text,
          source: "en",
          target: "hi",
          format: "text",
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || "Google translation failed");
    }

    return result.data.translations[0].translatedText;
  } catch (error) {
    console.error("Hindi translation error:", error);
    throw error;
  }
};

// export const translateToHindi = async (text) => {
//   if (!text?.trim()) return "";

//   try {
//     const response = await fetch(
//       `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
//         text
//       )}&langpair=en|hi`
//     );

//     if (!response.ok) {
//       throw new Error("Translation request failed");
//     }

//     const result = await response.json();

//     if (result.responseStatus !== 200) {
//       throw new Error("Translation unavailable");
//     }

//     return result.responseData.translatedText || text;
//   } catch (error) {
//     console.error("Hindi translation error:", error);
//     return text;
//   }
// };