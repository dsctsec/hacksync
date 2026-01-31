import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import { promises as fs } from "fs";

class VeoService {
  private auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  private readonly projectId = "hacksync-484316";
  private readonly location = "us-central1";
  private readonly model = "veo-3.1-fast-generate-001";
  private readonly publicMediaRoot = path.resolve(process.cwd(), "public", "veo");
  private readonly execFileAsync = promisify(execFile);
  private get baseUrl() {
    const port = process.env.PORT || "3000";
    return process.env.BASE_URL || `http://localhost:${port}`;
  }

  private get predictUrl() {
    return `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}:predictLongRunning`;
  }

  private get fetchOperationUrl() {
    return `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}:fetchPredictOperation`;
  }

  /* =========================
     PUBLIC ENTRY
  ========================== */

  tunePrompt(request: any): any {
    return request?.prompt ?? "";
  }

  async generateVideo(_request?: any): Promise<{ videoUri: string }> {
    const accessToken = await this.getAccessToken();

    // 1️⃣ START OPERATION (predictLongRunning)
    const startPayload = {
      instances: [
        {
          prompt:
            "A cinematic coffee shop video set in the early morning. Warm golden sunlight streams through large café windows. Slow-motion close-ups of coffee beans falling into a grinder, steam rising as hot water pours over dark coffee grounds. A barista creates latte art with smooth, flowing motion. Shallow depth of field, warm earthy tones, soft background bokeh. Calm, premium, inviting atmosphere.",
        },
      ],
      parameters: {
        storageUri: "gs://hacksync-veo-videos/veo/",
        sampleCount: 1,
        resolution: "1080p",
      },
    };

    const startRes = await axios.post(this.predictUrl, startPayload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

  const startData = startRes.data as { name?: string };
  const operationName = startData?.name;
    if (!operationName) {
      throw new Error("predictLongRunning did not return operation name");
    }

    console.log("Veo operation name:", operationName);

    // 2️⃣ POLL USING fetchPredictOperation
    const finalResult = await this.fetchPredictOperation(
      operationName,
      accessToken
    );

    // 3️⃣ EXTRACT RESULT (exact structure you provided)
    const videoUri = finalResult?.response?.videos?.[0]?.gcsUri;

    if (!videoUri) {
      throw new Error("Veo finished but no video URI found");
    }

    const { publicUrl } = await this.downloadGcsVideo(videoUri);

    return { videoUri: publicUrl };
  }

  /* =========================
     POLLING — fetchPredictOperation
  ========================== */

  private async fetchPredictOperation(
    operationName: string,
    accessToken: string
  ): Promise<any> {
    while (true) {
      const res = await axios.post(
        this.fetchOperationUrl,
        {
          operationName,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data as {
        name?: string;
        done?: boolean;
        response?: {
          videos?: Array<{
            gcsUri?: string;
            mimeType?: string;
          }>;
        };
      };

      // ✅ Check EXACT condition you specified
      if (data?.done === true) {
        return data;
      }

      // ⏱ wait exactly 5 seconds
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  private async downloadGcsVideo(gcsUri: string): Promise<{ publicUrl: string }>
  {
    const filename = path.basename(gcsUri);
    await fs.mkdir(this.publicMediaRoot, { recursive: true });
    const destination = path.join(this.publicMediaRoot, filename);

    await this.execFileAsync("gsutil", ["cp", gcsUri, destination]);

    // Use API proxy endpoint for better CORS handling
    return {
      publicUrl: `${this.baseUrl}/api/veo/video/${filename}`,
    };
  }

  /* =========================
     AUTH
  ========================== */

  private async getAccessToken(): Promise<string> {
    const client = await this.auth.getClient();
    const token = await client.getAccessToken();

    if (!token.token) {
      throw new Error("Failed to obtain OAuth access token");
    }

    return token.token;
  }
}

export default new VeoService();
