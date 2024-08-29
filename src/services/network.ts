import { setupCache } from 'axios-cache-interceptor'
import Axios from 'axios'

const instance = Axios.create()
export const Network = setupCache(instance)

