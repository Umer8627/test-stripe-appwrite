// src/main.js
export default async ({ req, res, log, error }) => {
  try {
    log(`Function started ✅ method=${req.method}`);

    // Simple GET health check
    if (req.method === 'GET') {
      return res.json({ ok: true, message: 'Hello from Appwrite 🚀' });
    }

    // For SDK/POST calls, echo back the JSON body
    let data = {};
    try {
      data = req.bodyJson ?? {};
    } catch (_) {
      data = {};
    }

    return res.json({ ok: true, method: req.method, data });
  } catch (e) {
    error(String(e));
    // keep it simple; default 200 is fine for quick test
    return res.json({ ok: false, error: String(e) });
  }
};
