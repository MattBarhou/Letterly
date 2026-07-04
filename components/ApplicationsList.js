"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { APPLICATION_STATUSES, STATUS_LABELS } from "@/lib/applicationConstants";

function formatDate(dateString) {
  if (!dateString) {
    return "—";
  }
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  const colorClass =
    status === "offer"
      ? "badge-success"
      : status === "rejected" || status === "withdrawn"
        ? "badge-ghost"
        : status === "applied"
          ? "badge-primary"
          : "badge-outline";

  return <span className={`badge badge-sm ${colorClass}`}>{label}</span>;
}

export default function ApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [features, setFeatures] = useState(null);
  const [historyLimited, setHistoryLimited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/applications");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load applications.");
        setApplications([]);
        return;
      }

      setApplications(data.applications || []);
      setFeatures(data.features || null);
      setHistoryLimited(data.historyLimited === true);
    } catch {
      setError("Network error. Please try again.");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        app.company.toLowerCase().includes(query) ||
        app.jobTitle.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [applications, search, statusFilter]);

  async function handleStatusChange(applicationId, status) {
    if (!features?.tracker) {
      return;
    }

    setUpdatingId(applicationId);

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update status.");
        return;
      }

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, ...data.application } : app
        )
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(applicationId) {
    if (!features?.canDeleteApplications) {
      return;
    }

    if (!window.confirm("Delete this application? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to delete application.");
        return;
      }

      setApplications((prev) => prev.filter((app) => app.id !== applicationId));
    } catch {
      setError("Network error. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-16 justify-center text-base-content/70">
        <span className="loading loading-spinner loading-md" />
        <span>Loading your applications…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {historyLimited && (
        <div className="alert alert-warning border border-warning/30">
          <span className="text-sm">
            Free plan shows your last 3 applications.{" "}
            <Link href="/pricing" className="link link-primary font-medium">
              Upgrade for unlimited history
            </Link>
            .
          </span>
        </div>
      )}

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search company or role…"
          className="input input-bordered w-full sm:max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select select-bordered w-full sm:w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body items-center text-center py-16">
            <h2 className="text-xl font-semibold mb-2">No applications yet</h2>
            <p className="text-base-content/70 max-w-md mb-6">
              Generate application materials and they&apos;ll appear here so you
              can track your search.
            </p>
            <Link href="/#generate" className="btn btn-primary">
              Generate materials
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover">
                  <td className="font-medium">{app.company}</td>
                  <td>{app.jobTitle}</td>
                  <td>
                    {features?.tracker ? (
                      <select
                        className="select select-bordered select-sm"
                        value={app.status}
                        disabled={updatingId === app.id}
                        onChange={(e) =>
                          handleStatusChange(app.id, e.target.value)
                        }
                      >
                        {APPLICATION_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={app.status} />
                    )}
                  </td>
                  <td className="text-sm text-base-content/60">
                    {formatDate(app.createdAt)}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/applications/${app.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        View
                      </Link>
                      {features?.canDeleteApplications && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-error"
                          onClick={() => handleDelete(app.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!features?.tracker && applications.length > 0 && (
        <p className="text-sm text-base-content/60 text-center">
          Upgrade to Starter to update application status and track your pipeline.{" "}
          <Link href="/pricing" className="link link-primary">
            View plans
          </Link>
        </p>
      )}
    </div>
  );
}
