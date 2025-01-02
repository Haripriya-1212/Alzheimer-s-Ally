import React, { useEffect, useState, useRef } from "react";
import { BiSolidSave, BiEdit } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";
import Dialog from "./SrNoDialog/Dialog";
import axios from "axios";
import Aos from "aos";
import "aos/dist/aos.css";

const Note = (props) => {
  const { val, notes, setNotes, toast } = props;
  const [dialog, setDialog] = useState({ isLoading: false });
  const [text, setText] = useState(val.noteText);
  const textareaRef = useRef();
  const idRef = useRef();

  axios.defaults.withCredentials = true;

  useEffect(() => {
    Aos.init({ duration: 600 });
  }, []);

  // Fetch latest notes from backend
  const fetchNotes = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/note/getNotes`)
      .then((response) => {
        setNotes(response.data);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to fetch notes");
      });
  };

  // Delete a note
  const deleteNote = (id) => {
    setDialog({ isLoading: true });
    idRef.current = id;
  };

  // Confirmation for deleting a note
  const areYouSure = (yes) => {
    if (yes) {
      axios
        .delete(`${process.env.REACT_APP_API_URL}/note/deleteNote/${idRef.current}`)
        .then(() => {
          setDialog({ isLoading: false });
          toast.success("Deleted Successfully");
          fetchNotes(); // Re-fetch notes after deletion
        })
        .catch((err) => {
          console.log(err);
          toast.error("Failed to delete note");
          setDialog({ isLoading: false });
        });
    } else {
      setDialog({ isLoading: false });
    }
  };

  // Save the updated note
  const saveNote = async (id) => {
    const updatedNote = {
      ...val,
      noteText: text,
    };

    // Send PATCH request to backend to update the note
    axios
      .patch(`${process.env.REACT_APP_API_URL}/note/updateNote/${id}`, updatedNote)
      .then(() => {
        toast.success("Saved Successfully");
        setText(updatedNote.noteText); // Update the local state for text
        fetchNotes(); // Re-fetch notes after saving
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to save note");
      });
  };

  const typing = (e) => {
    setText(e.target.value);
  };

  function focusBtn() {
    textareaRef.current.focus();
  }

  return (
    <>
      <div className="note-body" data-aos="fade-up">
        {dialog.isLoading && <Dialog areYouSure={areYouSure} />}
        <div className="note-head">
          <button
            className="note-bt"
            onClick={() => saveNote(val._id)}
            aria-label="Save Note"
          >
            <BiSolidSave color="#f7efe5" size={20} />
          </button>
          <button
            className="note-bt"
            onClick={focusBtn}
            aria-label="Edit Note"
          >
            <BiEdit color="#f7efe5" size={20} />
          </button>
          <button
            onClick={() => deleteNote(val._id)}
            className="note-bt"
            aria-label="Delete Note"
          >
            <AiFillDelete color="#f7efe5" size={20} />
          </button>
        </div>
        <h3 id="note-title">{`${val.title}`}</h3>
        <textarea
          ref={textareaRef}
          value={text}
          spellCheck="false"
          onChange={typing}
          onFocus={(event) =>
            event.currentTarget.setSelectionRange(
              event.currentTarget.value.length,
              event.currentTarget.value.length
            )
          }
        ></textarea>
        <div className="note-foot">
          <h3 className="date">{`${val.date}`}</h3>
          <h3 className="time">{`${val.time}`}</h3>
        </div>
      </div>
    </>
  );
};

export default Note;
