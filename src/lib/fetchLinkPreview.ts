type LinkPreviewResult = {
  url: string;
  title: string;
  description?: string | null;
  image?: string | null;
  siteName?: string | null;
};

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("EMPTY_URL");

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  return new URL(candidate).toString();
}

function extractYoutubeId(input: string): string | null {
  try {
    const url = new URL(input);

    if (url.hostname.includes("youtu.be")) {
      return url.pathname.slice(1) || null;
    }

    if (url.hostname.includes("youtube.com")) {
      return url.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

function buildYoutubePreview(url: string, videoId: string): LinkPreviewResult {
  return {
    url,
    title: "YouTube Video",
    description: null,
    image: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    siteName: "YouTube",
  };
}

export async function fetchLinkPreview(
  rawUrl: string,
): Promise<LinkPreviewResult> {
  const url = normalizeUrl(rawUrl);

  const youtubeId = extractYoutubeId(url);
  if (youtubeId) {
    return buildYoutubePreview(url, youtubeId);
  }

  const res = await fetch(
    `https://api.microlink.io/?url=${encodeURIComponent(url)}`,
  );

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      url,
      title: url,
      description: null,
      image: null,
      siteName: null,
    };
  }

  if (!json?.status || json.status !== "success" || !json?.data) {
    return {
      url,
      title: url,
      description: null,
      image: null,
      siteName: null,
    };
  }

  const data = json.data;

  return {
    url,
    title: data.title || url,
    description: data.description ?? null,
    image: data.image?.url ?? null,
    siteName: data.publisher ?? data.author ?? null,
  };
}
