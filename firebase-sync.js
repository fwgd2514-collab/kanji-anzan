(() => {
  "use strict";

  const SDK_VERSION = "12.16.0";
  let firestore = null;
  let firestoreApi = null;
  let initializing = null;

  function settings() {
    const root = window.NOBIRU_FIREBASE || {};
    const firebaseConfig = root.firebaseConfig || {};
    return {
      enabled: root.enabled === true,
      groupId: String(root.groupId || "nobiru-family-01")
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .slice(0, 80),
      firebaseConfig,
    };
  }

  function isConfigured() {
    const current = settings();
    return Boolean(
      current.enabled &&
        current.groupId &&
        current.firebaseConfig.apiKey &&
        current.firebaseConfig.projectId &&
        current.firebaseConfig.appId,
    );
  }

  function learnerId(name) {
    const bytes = new TextEncoder().encode(String(name));
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  async function initialize() {
    if (!isConfigured()) return { enabled: false };
    if (firestore) return { enabled: true };
    if (initializing) return initializing;

    initializing = (async () => {
      const appApi = await import(
        `https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app.js`
      );
      firestoreApi = await import(
        `https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore.js`
      );
      const existing = appApi.getApps().find((app) => app.name === "nobiru-sync");
      const firebaseApp =
        existing || appApi.initializeApp(settings().firebaseConfig, "nobiru-sync");
      firestore = firestoreApi.getFirestore(firebaseApp);
      return { enabled: true };
    })();

    try {
      return await initializing;
    } finally {
      initializing = null;
    }
  }

  function learnerDocument(name) {
    const current = settings();
    return firestoreApi.doc(
      firestore,
      "nobiru_groups",
      current.groupId,
      "learners",
      learnerId(name),
    );
  }

  async function loadProfiles(names) {
    await initialize();
    if (!firestore) return {};
    const pairs = await Promise.all(
      names.map(async (name) => {
        const snapshot = await firestoreApi.getDoc(learnerDocument(name));
        return [name, snapshot.exists() ? snapshot.data() : null];
      }),
    );
    return Object.fromEntries(pairs);
  }

  async function saveProfile(name, profile) {
    await initialize();
    if (!firestore) return;
    await firestoreApi.setDoc(learnerDocument(name), {
      displayName: String(name).slice(0, 20),
      level: Math.min(100, Math.max(1, Number(profile.level) || 1)),
      xp: Math.min(100, Math.max(0, Number(profile.xp) || 0)),
      streak: Math.max(0, Math.min(9999, Number(profile.streak) || 0)),
      updatedAt: Math.max(0, Math.floor(Number(profile.updatedAt) || Date.now())),
    });
  }

  window.NobiruCloud = {
    isConfigured,
    initialize,
    loadProfiles,
    saveProfile,
  };
})();
