import { Injectable } from "@nestjs/common";
import axios from "axios";
import { GooglePlace } from "./model/google.place";

const GOOGLE_PLACES_URL = process.env.GOOGLE_PLACES_URL
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

@Injectable()
export class GoogleService {

  async search(query: string): Promise<GooglePlace[]> {
    try {
      const response = await axios.get(`${GOOGLE_PLACES_URL}place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}`)
      return response.data.status === 'OK' ? response.data.results : []

    } catch (error) {
      return null
    }
  }
}