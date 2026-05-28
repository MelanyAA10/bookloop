export const fetchProducts = async () => {
    try {
        const response = await fetch(process.env.REACT_APP_API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": process.env.REACT_APP_API_KEY,
                "Accept": "application/json"
            }
        });
        if (!response.ok) {
            throw new Error('Error fetching products');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getBookImageUrl = (book) => {
  if (book?.images?.length > 0 && book.images[0]) return book.images[0];
  if (book?.cover_url) return book.cover_url;
  if (book?.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;
  return null;
};




/**
 * Returns the primary image URL for a book.
 * Fase 2: swap this function to upload the file to Azure Blob Storage
 * and return the real URL — the rest of the app stays unchanged.
 */
/* export const getBookImageUrl = (book) => {
  if (book?.images?.length > 0 && book.images[0]) return book.images[0];
  if (book?.cover_url) return book.cover_url;
  return null;
}; */
//build check