const API_URL = import.meta.env.VITE_API_URL;

export const todosAPI = {
    // get all todos
    getTodos: async (token) => {
      const response = await fetch(`${API_URL}/api/todos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    },
  
    // create new todo
    createTodo: async (token, { text, order, id }) => {
      const response = await fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text, order, id })
      });
      return response.json();
    },
  
    // update todo text
    updateTodoText: async (token, id, text) => {
      const response = await fetch(`${API_URL}/api/todos/${id}/text`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      return response.json();
    },
  
    // update todo checked
    updateTodoChecked: async (token, id, checked, completedAt) => {
      const response = await fetch(`${API_URL}/api/todos/${id}/checked`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ checked, completedAt })
      });
      return response.json();
    },
  
    // update order
    updateOrder: async (token, updates) => {
      const response = await fetch(`${API_URL}/api/todos/order`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ updates })
      });
      return response.json();
    },
  
    // delete todo
    deleteTodo: async (token, id) => {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    }
  };