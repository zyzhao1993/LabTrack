export const recommendAPI = {
    getSuggestions: async (user_list, all_items) => {
        const response = await fetch('http://localhost:8000/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_list: user_list, all_items: all_items })
        });
        return response.json();
    }
};