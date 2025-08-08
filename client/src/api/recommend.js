const API_URL = import.meta.env.VITE_RECOMMEND_URL;

export const recommendAPI = {
    getSuggestions: async (user_list, all_items) => {
        const response = await fetch(`${API_URL}/recommend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_list: user_list, all_items: all_items })
        });
        return response.json();
    }
};