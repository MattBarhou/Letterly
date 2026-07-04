import { APPLICATION_STATUSES } from "@/lib/applicationConstants";
import { getSupabaseAdmin } from "@/lib/supabase";

const MAX_JOB_DESCRIPTION_LENGTH = 15000;

function trimJobDescription(text) {
  if (!text) {
    return "";
  }
  return text.length > MAX_JOB_DESCRIPTION_LENGTH
    ? text.slice(0, MAX_JOB_DESCRIPTION_LENGTH)
    : text;
}

export function isValidStatus(status) {
  return APPLICATION_STATUSES.includes(status);
}

export async function upsertUserProfile(userId, profile) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        user_id: userId,
        resume_text: profile.resumeText,
        default_tone: profile.defaultTone,
        default_years_experience: profile.defaultYearsExperience,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("upsertUserProfile error:", error);
    throw new Error("Failed to save profile.");
  }

  return data;
}

export async function getUserProfile(userId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("getUserProfile error:", error);
    return null;
  }

  return data;
}

export async function createApplication(userId, application) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: userId,
      company: application.company.trim(),
      job_title: application.jobTitle.trim(),
      job_description: trimJobDescription(application.jobDescription),
      job_url: application.jobUrl?.trim() || null,
      tone: application.tone,
      years_experience: application.yearsExperience,
      status: "saved",
      outputs: application.outputs,
    })
    .select()
    .single();

  if (error) {
    console.error("createApplication error:", error);
    throw new Error("Failed to save application.");
  }

  return data;
}

export async function listApplications(userId, { limit } = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("applications")
    .select(
      "id, company, job_title, job_url, status, tone, created_at, updated_at, applied_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("listApplications error:", error);
    throw new Error("Failed to load applications.");
  }

  return data || [];
}

export async function getApplication(userId, applicationId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("getApplication error:", error);
    throw new Error("Failed to load application.");
  }

  return data;
}

export async function updateApplicationStatus(userId, applicationId, status, appliedAt) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return null;
  }

  const updates = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (appliedAt !== undefined) {
    updates.applied_at = appliedAt;
  } else if (status === "applied") {
    updates.applied_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("applications")
    .update(updates)
    .eq("id", applicationId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("updateApplicationStatus error:", error);
    throw new Error("Failed to update application status.");
  }

  return data;
}

export async function deleteApplication(userId, applicationId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return false;
  }

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId)
    .eq("user_id", userId);

  if (error) {
    console.error("deleteApplication error:", error);
    throw new Error("Failed to delete application.");
  }

  return true;
}

export async function listApplicationMaterials(userId, applicationId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("application_materials")
    .select("*")
    .eq("application_id", applicationId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listApplicationMaterials error:", error);
    throw new Error("Failed to load application materials.");
  }

  return data || [];
}

export async function saveApplicationMaterial(userId, applicationId, type, content) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return null;
  }

  const { data: existing } = await supabase
    .from("application_materials")
    .select("id")
    .eq("application_id", applicationId)
    .eq("user_id", userId)
    .eq("type", type)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("application_materials")
      .update({ content })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("saveApplicationMaterial update error:", error);
      throw new Error("Failed to save material.");
    }

    return data;
  }

  const { data, error } = await supabase
    .from("application_materials")
    .insert({
      application_id: applicationId,
      user_id: userId,
      type,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("saveApplicationMaterial insert error:", error);
    throw new Error("Failed to save material.");
  }

  return data;
}

export function mapApplicationToClient(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    company: row.company,
    jobTitle: row.job_title,
    jobDescription: row.job_description,
    jobUrl: row.job_url,
    tone: row.tone,
    yearsExperience: row.years_experience,
    status: row.status,
    outputs: row.outputs,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    appliedAt: row.applied_at,
  };
}

export function mapProfileToClient(row) {
  if (!row) {
    return null;
  }

  return {
    resumeText: row.resume_text || "",
    defaultTone: row.default_tone || "Professional",
    defaultYearsExperience: row.default_years_experience || "0",
    updatedAt: row.updated_at,
  };
}
