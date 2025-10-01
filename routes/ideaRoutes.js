import express from "express";
const router = express.Router();

// @route   GET /api/ideas
// @desc    Get all ideas
// @access  Public
router.get("/", (req, res) => {
  const ideas = [
    { id: 1, title: "Idea 1", description: "This is the first idea" },
    { id: 2, title: "Idea 2", description: "This is the second idea" },
    { id: 3, title: "Idea 3", description: "This is the third idea" },
  ];
  res.status(400);
  throw new Error("Something went wrong");

  res.json(ideas);
});

// @route   POST /api/ideas
// @desc    Create a new idea
// @access  Private
router.post("/", (req, res) => {
  const data = req.body;
  res.send(data);
});

export default router;
