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

    let contentType =
      fileRes.headers.get("content-type") || "application/octet-stream";

    if (contentType.startsWith("text/") && !contentType.includes("charset")) {
      contentType = `${contentType}; charset=utf-8`;
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "public, max-age=3600");

    return res.status(200).send(new Uint8Array(arrayBuffer));
  } catch (error) {
    console.error("VIEW FILE ERROR:", error);
    return res.status(500).send("Internal Server Error");
  }
}
