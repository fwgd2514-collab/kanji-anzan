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
  let firebaseAuth = null;
  let authApi = null;
  let initializing = null;

  function sanitizeGroupId(value, fallback = "nobiru-family-01", maxLength = 80) {
    const sanitized = String(value || "")
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, maxLength);
    return sanitized || fallback;
  }

  function settings() {
    const root = window.NOBIRU_FIREBASE || {};
    const firebaseConfig = root.firebaseConfig || {};
    const defaultGroupId = sanitizeGroupId(root.groupId || "nobiru-family-01");
    const requestedGroupId = new URLSearchParams(window.location.search).get("group");
    const hasRequestedGroup = Boolean(String(requestedGroupId || "").trim());
    const groupId = hasRequestedGroup
      ? sanitizeGroupId(requestedGroupId, "invalid-group", 40)
      : defaultGroupId;
    const isDefaultGroup = groupId === defaultGroupId;
    const emailDomain = String(root.groupEmailDomain || "nobiru.example")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "") || "nobiru.example";
    return {
      enabled: root.enabled === true,
      defaultGroupId,
      groupId,
      isDefaultGroup,
      nameMode: isDefaultGroup ? "file" : "registration",
      authRequired: !isDefaultGroup,
      authEmail: `${groupId.toLowerCase()}@${emailDomain}`,
      firebaseConfig,
    };
  }

  function getGroupInfo() {
    const current = settings();
    return {
      defaultGroupId: current.defaultGroupId,
      groupId: current.groupId,
      isDefaultGroup: current.isDefaultGroup,
      nameMode: current.nameMode,
      authRequired: current.authRequired,
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

  async function waitForAuthState() {
    if (!firebaseAuth || !authApi) return;
    if (typeof firebaseAuth.authStateReady === "function") {
      await firebaseAuth.authStateReady();
      return;
    }
    await new Promise((resolve) => {
      let unsubscribe = () => {};
      unsubscribe = authApi.onAuthStateChanged(firebaseAuth, () => {
        unsubscribe();
        resolve();
      });
    });
  }

  async function initialize() {
    const current = settings();
    if (!isConfigured()) return { enabled: false, authenticated: false };
    if (firestore && (!current.authRequired || firebaseAuth)) {
      if (current.authRequired) await waitForAuthState();
      return {
        enabled: true,
        authRequired: current.authRequired,
        authenticated: !current.authRequired || Boolean(firebaseAuth?.currentUser),
      };
    }
    if (initializing) return initializing;

    initializing = (async () => {
      const appApi = await import(
        `https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app.js`
      );
      firestoreApi = await import(
        `https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore.js`
      );
      if (current.authRequired) {
        authApi = await import(
          `https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-auth.js`
        );
      }
      const existing = appApi.getApps().find((app) => app.name === "nobiru-sync");
      const firebaseApp =
        existing || appApi.initializeApp(current.firebaseConfig, "nobiru-sync");
      firestore = firestoreApi.getFirestore(firebaseApp);
      if (current.authRequired) {
        firebaseAuth = authApi.getAuth(firebaseApp);
        await waitForAuthState();
      }
      return {
        enabled: true,
        authRequired: current.authRequired,
        authenticated: !current.authRequired || Boolean(firebaseAuth?.currentUser),
      };
    })();

    try {
      return await initializing;
    } finally {
      initializing = null;
    }
  }

  function requireAuthorizedGroup() {
    const current = settings();
    if (current.authRequired && !firebaseAuth?.currentUser) {
      throw new Error("GROUP_AUTH_REQUIRED");
    }
  }

  async function signIn(password) {
    const current = settings();
    const connection = await initialize();
    if (!connection.enabled) throw new Error("FIREBASE_NOT_CONFIGURED");
    if (!current.authRequired) return { authenticated: true };
    const credential = await authApi.signInWithEmailAndPassword(
      firebaseAuth,
      current.authEmail,
      String(password || ""),
    );
    return { authenticated: Boolean(credential.user) };
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

  async function loadLearnerNames() {
    await initialize();
    if (!firestore) return [];
    requireAuthorizedGroup();
    const current = settings();
    const learnerCollection = firestoreApi.collection(
      firestore,
      "nobiru_groups",
      current.groupId,
      "learners",
    );
    const snapshot = await firestoreApi.getDocs(learnerCollection);
    return [...new Set(
      snapshot.docs
        .map((documentSnapshot) => String(documentSnapshot.data()?.displayName || "").trim())
        .filter(Boolean),
    )].sort((a, b) => a.localeCompare(b, "ja"));
  }

  async function loadProfiles(names) {
    await initialize();
    if (!firestore) return {};
    requireAuthorizedGroup();
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
    requireAuthorizedGroup();
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
        lastStudiedAt: Math.max(
          0,
          Math.floor(Number(profile.lastStudiedAt) || 0),
        ),
        updatedAt,
        schemaVersion: 4,
      }),
      ...modesToSave.map((mode) => {
        const skill = profile.skills?.[mode] || {};
        return firestoreApi.setDoc(learnerSkillDocument(name, mode), {
          level: Math.min(120, Math.max(1, Math.floor(Number(skill.level) || 1))),
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
    getGroupInfo,
    isConfigured,
    initialize,
    signIn,
    loadLearnerNames,
    loadProfiles,
    saveProfile,
  };
})();
