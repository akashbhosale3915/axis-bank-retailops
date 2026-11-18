import { useCallback, useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  ActiveScreen,
  FilterState,
  ListingTab,
  SOPFileAttachment,
  SOPRecord,
  ToastMessage,
  UserProfile,
} from "./types/sop";
import {
  applyMakeChangesTransition,
  applyReviewDecision,
  applySaveAndSubmitSop,
  applySaveSop,
} from "./utils/sopRules";
import {
  loadActiveUser,
  loadSOPs,
  resetDemoData,
  saveActiveUser,
  saveSOPs,
} from "./utils/storage";
import { AccessDeniedScreen } from "./components/AccessDeniedScreen";
import { ConfirmModal } from "./components/ConfirmModal";
import { Header } from "./components/Header";
import { SopActivityDrawer } from "./components/SopActivityDrawer";
import { SopFormScreen } from "./components/SopFormScreen";
import { SopListingScreen } from "./components/SopListingScreen";
import { SopReviewScreen } from "./components/SopReviewScreen";
import { SopViewModal } from "./components/SopViewModal";
import { SsoLoginScreen } from "./components/SsoLoginScreen";
import { ToastContainer } from "./components/ToastContainer";

const simulateDelay = (ms = 240) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default function App() {
  const [sops, setSops] = useState<SOPRecord[]>(() => loadSOPs());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    loadActiveUser(),
  );

  const [screen, setScreen] = useState<ActiveScreen>({ name: "listing" });
  const [activeTab, setActiveTab] = useState<ListingTab>("my-sops");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    subCategory: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  const [viewingSop, setViewingSop] = useState<SOPRecord | null>(null);
  const [activitySopId, setActivitySopId] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [screen, currentUser?.id]);

  const pushToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-1), { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const persistSops = useCallback(
    (nextSops: SOPRecord[]): boolean => {
      const res = saveSOPs(nextSops);
      if (!res.ok) {
        pushToast({
          type: "error",
          title: "Storage Limit Reached",
          description: res.error,
        });
        return false;
      }
      setSops(nextSops);
      return true;
    },
    [pushToast],
  );

  const handleSwitchPersona = (user: UserProfile) => {
    setCurrentUser(user);
    saveActiveUser(user);
    setScreen({ name: "listing" });
    setActivitySopId(null);
    setActiveTab(user.role === "Reviewer" ? "for-review" : "my-sops");
    pushToast({
      type: "success",
      title: `Signed in as ${user.name}`,
      description: `Active persona: ${
        user.role === "Unassigned" ? "Unassigned User" : user.role
      }`,
    });
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    saveActiveUser(null);
    setScreen({ name: "listing" });
    setViewingSop(null);
    setActivitySopId(null);
    setToasts([]);
  };

  const handleResetDemo = () => {
    const fresh = resetDemoData();
    setSops(fresh);
    setScreen({ name: "listing" });
    setViewingSop(null);
    setActivitySopId(null);
    setResetConfirmOpen(false);
    pushToast({
      type: "success",
      title: "Demo Data Reset",
      description: "Restored all 18 seeded Axis Bank RetailOps SOPs.",
    });
  };

  const handleMakeChanges = (sopId: string) => {
    if (!currentUser) return;
    const target = sops.find((s) => s.id === sopId);
    if (!target || target.status !== "Requested Modification") return;

    const now = new Date().toISOString();
    const nextSops = applyMakeChangesTransition(sops, sopId, currentUser, now);

    if (persistSops(nextSops)) {
      setScreen({ name: "edit", sopId });
      pushToast({
        type: "info",
        title: `${sopId} opened for modification`,
        description: "Status updated to Modification In Progress.",
      });
    }
  };

  const handleSaveForm = async (
    payload: {
      name: string;
      category: string;
      subCategory: string;
      comments: string;
      file: SOPFileAttachment;
      fileReplaced: boolean;
    },
    sopIdToEdit?: string,
  ) => {
    if (!currentUser) return;
    await simulateDelay();
    const now = new Date().toISOString();
    const { nextSops, savedSopId } = applySaveSop(
      sops,
      payload,
      currentUser,
      now,
      sopIdToEdit,
    );

    if (persistSops(nextSops)) {
      const saved = nextSops.find((s) => s.id === savedSopId);
      setScreen({ name: "listing" });
      setActiveTab("my-sops");
      pushToast({
        type: "success",
        title: `${savedSopId} saved`,
        description: saved
          ? `Status: ${saved.status}.`
          : "Changes saved locally.",
      });
    }
  };

  const handleSaveAndSubmitForm = async (
    payload: {
      name: string;
      category: string;
      subCategory: string;
      comments: string;
      file: SOPFileAttachment;
      fileReplaced: boolean;
    },
    sopIdToEdit?: string,
  ) => {
    if (!currentUser) return;
    await simulateDelay();
    const now = new Date().toISOString();
    const {
      nextSops,
      submittedSopId,
      isResubmission,
      previousVersion,
      nextVersion,
    } = applySaveAndSubmitSop(sops, payload, currentUser, now, sopIdToEdit);

    if (persistSops(nextSops)) {
      setScreen({ name: "listing" });
      setActiveTab("my-sops");
      pushToast({
        type: "success",
        title: isResubmission
          ? `${submittedSopId} resubmitted (v${nextVersion})`
          : `${submittedSopId} submitted for review`,
        description: isResubmission
          ? `Version incremented from v${previousVersion} to v${nextVersion}.`
          : "Reviewers can now evaluate this SOP in For My Review.",
      });
    }
  };

  const handleReviewDecision = async (
    sopId: string,
    decision: "Approved" | "Requested Modification" | "Rejected",
    remarks: string,
  ) => {
    if (!currentUser || currentUser.role !== "Reviewer") return;
    await simulateDelay();
    const now = new Date().toISOString();
    const result = applyReviewDecision(
      sops,
      sopId,
      decision,
      remarks,
      currentUser,
      now,
    );

    if (!result.ok) {
      pushToast({
        type: "error",
        title: "Review Action Blocked",
        description: result.error,
      });
      return;
    }

    const target = sops.find((s) => s.id === sopId);
    if (persistSops(result.nextSops)) {
      setScreen({ name: "listing" });
      setActiveTab("for-review");
      pushToast({
        type:
          decision === "Approved"
            ? "success"
            : decision === "Requested Modification"
              ? "warning"
              : "error",
        title:
          decision === "Approved"
            ? `${sopId} Approved & Published`
            : decision === "Requested Modification"
              ? `Modification Requested on ${sopId}`
              : `${sopId} Rejected`,
        description:
          decision === "Approved"
            ? "SOP is now published to the GRAP knowledge base."
            : decision === "Requested Modification"
              ? `Returned to ${target?.uploadedByName ?? "creator"} for updates.`
              : "SOP has been marked Rejected.",
      });
    }
  };

  if (!currentUser) {
    return (
      <>
        <SsoLoginScreen onSelectPersona={handleSwitchPersona} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  const editingSop =
    screen.name === "edit"
      ? sops.find((s) => s.id === screen.sopId)
      : undefined;

  const reviewingSop =
    screen.name === "review"
      ? sops.find(
          (s) =>
            s.id === screen.sopId &&
            currentUser.role === "Reviewer" &&
            s.uploadedByEmail !== currentUser.email,
        )
      : undefined;

  const activitySop = activitySopId
    ? (sops.find((s) => s.id === activitySopId) ?? null)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6F8]">
      <Header
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onResetDemo={() => setResetConfirmOpen(true)}
        onGoHome={() => setScreen({ name: "listing" })}
      />

      <main className="flex-1 mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6">
        {currentUser.role === "Unassigned" ? (
          <AccessDeniedScreen
            currentUser={currentUser}
            onSignOut={handleSignOut}
          />
        ) : screen.name === "add" ? (
          <SopFormScreen
            mode="add"
            onSaveDraftOrInProgress={(p) => handleSaveForm(p)}
            onSaveAndSubmit={(p) => handleSaveAndSubmitForm(p)}
            onCancel={() => setScreen({ name: "listing" })}
          />
        ) : screen.name === "edit" && editingSop ? (
          <SopFormScreen
            mode="edit"
            existingSop={editingSop}
            onSaveDraftOrInProgress={(p) => handleSaveForm(p, editingSop.id)}
            onSaveAndSubmit={(p) => handleSaveAndSubmitForm(p, editingSop.id)}
            onCancel={() => setScreen({ name: "listing" })}
          />
        ) : screen.name === "review" && reviewingSop ? (
          <SopReviewScreen
            sop={reviewingSop}
            onApprove={(r) =>
              handleReviewDecision(reviewingSop.id, "Approved", r)
            }
            onRequestModification={(r) =>
              handleReviewDecision(reviewingSop.id, "Requested Modification", r)
            }
            onReject={(r) =>
              handleReviewDecision(reviewingSop.id, "Rejected", r)
            }
            onOpenActivity={(sopId) => setActivitySopId(sopId)}
            onBack={() => setScreen({ name: "listing" })}
          />
        ) : (
          <SopListingScreen
            sops={sops}
            currentUser={currentUser}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            filters={filters}
            onChangeFilters={setFilters}
            onAddSop={() => setScreen({ name: "add" })}
            onViewSop={(sop) => setViewingSop(sop)}
            onOpenActivity={(sopId) => setActivitySopId(sopId)}
            onEditSop={(sopId) => setScreen({ name: "edit", sopId })}
            onMakeChanges={handleMakeChanges}
            onReviewSop={(sopId) => setScreen({ name: "review", sopId })}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-3.5 px-4 sm:px-6 text-xs text-slate-500">
        <div className="mx-auto max-w-[1440px] flex flex-wrap items-center justify-between gap-2">
          <span>
            &copy; {new Date().getFullYear()} Axis Bank Limited · RetailOps –
            GRAP SOP Governance Portal
          </span>
          <button
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 font-semibold text-[#97144D] hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Demo Data
          </button>
        </div>
      </footer>

      <SopViewModal
        sop={viewingSop}
        onClose={() => setViewingSop(null)}
        onOpenActivity={(sopId) => setActivitySopId(sopId)}
      />

      <SopActivityDrawer
        sop={activitySop}
        onClose={() => setActivitySopId(null)}
      />

      <ConfirmModal
        open={resetConfirmOpen}
        title="Reset Demo Data?"
        message="This will clear any newly created or modified SOPs in your browser's localStorage and restore the 18 default Axis Bank RetailOps demo SOPs."
        confirmLabel="Reset Demo Data"
        variant="primary"
        onConfirm={handleResetDemo}
        onCancel={() => setResetConfirmOpen(false)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
