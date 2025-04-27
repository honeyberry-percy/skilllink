"use client";
import { useEffect, useState } from "react";
import { useFirebase } from "../../layout";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { Container, Typography, Box, Chip, CircularProgress, Button, Alert } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";

export default function TaskDetailsPage() {
  const { db, auth } = useFirebase();
  const params = useParams();
  const taskId = params.taskId as string;
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [applyError, setApplyError] = useState("");
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      const docRef = doc(db, "tasks", taskId);
      const docSnap = await getDoc(docRef);
      setTask(docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null);
      setLoading(false);
    };
    if (taskId) fetchTask();
  }, [db, taskId]);

  const handleApply = async () => {
    setApplyError("");
    if (!user) {
      setApplyError("You must be logged in as a student to apply.");
      return;
    }
    // Only students can apply
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists() || userDoc.data().type !== "student") {
      setApplyError("Only students can apply for tasks.");
      return;
    }
    // Create application
    try {
      await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, studentId: user.uid })
      });
      setApplied(true);
    } catch (err: any) {
      setApplyError("Failed to apply. Please try again.");
    }
  };

  if (loading) {
    return <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}><CircularProgress /></Container>;
  }
  if (!task) {
    return <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}><Typography>Task not found.</Typography></Container>;
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>{task.title}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>{task.description}</Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        {task.requiredSkills && task.requiredSkills.map((skill: string, idx: number) => (
          <Chip key={idx} label={skill} color="secondary" />
        ))}
      </Box>
      <Typography variant="subtitle1" color="primary">Status: {task.status}</Typography>
      {applyError && <Alert severity="error" sx={{ mt: 2 }}>{applyError}</Alert>}
      {applied && <Alert severity="success" sx={{ mt: 2 }}>Application submitted!</Alert>}
      {user && task.status === "open" && (
        <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleApply} disabled={applied}>
          {applied ? "Applied" : "Apply for Task"}
        </Button>
      )}
    </Container>
  );
} 