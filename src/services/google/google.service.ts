import { Injectable } from "@nestjs/common"
import { JWT } from 'google-auth-library'
import { GooglePlace } from "./model/google.place"
import { Network } from "../network";
import Axios from 'axios'
import * as dayjs from 'dayjs'
import { CacheService } from "../cache/cache.service";
import { Failure, Result, Success } from "src/core/util/result";

const {
  GOOGLE_PLACES_URL,
  GOOGLE_API_KEY,
  FCM_CLIENT_EMAIL,
  FCM_PRIVATE_KEY,
  FCM_SERVER_URL,
  FCM_PRIVATE_KEY_ID,
  FCM_SERVICE_SCOPE,
  FCM_TOKEN_TIME_TRACKER
} = process.env

@Injectable()
export class GoogleService {

  constructor(private readonly cache: CacheService) { }

  private async getToken(): Promise<string> {
    const time = await this.cache.get(FCM_TOKEN_TIME_TRACKER);
    const now = new Date().toISOString()

    const dateTime = dayjs(time)
    const nowTime = dayjs(now)

    const diff = nowTime.diff(dateTime, 'minute');

    const token = await this.cache.get(FCM_PRIVATE_KEY_ID);
    return diff > 55 ? null : token;
  }

  /**
   * Get Google Access Token for Push
   * @returns 
   */
  private async getAccessToken(): Promise<Result> {
    const cachedToken = await this.getToken();
    if (cachedToken) new Success(cachedToken)

    const client = new JWT({
      email: FCM_CLIENT_EMAIL,
      key: FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: [FCM_SERVICE_SCOPE],
    });

    try {
      const response = await client.authorize();

      await this.cache.set(FCM_PRIVATE_KEY_ID, response.access_token);
      await this.cache.set(FCM_TOKEN_TIME_TRACKER, new Date().toISOString());

      return new Success(response.access_token)
    } catch (error) {
      return new Success(error.response.data)
    }
  }

  /**
   * Search location / Address
   * @param query 
   * @returns 
   */
  async search(query: string): Promise<Result> {
    try {
      const response = await Network.get(`${GOOGLE_PLACES_URL}place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}`)
      return new Success(response.data.status === 'OK' ? response.data.results : [])
    } catch (error) {
      return new Failure(error.response.data)
    }
  }

  /**
   * 
   * @param payload 
   * @returns 
   */
  private async push(payload: any) {
    const tokenResult = await this.getAccessToken();

    if (tokenResult.error) return tokenResult

    try {
      const result = await Axios.post(FCM_SERVER_URL, payload, {
        headers: {
          Accept: 'application/json, */*',
          'Content-type': 'application/json',
          Authorization: `Bearer ${tokenResult.data}`,
        },
      });

      return new Success(result.data)
    } catch (error) {
      return new Failure(error.response.data)
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
  async pushOne(title: string, body: string, device: string, data: {}): Promise<Result> {
    const payload = {
      'message': {
        'token': device,
        'notification': { 'title': title, 'body': body },
        'data': data
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
  async pushTopic(title: string, data: {}, body: string, topic: string): Promise<Result> {
    const payload = {
      'message': {
        'topic': topic,
        'notification': { 'title': title, 'body': body },
        'data': data
      }
    }

    console.log(payload)
    return await this.push(payload)
  }

}
