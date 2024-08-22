import { Injectable } from "@nestjs/common";
import axios from "axios";
import { JWT } from 'google-auth-library';
import { GooglePlace } from "./model/google.place";

const {
  GOOGLE_PLACES_URL,
  GOOGLE_API_KEY,
  FCM_CLIENT_EMAIL,
  FCM_PRIVATE_KEY,
  FCM_SERVER_URL,
  FCM_SERVICE_SCOPE
} = process.env

@Injectable()
export class GoogleService {

  /**
   * Get Google Access Token for Push
   * @returns 
   */
  private async getAccessToken(): Promise<string> {
    const client = new JWT({
      email: FCM_CLIENT_EMAIL,
      key: FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: [FCM_SERVICE_SCOPE],
    });

    try {
      const response = await client.authorize();
      return response.access_token;
    } catch (error) {
      return null;
    }
  }

  /**
   * Search location / Address
   * @param query 
   * @returns 
   */
  async search(query: string): Promise<GooglePlace[]> {
    try {
      const response = await axios.get(`${GOOGLE_PLACES_URL}place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}`)
      return response.data.status === 'OK' ? response.data.results : []

    } catch (error) {
      return null
    }
  }

  /**
   * 
   * @param payload 
   * @returns 
   */
  private async push(payload: any) {
    const accessToken = await this.getAccessToken();

    if (!accessToken) return null;

    try {
      const result = await axios.post(FCM_SERVER_URL, payload, {
        headers: {
          Accept: 'application/json, */*',
          'Content-type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return result.data;
    } catch (_) {
      return null;
    }
  }

  /**
   * Send push to a device using its token
   * @param title 
   * @param data 
   * @param body 
   * @param deviceToken 
   * @returns 
   */
  async pushOne(title: string, data: {}, body: {}, device: string) {
    const payload = {
      message: {
        token: device,
        notification: { title, body },
        data
      }
    }

    return await this.push(payload)
  }

  /**
   * Sends push to a topic
   * @param title 
   * @param data 
   * @param body 
   * @param topic 
   * @returns 
   */
  async pushTopic(title: string, data: {}, body: {}, topic: string) {
    const payload = {
      message: {
        topic: topic,
        notification: { title, body },
        data
      }
    }

    return await this.push(payload)
  }

}
