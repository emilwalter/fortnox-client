import axios from "axios";
import { FortnoxError } from "./fortnoxError";

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

  private async refreshAccessToken(): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: Date;
  }> {
    const Credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64");

    try {
      // Request new tokens from Fortnox using the refresh token
      const tokenResponse = await axios.post(
        `${this.baseURL}token`,
        `grant_type=refresh_token&refresh_token=${this.refreshToken}`,
        {
          headers: {
            "Content-type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Credentials}`,
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

      return {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiresIn: expires_in,
        expiresAt: this.expiresAt,
      };
    } catch (error: any) {
      if (error.response && error.response.status) {
        const statusCode = error.response.status;

        if (
          statusCode === 400 &&
          error.response.data &&
          error.response.data.error_description === "Invalid refresh token"
        ) {
          throw new FortnoxError(
            "Invalid refresh token",
            statusCode,
            undefined,
            error
          );
        } else if (statusCode === 429) {
          throw new FortnoxError(
            "Too many requests, please try again later",
            statusCode,
            undefined,
            error
          );
        }
      }

      console.error("Error refreshing access token:", error);
      throw error;
    }
  }

  private setExpiration(expiresIn: number) {
    this.expiresAt = new Date(Date.now() + expiresIn * 1000);
  }

  public async getToken(): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: Date;
  }> {
    if (this.isTokenExpired()) {
      return await this.refreshAccessToken();
    }
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresIn: Math.floor((this.expiresAt.getTime() - Date.now()) / 1000),
      expiresAt: this.expiresAt,
    };
  }

  private isTokenExpired(): boolean {
    const nineMinutesInMilliseconds = 9 * 60 * 1000;
    return this.expiresAt.getTime() - Date.now() <= nineMinutesInMilliseconds;
  }
}

export default TokenManager;
