import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase/firestore";
import { app } from "../../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: NextRequest) {
  const db = getFirestore(app);
  const { taskId, studentId } = await req.json();
  if (!taskId || !studentId) {
    return NextResponse.json({ error: "Missing taskId or studentId" }, { status: 400 });
  }
  try {
    await addDoc(collection(db, "applications"), {
      taskId,
      studentId,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
  }
} 