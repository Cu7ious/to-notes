import { NavLink } from "react-router-dom";
import { useContext } from "react";
import styled from "@emotion/styled";

import { NotesContext } from "../context/NotesContext";
import { NoteType } from "../api/notesAPI";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { isAuthenticated } = useAuth();
  const { notes, isLoading, isError } = useContext(NotesContext);

  if (!isAuthenticated) {
    return <Aside />;
  }

  return (
    <Aside>
      <h1>Your Notes</h1>
      {isLoading && <h6>Loading...</h6>}
      {isError && <h6>Error loading notes</h6>}
      {notes && (
        <ul>
          {notes.map((note: NoteType) => (
            <li key={note._id}>
              <NavLink to={`/notes/${note._id}`}>{note.title}</NavLink>
            </li>
          ))}
        </ul>
      )}
    </Aside>
  );
}

const Aside = styled.aside`
  padding: 40px;
  border-right: 1px solid black;
  min-width: 250px;

  ul {
    list-style-type: none;
    padding: 0px;
  }
`;
