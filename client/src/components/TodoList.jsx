import { useEffect, useRef, useState, useCallback } from "react";
import {v4 as uuidv4} from 'uuid';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { AnimatePresence, motion } from 'framer-motion';

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TodoItem from "./TodoItem";

import { todosAPI } from '../api/todos';
import { recommendAPI } from '../api/recommend'; 
import { useUser } from '../contexts/UserContext';

// Local storage keys
const STORAGE_KEYS = {
  TODO_ITEMS: 'lab-track-todo-items',
  EDITING_STATES: 'lab-track-todo-editing'
};

const TodoList = () => {
    const [items, setItems] = useState([]);
    const [isEditing, setIsEditing] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const inputRefs = useRef([]);
    const pendingTimers = useRef({}); // store timer for each item

    const [suggestions,setSuggestions] = useState([]);

    useEffect(() => {
        async function fetchSuggestions() {
            const activeItems = items.filter(item => !item.checked || (item.checked && !item.completedAt));
            const completedItems = items
                .filter(item => item.checked && item.completedAt)
                .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
            const userList = activeItems.map(item => item.text);
            const userHistory = completedItems.map(item => item.text);
            const res = await recommendAPI.getSuggestions(userList, userHistory);
            if (res && res.suggestions) {
                setSuggestions(res.suggestions);
                console.log(res.scores);
            }
        }
        fetchSuggestions();  
      }, [items.length]);



    const { user, isLoggedIn } = useUser();

    // === separate activeItems and completedItems ===
    const activeItems = items.filter(item => !item.checked || (item.checked && !item.completedAt));
    const completedItems = items
        .filter(item => item.checked && item.completedAt)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    useEffect(() => {
        if (isLoggedIn) {
            loadUserTodos();
        } else {
            loadLocalTodos();
        }
    }, [isLoggedIn]);

    // useEffect(() => {
    //     const user_list = activeItems.map(item => item.text);
    //     const all_items = items.map(item => item.text);
    //     recommendAPI.recommend(user_list, all_items).then(data => {
    //         setSuggestions(data.suggestions);
    //     });
    // }, [items]);

    // Load user data from database
    const loadUserTodos = async () => {
        console.log("Loading user todos");
        try {
            setIsLoading(true);
            const response = await todosAPI.getTodos(user.token);
            if (response.success) {
                setItems(response.todos);
                setIsEditing(new Array(response.todos.length).fill(false));
            }
        } catch (error) {
            console.error('Error loading todos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load temporary data from localStorage
   const loadLocalTodos = () => {
        console.log("Loading local todos");
        try {
            const savedItems = localStorage.getItem(STORAGE_KEYS.TODO_ITEMS);
            const savedEditing = localStorage.getItem(STORAGE_KEYS.EDITING_STATES);
            
            if (savedItems) {
                const parsedItems = JSON.parse(savedItems);
                setItems(parsedItems);
                
                if (savedEditing) {
                    const parsedEditing = JSON.parse(savedEditing);
                    setIsEditing(parsedEditing);
                } else {
                    // Initialize editing states for loaded items
                    setIsEditing(new Array(parsedItems.length).fill(false));
                }
            } else {
                // Initialize with empty state if no saved data
                setItems([{id: uuidv4(), text: "", checked: false}]);
                setIsEditing([true]);
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            // Fallback to default state
            setItems([{id: uuidv4(), text: "", checked: false}]);
            setIsEditing([true]);
        } finally {
            setIsLoading(false);
        }
    };

    // Save data to localStorage whenever items or editing states change
    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            try {
                localStorage.setItem(STORAGE_KEYS.TODO_ITEMS, JSON.stringify(items));
                localStorage.setItem(STORAGE_KEYS.EDITING_STATES, JSON.stringify(isEditing));
            } catch (error) {
                console.error('Error saving data to localStorage:', error);
            }
        }
    }, [items, isEditing, isLoading, isLoggedIn]);

    // Cleanup function for component unmount
    useEffect(() => {
        return () => {
            // Clear refs when component unmounts
            inputRefs.current = [];
        };
    }, []);

    // Add new item (only local state, API call in handleBlur)
    const handleAddItem = useCallback(async () => {
        const newItem = {id: uuidv4(), text: "", checked: false};
        setItems((prev) => [...prev, newItem]);
        setIsEditing((prev) => [...prev, true]);
        //         
        // if (isLoggedIn) {
        //     try {
        //         const response = await todosAPI.createTodo(user.token, {
        //             id: newItem.id,
        //             text: "",
        //             order: items.length
        //         });
        //         if (response.success) {
        //             // Update local data with server response
        //             setItems(prev => prev.map((item, index) => 
        //                 index === prev.length - 1 ? response.todo : item
        //             ));
        //         }
        //     } catch (error) {
        //         console.error('Error creating todo:', error);
        //     }
        // }
        
        // Use requestAnimationFrame instead of setTimeout for better performance
        requestAnimationFrame(() => {
            const lastIndex = items.length;
            inputRefs.current[lastIndex]?.focus();
        });
    }, [items.length, isLoggedIn, user?.token]);

    // Update item text (only local state, API call in handleBlur)
    const handleChange = useCallback((index, value) => {
        setItems((prev) => {
            const copy = [...prev];
            copy[index].text = value;
            return copy;
        });
    }, []);

    // Remove item
    const handleRemove = useCallback(async (indexToRemove) => {
        const itemToRemove = items[indexToRemove];
        
        setItems((prev) => prev.filter((_, index) => index !== indexToRemove));
        setIsEditing((prev) => prev.filter((_, index) => index !== indexToRemove));
        
        if (isLoggedIn && itemToRemove) {
            try {
                const itemId = itemToRemove.id;
                await todosAPI.deleteTodo(user.token, itemId);
            } catch (error) {
                console.error('Error deleting todo:', error);
            }
        }
        
        // Clean up the ref at the removed index
        inputRefs.current.splice(indexToRemove, 1);
    }, [isLoggedIn, user?.token, items]);

    // Handle blur event - update database when editing is finished
    const handleBlur = useCallback(async (index) => {
        if (items[index].text.trim() === "") {
            handleRemove(index);
        } else {
            setIsEditing((prev) => {
                const copy = [...prev];
                copy[index] = false;
                return copy;
            });

            // Update database when editing is finished
            if (isLoggedIn && items[index]) {
                try {
                    const item = items[index];
                    if (!item._id) {
                        // new item, send POST
                        const response = await todosAPI.createTodo(user.token, {
                            id: item.id,
                            text: item.text,
                            order: index
                        });
                        if (response.success) {
                            setItems(prev => prev.map((it, i) =>
                                i === index ? response.todo : it
                            ));
                        }
                    } else {
                        // existing item, send PUT
                        await todosAPI.updateTodoText(user.token, item.id, item.text);
                    }
                } catch (error) {
                    console.error('Error updating/creating todo:', error);
                }
            }
        }
    }, [items, handleRemove, isLoggedIn, user?.token]);

    const toggleEdit = useCallback((index) => {
        setIsEditing((prev) => {
            const copy = [...prev];
            copy[index] = true;
            return copy;
        });
    }, []);


    // Toggle check status with delay before moving to completed
    const toggleCheck = useCallback((index) => {
        const itemId = items[index].id;
        const isNowChecked = !items[index].checked;

        // clear previous timer (if any)
        if (pendingTimers.current[itemId]) {
            clearTimeout(pendingTimers.current[itemId]);
            delete pendingTimers.current[itemId];
        }

        setItems((prev) => {
            const newItems = prev.map((item, i) => {
                if (i === index) {
                    return { ...item, checked: isNowChecked, completedAt: isNowChecked ? item.completedAt : null };
                }
                return item;
            });
            return newItems;
        });

        if (isNowChecked) {
            // set delay timer
            pendingTimers.current[itemId] = setTimeout(() => {
                setItems((prev) => {
                    const newItems = prev.map((item, i) => {
                        if (i === index && item.checked && !item.completedAt) {
                            return { ...item, completedAt: new Date().toISOString() };
                        }
                        return item;
                    });
                    return newItems;
                });
                // sync to backend
                if (isLoggedIn && items[index]) {
                    todosAPI.updateTodoChecked(user.token, itemId, true, new Date().toISOString());
                }
                delete pendingTimers.current[itemId];
            }, 1000);
        } else {
            // immediately sync uncheck to backend
            if (isLoggedIn && items[index]) {
                todosAPI.updateTodoChecked(user.token, itemId, false, null);
            }
        }
    }, [isLoggedIn, user?.token, items]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    // Handle drag end event
    const handleDragEnd = useCallback(async (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = items.findIndex(item => item.id === active.id);
            const newIndex = items.findIndex(item => item.id === over.id);
            const newItems = arrayMove(items, oldIndex, newIndex);
            setItems(newItems);
            setIsEditing(arrayMove(isEditing, oldIndex, newIndex));

            if (isLoggedIn) {
                try {
                    const updates = newItems.map((item, index) => ({
                        id: item.id,
                        order: index
                    }));
                    await todosAPI.updateOrder(user.token, updates);
                } catch (error) {
                    console.error('Error updating order:', error);
                }
            }
        }
    }, [items, isEditing, isLoggedIn, user?.token]);

    // Optimized useEffect with proper cleanup
    useEffect(() => {
        const focusTimeout = setTimeout(() => {
            isEditing.forEach((edit, i) => {
                if (edit && inputRefs.current[i]) {
                    inputRefs.current[i].focus();
                }
            });
        }, 0);

        // Cleanup timeout on unmount or dependency change
        return () => clearTimeout(focusTimeout);
    }, [isEditing]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="max-w-md mx-auto mt-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading your lab tasks...</p>
                </div>
            </div>
        );
    }

    return ( 
        <div className="max-w-md mx-auto mt-6 space-y-1">
        <h2 className="text-xl font-bold mb-4">Lab Tasks</h2>
        
        <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={activeItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
          {activeItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
            <TodoItem
              key={item.id}
              id={item.id}
              index={items.indexOf(item)}
              item={item}
              isEditing={isEditing[items.indexOf(item)]}
              onChange={(value) => handleChange(items.indexOf(item), value)}
              onBlur={() => handleBlur(items.indexOf(item))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.target.blur();
                }
              }}
              onToggleEdit={() => toggleEdit(items.indexOf(item))}
              onRemove={() => handleRemove(items.indexOf(item))}
              onToggleCheck={() => toggleCheck(items.indexOf(item))}
              inputRef={(el) => (inputRefs.current[items.indexOf(item)] = el)}
            />
            </motion.div>
        ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>


{isEditing.length > 0 && isEditing[isEditing.length - 1] && activeItems.length > 0 && (
  <div className="flex gap-2 mt-1 mb-2">
    {suggestions.map((s, i) => (
      <button
        key={i}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-blue-200"
        onMouseDown={() => {
          handleChange(items.indexOf(activeItems[activeItems.length - 1]), s);
          //setTimeout(() => handleBlur(items.indexOf(activeItems[activeItems.length - 1])), 0);
        }}
        type="button"
      >
        {s}
      </button>
    ))}
  </div>
)}

        <button
            onClick={handleAddItem}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            ➕ Add Task
        </button>

        {/* Completed Tasks Section */}
        {completedItems.length > 0 && (
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Completed Tasks</h3>
                <div className="space-y-1">
                    {completedItems.map((item) => (
                        <TodoItem
                            key={item.id}
                            id={item.id}
                            index={items.indexOf(item)}
                            item={item}
                            isEditing={false}
                            onChange={() => {}}
                            onBlur={() => {}}
                            onKeyDown={() => {}}
                            onToggleEdit={() => {}}
                            onRemove={() => handleRemove(items.indexOf(item))}
                            onToggleCheck={() => toggleCheck(items.indexOf(item))}
                            inputRef={() => {}}
                        />
                    ))}
                </div>
            </div>
        )}
        </div>

     );
}
 
export default TodoList; 