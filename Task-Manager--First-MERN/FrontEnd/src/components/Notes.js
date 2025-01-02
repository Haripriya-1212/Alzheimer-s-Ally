import React, { useEffect, useMemo, useState } from "react";
import { BiSearchAlt2 } from "react-icons/bi";
import "./styles/notes.css";
import Note from "./Note";
import axios from "axios";
import Aos from "aos";
import "aos/dist/aos.css";
axios.defaults.withCredentials = true;

const Notes = ({ toast }) => {
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch notes from backend on mount
  useEffect(() => {
    Aos.init({ duration: 1000 });
    fetchNotes(); // Fetch notes when component mounts
  }, []);

  // Function to fetch notes from backend
  const fetchNotes = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/note/getNote`)
      .then((res) => {
        setNotes(res.data);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to fetch notes");
      });
  };

  // Filter notes based on search query
  const filteredItems = useMemo(() => {
    return notes.filter((eachItem) => {
      return eachItem.title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [notes, searchQuery]);

  // Add a new note
  const addNote = (e) => {
    e.preventDefault();
    if (noteTitle === "") {
      toast.error("Please enter title");
      return;
    }

    const newNote = {
      title: noteTitle,
      noteText: "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString(),
    };

    // Send POST request to backend to create new note
    axios
      .post(`${process.env.REACT_APP_API_URL}/note/postNote`, newNote)
      .then((res) => {
        setNotes((prevNotes) => [...prevNotes, res.data]);
        setNoteTitle("");
        toast.success("Note created successfully");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to create note");
      });
  };

  return (
    <div className="notes-body" data-aos="zoom-in">
      <div className="search-bar">
        <h1>notes</h1>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          type="search"
          placeholder="Search"
        />
        <button id="search-bt">
          <BiSearchAlt2 size={22} />
        </button>
      </div>
      <form className="form-row">
        <input
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          type="text"
          className="todo-ip"
          placeholder="Enter title"
        />
        <button onClick={addNote} id="note-add-bt">
          {"+New Note"}
        </button>
      </form>
      <div className="notes-div" data-aos="zoom-out">
        {filteredItems.map((note) => (
          <Note
            key={note._id} // Using _id for backend note reference
            val={note}
            notes={notes}
            setNotes={setNotes}
            toast={toast}
            fetchNotes={fetchNotes} // Pass fetchNotes function for updates
          />
        ))}
      </div>
    </div>
  );
};

export default Notes;
