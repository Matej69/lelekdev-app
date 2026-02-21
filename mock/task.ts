import { TaskModel } from "@/components/protected/tasks/model";

export const mockTasks: TaskModel[] = [
  {
    id: "8f14e45f-ea2b-4c6b-b3f8-5c2e8b7f1234",
    ownerId: "c56a4180-65aa-42ec-a945-5fd21dec0538",
    items: [
      { id: "a1f5c2e1-8f1c-4f34-9a6f-123456789abc", content: "Buy groceries", completed: false },
      { id: "b2d6e3f1-7a1b-4b12-9b6c-abcdef123456", content: "Walk the dog", completed: true },
    ],
  },
  {
    id: "9e24d7b1-b2c4-4a8f-85f9-6a2d9c7f5678",
    ownerId: "d14b3180-65aa-42ec-a945-5fd21dec0549",
    items: [
      { id: "c3e7f2d1-9b1c-4c56-8a7f-23456789abcd", content: "Finish project report", completed: false },
    ],
  },
  {
    id: "s34d4180-65aa-42ec-a945-5fd21dec0670",
    ownerId: "f34d4180-65aa-42ec-a945-5fd21dec0670",
    items: [
      { id: undefined, content: "Plan vacation", completed: false },
      { id: undefined, content: "Book flights", completed: false },
      { id: undefined, content: "Reserve hotel", completed: false },
    ],
  },
  {
    id: "1a2b3c4d-5e6f-7a8b-9c0d-123456abcdef",
    ownerId: "e56b4180-65aa-42ec-a945-5fd21dec0781",
    items: [
      { id: "d4e5f6a7-b8c9-4d12-9a3b-56789abcdef0", content: "Read a book", completed: true },
      { id: "e5f6a7b8-c9d0-4e12-8b3c-6789abcdef12", content: "Exercise", completed: false },
    ],
  },
];