const kv = await Deno.openKv();

export async function insertSection(section) {
  const primaryKey = ["sections", section.crn];
  const bySubjectKey = ["sections_by_subject", section.subject, section.crn];
  await kv.atomic()
    .check({ key: primaryKey, versionstamp: null })
    .set(primaryKey, section)
    .set(bySubjectKey, section)
    .commit();
}

export function getSectionsBySubject(subject) {
  return Array.fromAsync(
    kv.list({ prefix: ["sections_by_subject", subject] }),
    (entry) => entry.value,
  );
}

export function getAllSections() {
  return Array.fromAsync(
    kv.list({ prefix: ["sections"] }),
    (entry) => entry.value,
  );
}
