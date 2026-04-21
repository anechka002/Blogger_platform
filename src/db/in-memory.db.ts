import {DB} from "./db.type";

export const db: DB = {
  blogs: [
    {
      id: "1",
      name: "Frontend Journey",
      description: "Blog about React, TypeScript, and frontend development.",
      websiteUrl: "https://frontend-journey.dev",
    },
    {
      id: "2",
      name: "Node Notes",
      description: "Blog about Node.js and backend development.",
      websiteUrl: "https://node-notes.dev",
    },
  ],
  posts: [],
}