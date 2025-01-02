const mongoose = require("mongoose");
const dataDatabase = mongoose.createConnection(process.env.MONGO_URL);
const todoSchema = new mongoose.Schema(
  {
    todoId: { type: String },
    title: { type: String },
    status: { type: Boolean },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    id: { type: String }, // Unique ID for the note
    title: { type: String }, // Title of the note
    noteText: { type: String }, // Text content of the note
    date: { type: String }, // Date information
    time: { type: String }, // Time information
    profiles: [
      {
        name: { type: String, required: true }, // Name of the person
        relation: { type: String, required: true }, // Relation of the person
        picture: { type: String, required: true }, // Picture URL or file path
      },
    ], // Array of profiles
  },
  { _id: false } // Prevents creation of a default `_id` field for the note schema
);


const currTaskSchema = new mongoose.Schema(
  {
    id: { type: String }, // Task ID
    task: {
      taskName: { type: String }, // Task name
      priority: { type: String }, // Task priority
      deadline: { type: String }, // Deadline date
    },
    done: { type: Boolean }, // Status of the task (done or not)
  },
  { _id: false }
);

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Authentication', // Reference to the User model
    required: true,
  },
  todos: { type: [todoSchema] }, // Todos array
  notes: { type: [noteSchema] }, // Notes array
  tasks: { type: [currTaskSchema] }, // Tasks array
});

module.exports = dataDatabase.model("UserData", schema);
