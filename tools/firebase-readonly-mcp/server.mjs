import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleAuth } from 'google-auth-library';
import { z } from 'zod';

const PROJECT_ID = (process.env.FIREBASE_PROJECT_ID || 'darebpp').trim();
if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(PROJECT_ID)) {
  throw new Error('FIREBASE_PROJECT_ID is not a valid-looking Google Cloud project ID.');
}

// This server intentionally exposes only read operations. Admin SDK calls bypass
// Firestore Security Rules; access is governed by the Google identity's IAM roles.
initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
const db = getFirestore();
const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
const server = new McpServer({ name: 'darebpp-firebase-readonly', version: '1.0.0' });

function result(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

server.tool(
  'firebase_project_identity',
  'Read-only: verify the configured Google Cloud/Firebase project identity. Returns project metadata only.',
  {},
  async () => {
    const client = await auth.getClient();
    const response = await client.request({
      url: `https://cloudresourcemanager.googleapis.com/v3/projects/${encodeURIComponent(PROJECT_ID)}`,
      method: 'GET'
    });
    const p = response.data || {};
    return result({
      configuredProjectId: PROJECT_ID,
      returnedProjectId: p.projectId || null,
      projectNumber: p.projectNumber || null,
      displayName: p.displayName || null,
      state: p.state || null,
      matchesConfiguredId: p.projectId === PROJECT_ID,
      note: 'This verifies project metadata only; it does not prove Firestore collection access.'
    });
  }
);

server.tool(
  'firestore_list_collection_ids',
  'Read-only: list top-level Firestore collection IDs only. Does not return document contents.',
  {},
  async () => {
    const collections = await db.listCollections();
    return result({
      projectId: PROJECT_ID,
      collectionIds: collections.map((c) => c.id).sort(),
      count: collections.length,
      note: 'Admin SDK is used; IAM governs this operation and Firestore Security Rules are bypassed.'
    });
  }
);

server.tool(
  'firestore_collection_document_count',
  'Read-only: count documents in one explicitly named top-level collection. Returns a count only, no document fields.',
  { collectionId: z.string().min(1).max(120).regex(/^[^/]+$/, 'Use a top-level collection ID, not a path.') },
  async ({ collectionId }) => {
    const collection = db.collection(collectionId);
    const snapshot = await collection.count().get();
    return result({
      projectId: PROJECT_ID,
      collectionId,
      documentCount: snapshot.data().count,
      note: 'Count only; Admin SDK bypasses Firestore Security Rules and access is controlled by IAM.'
    });
  }
);

server.tool(
  'firestore_check_collection_access',
  'Read-only: check whether the configured identity can execute a count query on a named top-level collection. Returns only allow/deny, count if allowed, and a sanitized error code/message.',
  { collectionId: z.string().min(1).max(120).regex(/^[^/]+$/, 'Use a top-level collection ID, not a path.') },
  async ({ collectionId }) => {
    try {
      const snapshot = await db.collection(collectionId).count().get();
      return result({ projectId: PROJECT_ID, collectionId, access: 'allowed', documentCount: snapshot.data().count, operation: 'read-only aggregate count' });
    } catch (error) {
      const e = error instanceof Error ? error : new Error(String(error));
      return result({ projectId: PROJECT_ID, collectionId, access: 'denied_or_unavailable', errorName: e.name, errorCode: e.code || null, message: e.message.slice(0, 500), operation: 'read-only aggregate count' });
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
