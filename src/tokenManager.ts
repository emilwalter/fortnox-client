import axios from "axios";

class TokenManager {
  private accessToken: string;
  private refreshToken: string;
  private baseURL: string = "https://apps.fortnox.se/oauth-v1/";
  private clientId: string;
  private clientSecret: string;
  private expiresAt: Date;

  constructor(
    initialAccessToken: string,
    initialRefreshToken: string,
    initialExpiresAt: Date,
    clientId: string,
    clientSecret: string
  ) {
    this.accessToken = initialAccessToken;
    this.refreshToken = initialRefreshToken;
    this.expiresAt = initialExpiresAt;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async refreshAccessToken(): Promise<void> {
    const Credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64");

    // Request new tokens from Fortnox using the refresh token
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

    // Update the class properties
    this.accessToken = access_token;
    this.refreshToken = new_refresh_token;

    // Update the expiration timestamp using the new expiresIn value
    this.setExpiration(expires_in);
  }

  private setExpiration(expiresIn: number) {
    this.expiresAt = new Date(Date.now() + expiresIn * 1000);
  }

  public async getToken(): Promise<string> {
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }
    return this.accessToken;
  }

  private isTokenExpired(): boolean {
    return this.expiresAt.getTime() <= Date.now();
  }
}

export default TokenManager;
