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
  posts: [
    {
      id: "1",
      title: "Getting Started with React",
      shortDescription: "React basics for beginners.",
      content: "Long post text...",
      blogId: "1",
      blogName: "Frontend Journey",
    },
    {
      id: "2",
      title: "Understanding Express Routing",
      shortDescription: "How routing works in Express.",
      content: "Long post text...",
      blogId: "2",
      blogName: "Node Notes",
    },
  ],
}