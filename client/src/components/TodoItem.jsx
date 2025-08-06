import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const TodoItem = ({
  id,
  index,
  item,
  isEditing,
  onChange,
  onBlur,
  onToggleEdit,
  onRemove,
  onToggleCheck,
  inputRef,
  onKeyDown,
  
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: "grid",
    gridTemplateColumns: "auto 1fr auto auto",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem",
    borderBottom: "1.5px solid #ccc",
    background: "#fff",
    border: isDragging ? "2px solid #3b82f6" : "2px solid #ccc", 
    background: isDragging ? "#f0f9ff" : "#fff", 
    borderRadius: "0.375rem",
    boxShadow: isDragging ? "0 0 6px rgba(59,130,246,0.5)" : "none",
  };


  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {/* Checkbox container - always takes space, but may be invisible */}
        <div className="w-4 h-4 flex items-center justify-center">
          {item.text && !(item.checked && item.completedAt) &&
            <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => {
                    e.stopPropagation();
                    onToggleCheck();
                }}
                onClick={(e) => e.stopPropagation()}
                className="mr-2"
                id={`checkbox-${item.id}`}
                name={`checkbox-${item.id}`}
            />
          }
        </div>

        {/* Content area - input field or text */}
        <div className="flex-1">
          {isEditing ? (
            <input
              ref={inputRef}
              value={item.text}
              onPointerDown={e => e.stopPropagation()}
              onChange={(e) => onChange(e.target.value)}
              onBlur={() => onBlur(index)}
              onKeyDown={onKeyDown}
              className="border p-1 rounded w-full"
              id={`input-${item.id}`}
              name={`item-${index}`}
              placeholder={`Task ${index + 1}`}
            />
          ) : (
            <div>{item.text}</div>
          )}
            {/* Finished time below content */}
            {item.checked && item.completedAt && (
                <span className="text-xs text-gray-500 mt-1 block">
                Finished at {new Date(item.completedAt).toLocaleString('en-US', { hour12: false })}
                </span>
            )}
        </div>

        {/* Edit button container - always takes space, but may be invisible */}
        <div className="w-12 h-6 flex items-center justify-center">
          {item.text && !item.checked && (
            <button
              onClick={(e) => {
                  e.stopPropagation();
                  onToggleEdit();
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              {isEditing ? "" : "Edit"}
            </button>
          )}
          {/* {item.checked && item.completedAt && (
            <span className="text-xs text-gray-500">
              Finished at {new Date(item.completedAt).toLocaleString('en-US', { hour12: false })}
            </span>
          )} */}
        </div>

        {/* Delete button container - always takes space, but may be invisible */}
        <div className="w-16 h-6 flex items-center justify-center">
          {item.text && (
            <button
              onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
              }}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          )}
        </div>
    </div>
  );
};

export default TodoItem; 