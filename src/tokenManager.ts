import axios from "axios";

class TokenManager {
  private accessToken: string;
  private refreshToken: string;
  private baseURL: string = "https://apps.fortnox.se/oauth-v1/";
  private clientId: string;
  private clientSecret: string;
  private expiresAt!: Date;

  constructor(
    initialAccessToken: string,
    initialRefreshToken: string,
    initialExpiresIn: number,
    clientId: string,
    clientSecret: string
  ) {
    this.accessToken = initialAccessToken;
    this.refreshToken = initialRefreshToken;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.setExpiration(initialExpiresIn);
  }

  private setExpiration(expiresIn: number) {
    this.expiresAt = new Date(Date.now() + expiresIn * 1000);
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const Credentials = Buffer.from(
        `${this.clientId}:${this.clientSecret}`
      ).toString("base64");

      const tokenResponse = await axios.post(
        `${this.baseURL}token`,
        `grant_type=refresh_token&refresh_token=${this.refreshToken}`,
        {
          headers: {
            Authorization: `Basic ${Credentials}`,
            "Content-type": "application/x-www-form-urlencoded",
          },
        }
      );

      const {
        access_token,
        refresh_token: new_refresh_token,
        expires_in,
      } = tokenResponse.data;

      this.accessToken = access_token;
      this.refreshToken = new_refresh_token;
      this.setExpiration(expires_in);
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      throw new Error("Failed to refresh access token");
    }
  }

  public async getToken(): Promise<string> {
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }
    return this.accessToken;
  }

  private isTokenExpired(): boolean {
    if (!this.expiresAt) return true;
    return this.expiresAt.getTime() <= Date.now();
  }
}

export default TokenManager;
