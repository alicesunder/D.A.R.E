/**
 * Phase 9: canonical registry collection names and runtime validation.
 *
 * This module deliberately does not query Firestore. The current Firestore
 * rules deny registry collections, so reads/writes must wait until rules and
 * role claims are designed and tested.
 */
import type {
  Activity,
  Assignment,
  MediaNews,
  Organization,
  Personnel,
  School,
} from '../types';

export const REGISTRY_COLLECTIONS = {
  organizations: 'organizations',
  personnel: 'personnel',
  schools: 'schools',
  assignments: 'assignments',
  activities: 'activities',
  news: 'news',
} as const;

export type RegistryCollection = keyof typeof REGISTRY_COLLECTIONS;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);

export function validateOrganization(value: unknown): value is Organization {
  return isObject(value)
    && isString(value.id) && isString(value.code) && isString(value.name)
    && isString(value.shortName) && ['hq', 'region', 'subdivision', 'company'].includes(String(value.level))
    && (value.parentId === null || isString(value.parentId))
    && isString(value.province) && typeof value.active === 'boolean';
}

export function validatePersonnel(value: unknown): value is Personnel {
  return isObject(value)
    && isString(value.id) && isString(value.firstName) && isString(value.lastName)
    && isString(value.policeId) && isString(value.organizationId)
    && ['active', 'leave', 'transferred', 'inactive'].includes(String(value.status))
    && isNumber(value.certifiedYear) && isStringArray(value.assignedSchoolIds)
    && isNumber(value.assignedSchoolCount) && isNumber(value.totalActivitiesConducted);
}

export function validateSchool(value: unknown): value is School {
  return isObject(value)
    && isString(value.id) && isString(value.code) && isString(value.name)
    && ['bpp_school', 'obec_primary', 'obec_expansion', 'private', 'municipal'].includes(String(value.type))
    && isString(value.province) && isString(value.district) && isString(value.subdistrict)
    && isString(value.organizationId) && isStringArray(value.assignedPersonnelIds)
    && ['assigned', 'unassigned', 'pending'].includes(String(value.assignmentStatus))
    && isNumber(value.totalStudents) && isNumber(value.totalActivities);
}

export function validateAssignment(value: unknown): value is Assignment {
  return isObject(value)
    && isString(value.id) && isString(value.personnelId) && isString(value.schoolId)
    && isString(value.organizationId) && isString(value.startDate)
    && ['active', 'ended', 'transferred'].includes(String(value.status))
    && isString(value.academicYear) && isString(value.assignedBy);
}

export function validateActivity(value: unknown): value is Activity {
  return isObject(value)
    && isString(value.id) && isString(value.code) && isString(value.title)
    && isString(value.organizationId) && isString(value.schoolId)
    && isString(value.date) && isString(value.fiscalYear)
    && isStringArray(value.instructorIds) && isNumber(value.studentCount)
    && isStringArray(value.photoUrls)
    && ['draft', 'submitted', 'pending_approval', 'approved', 'in_progress', 'completed', 'revision_requested', 'cancelled'].includes(String(value.status));
}

export function validateMediaNews(value: unknown): value is MediaNews {
  return isObject(value)
    && isString(value.id) && isString(value.title)
    && ['news', 'activity', 'knowledge', 'announcement'].includes(String(value.category))
    && isString(value.summary) && isString(value.content)
    && isString(value.imageUrl) && isString(value.publishedAt)
    && ['draft', 'published', 'archived'].includes(String(value.status))
    && isString(value.author) && isNumber(value.views);
}

export function validateRegistryDocument(
  collection: RegistryCollection,
  value: unknown,
): value is Organization | Personnel | School | Assignment | Activity | MediaNews {
  switch (collection) {
    case 'organizations': return validateOrganization(value);
    case 'personnel': return validatePersonnel(value);
    case 'schools': return validateSchool(value);
    case 'assignments': return validateAssignment(value);
    case 'activities': return validateActivity(value);
    case 'news': return validateMediaNews(value);
  }
}
