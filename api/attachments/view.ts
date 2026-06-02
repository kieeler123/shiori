export default async function handler(req: any, res: any) {
  try {
    const fileUrl = req.query.url;
    const type = req.query.type;

    if (!fileUrl || typeof fileUrl !== "string") {
      return res.status(400).send("Missing url");
    }

    const fileRes = await fetch(fileUrl);

    if (!fileRes.ok) {
      return res.status(fileRes.status).send("Failed to fetch file");
    }

    if (type === "pdf") {
      const arrayBuffer = await fileRes.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'inline; filename="attachment.pdf"');
      res.setHeader("Cache-Control", "private, max-age=600");
      res.setHeader("Content-Length", String(uint8Array.byteLength));

      res.statusCode = 200;
      return res.end(uint8Array);
    }

    const text = await fileRes.text();

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    return res.status(200).send(text);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
}
