export default async function handler(req: any, res: any) {
  try {
    const fileUrl = req.query.url;

    if (typeof fileUrl !== "string") {
      return res.status(400).send("Missing url");
    }

    const fileRes = await fetch(fileUrl);

    if (!fileRes.ok) {
      return res.status(fileRes.status).send("Failed to fetch file");
    }

    const arrayBuffer = await fileRes.arrayBuffer();
    const text = new TextDecoder("utf-8").decode(arrayBuffer);

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "public, max-age=3600");

    return res.status(200).send(text);
  } catch (error) {
    console.error("VIEW FILE ERROR:", error);
    return res.status(500).send("Internal Server Error");
  }
}
