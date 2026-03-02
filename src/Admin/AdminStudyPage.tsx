import React, { useCallback, useRef, useState } from "react";
import { AlertTriangle, School } from "lucide-react";
import { Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdmin } from "./AdminContext";
import StudySection from "./components/sections/StudySection";
import type { ConfirmAction } from "./components/sections/types";
import ThemeToggleButton from "../Components/ThemeToggleButton";

const AdminStudyPage: React.FC = () => {
  const { isAdmin, isLoaded } = useAdmin();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
  }>({
    open: false,
    title: "Confirm Action",
    message: "",
    confirmText: "Delete",
    cancelText: "Cancel",
  });
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);

  const closeConfirmDialog = useCallback((result: boolean) => {
    confirmResolverRef.current?.(result);
    confirmResolverRef.current = null;
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const confirmAction: ConfirmAction = useCallback(
    ({
      title = "Please Confirm",
      message,
      confirmText = "Delete",
      cancelText = "Cancel",
    }) =>
      new Promise<boolean>((resolve) => {
        confirmResolverRef.current = resolve;
        setConfirmDialog({
          open: true,
          title,
          message,
          confirmText,
          cancelText,
        });
      }),
    [],
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] theme-text-1 flex items-center justify-center">
        Loading study studio...
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] theme-text-1 px-4 py-6 md:px-8 md:py-10">
      <ToastContainer position="top-right" />
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 rounded-3xl border border-[var(--border-1)] bg-gradient-to-r from-[var(--surface-1)] via-[var(--surface-2)] to-[var(--surface-1)] p-4 md:p-5 shadow-[0_14px_40px_var(--accent-soft)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold inline-flex items-center gap-2">
                <School className="text-[var(--accent-1)]" size={28} />
                Study Studio
              </h1>
            </div>

            <ThemeToggleButton />
          </div>
        </div>

        <StudySection confirmAction={confirmAction} />
      </div>

      {confirmDialog.open && (
        <div className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-300/50 bg-[var(--surface-1)] shadow-[0_25px_80px_rgba(0,0,0,0.45)] overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-red-500/25 to-rose-500/25 border-b border-red-300/40">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={18} />
                <h3 className="font-semibold theme-text-1">{confirmDialog.title}</h3>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="theme-text-2 text-sm leading-relaxed">{confirmDialog.message}</p>
            </div>
            <div className="px-5 pb-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => closeConfirmDialog(false)}
                className="rounded-lg px-4 py-2 border border-[var(--border-1)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition theme-text-1"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                onClick={() => closeConfirmDialog(true)}
                className="rounded-lg px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-95 transition text-white"
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudyPage;
