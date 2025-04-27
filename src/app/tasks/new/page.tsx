"use client";
import { useState, useEffect } from "react";
import { Container, Typography, Box, TextField, Button, Alert } from "@mui/material";
import { useFirebase } from "../../layout";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function NewTaskPage() {
  const { db, auth } = useFirebase();
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [reward, setReward] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, [auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!user) {
      setError("You must be logged in as a company to post a task.");
      return;
    }
    // Only companies can post
    const userDoc = await import("firebase/firestore").then(m => m.getDoc(m.doc(db, "users", user.uid)));
    if (!userDoc.exists() || userDoc.data().type !== "company") {
      setError("Only companies can post tasks.");
      return;
    }
    try {
      await addDoc(collection(db, "tasks"), {
        title,
        description,
        requiredSkills: requiredSkills.split(",").map(s => s.trim()).filter(Boolean),
        reward,
        postedBy: user.uid,
        status: "open",
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTitle("");
      setDescription("");
      setRequiredSkills("");
      setReward("");
    } catch (err: any) {
      setError("Failed to post task. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Post a New Task</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Task posted successfully!</Alert>}
        <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} required fullWidth />
        <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} required fullWidth multiline minRows={3} />
        <TextField label="Required Skills (comma separated)" value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} required fullWidth />
        <TextField label="Reward (optional)" value={reward} onChange={e => setReward(e.target.value)} fullWidth />
        <Button type="submit" variant="contained" color="primary" size="large">Post Task</Button>
      </Box>
    </Container>
  );
} 