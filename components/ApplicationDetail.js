"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import GeneratedOutputs from "@/components/GeneratedOutputs";
import ApplicationMaterials from "@/components/ApplicationMaterials";
import { STATUS_LABELS } from "@/lib/applicationConstants";

function formatDateTime(dateString) {
  if (!dateString) {
    return null;
  }
  return new Date(dateString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ApplicationDetail({ applicationId }) {
  const [application, setApplication] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplication = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/applications/${applicationId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load application.");
        setApplication(null);
        return;
      }

      setApplication(data.application);
      setMaterials(data.materials || []);
      setFeatures(data.features || null);
    } catch {
      setError("Network error. Please try again.");
      setApplication(null);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-16 justify-center text-base-content/70">
        <span className="loading loading-spinner loading-md" />
        <span>Loading application…</span>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body items-center text-center py-16">
          <p className="text-error mb-4">{error || "Application not found."}</p>
          <Link href="/applications" className="btn btn-primary">
            Back to applications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link
            href="/applications"
            className="text-sm text-base-content/50 hover:text-primary mb-3 inline-block"
          >
            ← Back to applications
          </Link>
          <h1 className="text-2xl font-bold">{application.company}</h1>
          <p className="text-base-content/70 mt-1">{application.jobTitle}</p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2 text-sm">
          <span className="badge badge-outline">
            {STATUS_LABELS[application.status] || application.status}
          </span>
          <span className="text-base-content/50">
            Created {formatDateTime(application.createdAt)}
          </span>
          {application.appliedAt && (
            <span className="text-base-content/50">
              Applied {formatDateTime(application.appliedAt)}
            </span>
          )}
        </div>
      </div>

      <GeneratedOutputs
        outputs={application.outputs}
        company={application.company}
        jobTitle={application.jobTitle}
      />

      <ApplicationMaterials
        applicationId={applicationId}
        materials={materials}
        features={features}
        company={application.company}
        jobTitle={application.jobTitle}
        onMaterialSaved={fetchApplication}
      />
    </div>
  );
}
