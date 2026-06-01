export default async function handler(req: any, res: any) {
  try {
    const fileUrl = req.query.url;

    if (!fileUrl) {
      return res.status(400).send("Missing url");
    }

    const fileRes = await fetch(fileUrl);

    const text = await fileRes.text();

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");

    return res.status(200).send(text);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
}
