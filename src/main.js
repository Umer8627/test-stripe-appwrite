export default async ({ req, res, log, error }) => {
  log("Hello World function triggered ✅");
  return res.text("Hello World");
};
