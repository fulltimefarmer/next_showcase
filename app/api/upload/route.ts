const MAX_SIZE = 2 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "No file provided." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return Response.json({ error: "Only images are allowed." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return Response.json(
        { error: "File is too large (max 2MB)." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

    return Response.json({ url: dataUrl });
  } catch {
    return Response.json({ error: "Upload failed." }, { status: 500 });
  }
}
