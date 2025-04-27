"use client";
import { useEffect, useState } from "react";
import { Container, Typography, Box, Card, CardContent, Button, CircularProgress, Stack, Alert, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText } from "@mui/material";
import { useFirebase } from "../../layout";
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function MyTasksPage() {
  const { db, auth } = useFirebase();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        setProfile(userDoc.exists() ? userDoc.data() : null);
      }
    });
    return () => unsubscribe();
  }, [auth, db]);

  useEffect(() => {
    if (!user || !profile) return;
    if (profile.type !== "company") {
      setError("Only companies can view their posted tasks.");
      setLoading(false);
      return;
    }
    const fetchTasks = async () => {
      setLoading(true);
      const q = query(collection(db, "tasks"), where("postedBy", "==", user.uid));
      const snapshot = await getDocs(q);
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchTasks();
  }, [user, profile, db]);

  const handleViewApplicants = async (task: any) => {
    setSelectedTask(task);
    setApplicantsLoading(true);
    const q = query(collection(db, "applications"), where("taskId", "==", task.id));
    const snapshot = await getDocs(q);
    const applicantsData = await Promise.all(snapshot.docs.map(async (appDoc) => {
      const appData = appDoc.data();
      const studentDoc = await getDoc(doc(db, "users", appData.studentId));
      return {
        id: appDoc.id,
        ...appData,
        student: studentDoc.exists() ? studentDoc.data() : { name: "Unknown" },
      };
    }));
    setApplicants(applicantsData);
    setApplicantsLoading(false);
  };

  const handleAssign = async (application: any) => {
    if (!selectedTask) return;
    // Update task status and assignedTo
    await updateDoc(doc(db, "tasks", selectedTask.id), {
      status: "assigned",
      assignedTo: application.studentId,
    });
    // Update application status
    await updateDoc(doc(db, "applications", application.id), {
      status: "accepted",
    });
    setSelectedTask(null);
    // Refresh tasks
    const q = query(collection(db, "tasks"), where("postedBy", "==", user.uid));
    const snapshot = await getDocs(q);
    setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  if (loading) {
    return <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}><CircularProgress /></Container>;
  }
  if (error) {
    return <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>My Posted Tasks</Typography>
      {tasks.length === 0 ? (
        <Typography>No tasks posted yet.</Typography>
      ) : (
        <Stack spacing={3}>
          {tasks.map(task => (
            <Card key={task.id} variant="outlined">
              <CardContent>
                <Typography variant="h6" fontWeight={600}>{task.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{task.description}</Typography>
                <Typography variant="caption" color="primary">Status: {task.status}</Typography>
                <Button variant="outlined" size="small" sx={{ ml: 2 }} onClick={() => handleViewApplicants(task)}>
                  View Applicants
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      <Dialog open={!!selectedTask} onClose={() => setSelectedTask(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Applicants for: {selectedTask?.title}</DialogTitle>
        <DialogContent>
          {applicantsLoading ? <CircularProgress /> : (
            <List>
              {applicants.length === 0 ? <ListItem><ListItemText primary="No applicants yet." /></ListItem> :
                applicants.map(app => (
                  <ListItem key={app.id} secondaryAction={app.status === "pending" && (
                    <Button variant="contained" color="primary" onClick={() => handleAssign(app)}>
                      Assign
                    </Button>
                  )}>
                    <ListItemText
                      primary={app.student.name}
                      secondary={`Status: ${app.status}`}
                    />
                  </ListItem>
                ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTask(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 