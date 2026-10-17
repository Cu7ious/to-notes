import { z } from "zod";
import useSWR, { mutate } from "swr";
import axios from "axios";

import { getJWT } from "./utils";

const NoteSchema = z.object({
  _id: z.string().nonempty("ID is required"),
  title: z.string().nonempty("Title is required"),
  content: z.string().optional(),
});

export type NoteType = z.infer<typeof NoteSchema>;

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const notesUrl = import.meta.env.VITE_API_NOTES_URL || "/api/notes";
const API_URL = baseUrl + notesUrl;

export async function fetchNotes() {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${getJWT()}`,
    },
  });
  return response.data;
}

export async function fetchNoteById(_id: z.infer<typeof NoteSchema>["_id"]) {
  const response = await axios.get(`${API_URL}/${_id}`, {
    headers: {
      Authorization: `Bearer ${getJWT()}`,
    },
  });
  return response.data;
}

// Create a new note
export async function createNote(note: Omit<NoteType, "_id">) {
  const response = await axios.post(API_URL, note, {
    headers: {
      Authorization: `Bearer ${getJWT()}`,
    },
  });
  mutate(API_URL);
  return response.data;
}

// Update a note by ID
export async function updateNote(id: string, note: Omit<NoteType, "_id">) {
  const response = await axios.put(`${API_URL}/${id}`, note, {
    headers: {
      Authorization: `Bearer ${getJWT()}`,
    },
  });
  mutate(`${API_URL}/${id}`);
  mutate(API_URL);
  return response.data;
}

// Delete a note by ID
export async function deleteNote(id: z.infer<typeof NoteSchema>["_id"]) {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${getJWT()}`,
    },
  });
  mutate(`${API_URL}/${id}`);
  mutate(API_URL);
  return response.data;
}

const skipUnauthorizedRetry = (error: unknown) =>
  !(axios.isAxiosError(error) && error.response?.status === 401);

export function useNotes(enabled = true) {
  const { data, error, isLoading } = useSWR(enabled ? API_URL : null, fetchNotes, {
    shouldRetryOnError: skipUnauthorizedRetry,
  });
  return {
    notes: data,
    isLoading,
    isError: error,
  };
}

export function useNote(_id: z.infer<typeof NoteSchema>["_id"]) {
  const { data, error, isLoading } = useSWR(`${API_URL}/${_id}`, () => fetchNoteById(_id), {
    shouldRetryOnError: skipUnauthorizedRetry,
  });
  return {
    note: data,
    isLoading,
    isError: error,
  };
}
