"use client";
import { useEffect, useState } from "react";
import { Container, Typography, Box, Card, CardContent, Button, CircularProgress, Stack, Alert, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText } from "@mui/material";
import { useFirebase } from "../../layout";
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Snackbar from "@mui/material/Snackbar";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";

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
  const [snackbar, setSnackbar] = useState("");

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

  const handleMarkCompleted = async (task: any) => {
    // Update task status
    await updateDoc(doc(db, "tasks", task.id), { status: "completed" });
    // Increment student's XP
    if (task.assignedTo) {
      const studentRef = doc(db, "users", task.assignedTo);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        const currentXP = studentSnap.data().xpPoints || 0;
        await updateDoc(studentRef, { xpPoints: currentXP + 100 });
      }
    }
    setSnackbar("Task marked as completed and XP awarded!");
    // Refresh tasks
    const q = query(collection(db, "tasks"), where("postedBy", "==", user.uid));
    const snapshot = await getDocs(q);
    setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const openCount = tasks.filter(t => t.status === "open").length;
  const assignedCount = tasks.filter(t => t.status === "assigned").length;
  const completedCount = tasks.filter(t => t.status === "completed").length;

  if (loading) {
    return <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}><CircularProgress /></Container>;
  }
  if (error) {
    return <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>My Posted Tasks</Typography>
      <Divider sx={{ mb: 3 }} />
      <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: "#fff", textAlign: "center" }}>
        <Typography variant="subtitle1">Total Tasks: <b>{tasks.length}</b></Typography>
        <Typography variant="body2" sx={{ color: '#00A699', display: 'inline', mr: 2 }}>Open: {openCount}</Typography>
        <Typography variant="body2" sx={{ color: '#FF5A5F', display: 'inline', mr: 2 }}>Assigned: {assignedCount}</Typography>
        <Typography variant="body2" sx={{ color: '#484848', display: 'inline' }}>Completed: {completedCount}</Typography>
      </Paper>
      {tasks.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: "center", color: "#888" }}>
          <Typography>No tasks posted yet.</Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {tasks.map(task => (
            <Paper key={task.id} elevation={2} sx={{ p: 3, borderRadius: 3, bgcolor: "#fff" }}>
              <Typography variant="h6" fontWeight={600}>{task.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{task.description}</Typography>
              <Typography variant="caption" sx={{ color: task.status === 'open' ? '#00A699' : task.status === 'assigned' ? '#FF5A5F' : '#484848', fontWeight: 700 }}>
                Status: {task.status}
              </Typography>
              {task.status !== "open" && task.assignedTo && (
                <AssignedStudentInfo studentId={task.assignedTo} />
              )}
              {task.status === "open" && (
                <Typography variant="body2" sx={{ mt: 1, color: '#888' }}>Not assigned yet.</Typography>
              )}
              <Button variant="outlined" size="small" sx={{ ml: 2 }} onClick={() => handleViewApplicants(task)}>
                View Applicants
              </Button>
              <Button
                variant="contained"
                color="info"
                size="small"
                sx={{ ml: 2 }}
                onClick={() => handleMarkCompleted(task)}
                disabled={task.status !== "assigned"}
              >
                Mark as Completed
              </Button>
            </Paper>
          ))}
        </Stack>
      )}
      <Dialog open={!!selectedTask} onClose={() => setSelectedTask(null)} maxWidth="sm" fullWidth>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, bgcolor: "#fff" }}>
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
        </Paper>
      </Dialog>
      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar("")}
        message={snackbar}
      />
    </Container>
  );
}

// Helper component to show assigned student info
function AssignedStudentInfo({ studentId }: { studentId: string }) {
  const { db } = useFirebase();
  const [student, setStudent] = useState<any>(null);
  useEffect(() => {
    getDoc(doc(db, "users", studentId)).then(snap => {
      setStudent(snap.exists() ? snap.data() : null);
    });
  }, [db, studentId]);
  if (!student) return <Typography variant="body2" sx={{ mt: 1 }}>Loading student info...</Typography>;
  return (
    <Box sx={{ mt: 1, mb: 1, p: 1, bgcolor: '#FAFAFA', borderRadius: 2 }}>
      <Typography variant="body2" fontWeight={700}>Assigned Student:</Typography>
      <Typography variant="body2">Name: {student.name}</Typography>
      <Typography variant="body2">Email: {student.email}</Typography>
      <Typography variant="body2" sx={{ color: '#FF5A5F', fontWeight: 700 }}>XP: {student.xpPoints}</Typography>
    </Box>
  );
} 