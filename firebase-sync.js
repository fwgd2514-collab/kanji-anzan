(() => {
  "use strict";

  const SDK_VERSION = "12.16.0";
  const SKILL_MODES = [
    "write",
    "read",
    "math",
    "flash",
    "memory",
    "digits",
  ];
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

  function learnerSkillDocument(name, mode) {
    const current = settings();
    return firestoreApi.doc(
      firestore,
      "nobiru_groups",
      current.groupId,
      "learners",
      learnerId(name),
      "skills",
      mode,
    );
  }

  async function loadProfiles(names) {
    await initialize();
    if (!firestore) return {};
    const pairs = await Promise.all(
      names.map(async (name) => {
        const [profileSnapshot, ...skillSnapshots] = await Promise.all([
          firestoreApi.getDoc(learnerDocument(name)),
          ...SKILL_MODES.map((mode) =>
            firestoreApi.getDoc(learnerSkillDocument(name, mode)),
          ),
        ]);
        const skills = {};
        SKILL_MODES.forEach((mode, index) => {
          const snapshot = skillSnapshots[index];
          if (snapshot.exists()) skills[mode] = snapshot.data();
        });
        if (!profileSnapshot.exists() && !Object.keys(skills).length) {
          return [name, null];
        }
        return [
          name,
          {
            ...(profileSnapshot.exists() ? profileSnapshot.data() : {}),
            skills,
          },
        ];
      }),
    );
    return Object.fromEntries(pairs);
  }

  async function saveProfile(name, profile, changedMode = "") {
    await initialize();
    if (!firestore) return;
    const updatedAt = Math.max(
      0,
      Math.floor(Number(profile.updatedAt) || Date.now()),
    );
    const modesToSave = SKILL_MODES.includes(changedMode)
      ? [changedMode]
      : SKILL_MODES;
    await Promise.all([
      firestoreApi.setDoc(learnerDocument(name), {
        displayName: String(name).slice(0, 20),
        streak: Math.max(0, Math.min(9999, Number(profile.streak) || 0)),
        updatedAt,
        schemaVersion: 3,
      }),
      ...modesToSave.map((mode) => {
        const skill = profile.skills?.[mode] || {};
        return firestoreApi.setDoc(learnerSkillDocument(name, mode), {
          level: Math.min(100, Math.max(1, Math.floor(Number(skill.level) || 1))),
          xp: Math.min(100, Math.max(0, Math.floor(Number(skill.xp) || 0))),
          updatedAt: Math.max(
            0,
            Math.floor(Number(skill.updatedAt) || updatedAt),
          ),
        });
      }),
    ]);
  }

  window.NobiruCloud = {
    isConfigured,
    initialize,
    loadProfiles,
    saveProfile,
  };
})();
