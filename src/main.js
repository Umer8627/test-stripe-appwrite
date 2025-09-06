module.exports = async function (req, res) {
  console.log("Function started ✅", req.method);

  try {
    if (req.method === "GET") {
      return res.json({ success: true, message: "Hello from Appwrite 🚀" });
    }

    const data = JSON.parse(req.body || "{}");
    res.json({ success: true, data });
  } catch (err) {
    console.error("Function Error:", err);
    res.status(500).json({ error: err.message });
  }
};
