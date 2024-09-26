import { useState, useEffect } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

export default function TodoList() {
  const [todos, setTodos] = useState<Schema["Todo"]["type"][]>([]);

  const fetchTodos = async () => {
    try {
      const { data: items, errors } = await client.models.Todo.list();
      if (errors) {
        console.error("Errors fetching todos:", errors);
      } else {
        setTodos(items);
      }
    } catch (err) {
      console.error("Error fetching todos:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const createTodo = async () => {
    const content = window.prompt("Todo content?");
    if (content) {
      try {
        await client.models.Todo.create({
          content,
        });
        fetchTodos();
      } catch (error) {
        console.error("Error creating todo:", error);
      }
    }
  }

  return (
    <div>
      <button onClick={createTodo}>Add new todo</button>
      <ul>
        {todos.map(({ id, content }) => (
          <li key={id}>{content}</li>
        ))}
      </ul>
    </div>
  );
}