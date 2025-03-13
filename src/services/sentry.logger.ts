import * as Sentry from "@sentry/nestjs"
require('dotenv').config()
// initialise sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
})
